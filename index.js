var emoji = require('node-emoji');
var express = require('express');
var fetch = require('node-fetch');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function factoids( title ) {
  const { stdout, stderr } = await exec('python3 summarizer/get.py "' + title + '"');
  return {
    title: title,
    url: `https://en.wikipedia.org/wiki/${title}`,
    text: stdout
  }
}

async function translate(e) {
  let val = '';
  e = Array.from(e);
  for( let i = 0; i < e.length; i++) {
    let emoj = emoji.find(e[i]);
    if ( emoj ) {
      val += emoj.key.replace(/_/g, ' ') + ' ';
    }
  }

  if ( val ) {
    const a = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageprops&generator=search&formatversion=2&ppprop=disambiguation&gsrsearch=${val}`);
    const json = await a.json();
    const pages = json.query.pages;
    if ( pages.length ) {
      let page = pages[0];
      // if disambiguation get another
      if ( page.pageprops && page.pageprops.disambiguation !== undefined ) {
        page = pages.slice( 1 )[Math.floor(Math.random() * (pages.length - 2))];
      }
      return factoids(page.title);
    } else {
      return false;
    }
  } else {
    return false;
  }
}

async function printFact(emojiStr) {
  const fact = await translate(emojiStr);
  return [
    `<h2>${fact.title}</h2>`,
    `<p>${fact.text}</p>`,
    `<a href="${fact.url}">${fact.url}</a>`
  ].join('\n');
}

const app = express()

function html( body ) {
  return `<!DOCTYPE HTML>
    <html>
      <head>
        <meta name="viewport" content="width=device-width"/>
      </head>
    <body>
      ${body}
    </body>
    </html>`;
}

async function emojiFact( req, res ) {
  var text = await printFact( req.params.emoji );
  res.status( 200 );
  res.header('Content-Type', 'text/html charset=utf-8');
  res.end( text );
}
app.get( '/:emoji', emojiFact );

app.get( '/', function ( req, res ) {
  if ( req.query.emoji ) {
    res.redirect('/' + req.query.emoji);
  } else {
    res.status( 200 );
    res.header('Content-Type', 'text/html charset=utf-8');
    res.end(
      html(
        `<form method="get" action="/">
        <input name="emoji" placeholder="Unleash your emoji">
        <input type="submit">
      </form>`
      )
    );
  }
} );

const port = app.get( 'port' ) || 8142;
app.listen( port )
console.log(`Running on ${port}`)
