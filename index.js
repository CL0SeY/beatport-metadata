const fs = require('fs');
const { parse } = require('himalaya');
const superagent = require('superagent');
const digits = /^\d{7}/m;

const verbose = process.argv[2] === "-v"
const skip = process.argv[2] === "-s"
const json = process.argv[2] === "-j"
const dirArg = (verbose || skip || json) ? 3 : 2
let tracks = [];
if (process.argv.length - 1 > dirArg) {
  console.error('Bad syntax.')
} else {
  tracks = fs.readdirSync(process.argv[dirArg] || process.env.PWD);
}

const outputJson = {}

const results = tracks.map(async (track) => {
  const m = digits.exec(track);
  if (m) {
    const res = await superagent.get(`https://embed.beatport.com/player/?id=${m[0]}}&type=track`);
    try {
      const html = res.text;
      const json = parse(html);
      const elem = json[1].children[0].children[18]
      outputJson[track] = elem.attributes[1].value
      if (!json) {
        console.log(m[0], elem.attributes[1].value)
      }
      return true;
    } catch (error) {
      if (verbose) {
        console.error(track, error)
      } else if (!skip && !json) {
        console.log(track)
      }
      return false;
    }
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
  }
})
