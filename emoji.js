var emoji = require('node-emoji');
var fetch = require('node-fetch');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function factoids( title ) {
  const { stdout, stderr } = await exec('python3 wiki-summarizer/get.py "' + title + '"');
  return {
    url: `https://wikipedia.org/wiki/${title}`,
    text: stdout
  }
}

async function translate(e) {
  let val = '';
  for( let i = 0; i < e.length; i++) {
    let emoj = emoji.find(e[i]);
    if ( emoj ) {
      val += emoj.key.replace(/_/g, ' ') + ' ';
    }
  }

  if ( val ) {
    const a = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=&formatversion=2&list=search&srsearch=${val}`);
    const json = await a.json();
    if ( json.query.search.length ) {
      return factoids(json.query.search[0].title);
    } else {
      return false;
    }
  } else {
    return false;
  }
}

async function printFact(emoji) {
  fact = await translate(emoji);
  console.log(emoji)
  console.log(fact.text);
  console.log(fact.url)
}

printFact(process.argv.slice(2));

