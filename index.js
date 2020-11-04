const fs = require('fs');
const path = require('path');
const { parse } = require('himalaya');
const superagent = require('superagent');
const digits = /^\d{7}/m;

const verbose = process.argv[2] === "-v"
const skip = process.argv[2] === "-s"
const json = process.argv[2] === "-j"
const rename = process.argv[2] === "-r"
const renameWithId = process.argv[2] === "-i"
const dirArg = (verbose || skip || json || rename || renameWithId) ? 3 : 2
let directory;
let tracks = [];
if (process.argv.length - 1 > dirArg) {
  console.error('Bad syntax.')
} else {
  directory = process.argv[dirArg] || process.env.PWD
  tracks = fs.readdirSync(directory);
}

const outputJson = {}

const results = tracks.map(async (track) => {
  const m = digits.exec(track);
  const ext = path.extname(track);
  if (m) {
    const res = await superagent.get(`https://embed.beatport.com/player/?id=${m[0]}}&type=track`);
    try {
      const html = res.text;
      const json = parse(html);
      const elem = json[1].children[0].children[18]
      outputJson[track] = elem.attributes[1].value
    } catch (error) {
      if (verbose) {
        console.error(track, error)
      } else if (rename || renameWithId) {
        console.log('Skipped', track)
      } else if (!skip && !json) {
        console.log(track)
      }
      return false;
    }
    if (rename) {
      const newTrack = `${outputJson[track]}${ext}`
      console.log(`Renaming ${track} to ${newTrack}`)
      fs.renameSync(path.join(directory, track), path.join(directory, newTrack))
    } else if (renameWithId) {
      const newTrack = `${m[0]}_${outputJson[track]}${ext}`
      console.log(`Renaming ${track} to ${newTrack}`)
      fs.renameSync(path.join(directory, track), path.join(directory, newTrack))
    } else if (!json) {
      console.log(m[0], outputJson[track])
    }
    return true;
  } else {
    return false;
  }
})
Promise.all(results).then(r => r.filter(x => x).length).then(success => {
  if (json) {
    console.log(outputJson)
  } else if (!success) {
    console.log('No great success in scanning any files.')
    console.log()
    console.log('Usage: index.js [-v|-s|-j] <directory to scan for beatport files>')
    console.log()
    console.log('-v verbose - show errors')
    console.log('-s skip - skip output for files we could not find information for')
    console.log('-j json output - output a simple JSON map of filename: track name')
    console.log('-i WARNING rename, keeping id prefix - rename the file to the standard output of \'1234567_Arist1, Artist2 - Track Title (Whatever Mix) [Record Label]\'. Will skip any files that did not retrieve correctly.')
    console.log('-r DANGER rename without id prefix - rename the file to the format of \'Arist1, Artist2 - Track Title (Whatever Mix) [Record Label]\'. Will skip any files that did not retrieve correctly.')
  }
})
