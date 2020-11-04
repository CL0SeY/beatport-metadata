const fs = require('fs');
const { parse } = require('himalaya');
const superagent = require('superagent');
const digits = /^\d{7}/m;

const tracks = fs.readdirSync(process.argv[2] || process.env.PWD);

const success = false;

tracks.forEach(track => {
  const m = digits.exec(track);
  if (m) {
    const request = superagent
      .get(`https://embed.beatport.com/player/?id=${m[0]}}&type=track`)
      .end((err, res) => {
        try {
          const html = res.text;
          const json = parse(html);
          const elem = json[1].children[0].children[18]
          console.log(m[0], elem.attributes[1].value)
          success = true;
        } catch (error) {
          console.log(track)
        }
      })
  }
});

if (!success) {
  console.log('No great success in scanning any files.')
  console.log()
  console.log('Usage: index.js <directory to scan for beatport files>')
}
