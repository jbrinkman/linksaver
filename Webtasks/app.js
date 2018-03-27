var express = require('express');
var wt = require('webtask-tools');
var dbClient = require('./lib/dbClient');

var linkDbConfig = {
  databaseId: 'linkmuseum',
  collectionId: 'link',
  endpoint: '',
  authKey: ''
};

var linkClient = new dbClient(linkDbConfig);

const app = express();

app.post('/', function (req, res) {
  var context = req.webtaskContext;

  if (context.body === undefined) {
    res.send('undefined');
  }

  var defaults = {
    saveDate: new Date().toISOString(),
    blogged: false,
    tweeted: false,
  };

  var endpoint = isDebug ? debug_endpoint : context.secrets.endpoint;
  var authKey = isDebug ? debug_authKey : context.secrets.authKey;

  var client = new DocumentDBClient(endpoint, {
    masterKey: authKey,
  });
  var document = _.pick(context.body, ['link', 'title', 'author', 'category'])
  var urlId;

  context.storage.get(function (err, data) {
    if (err) return cb(err);

    data = data || { urlId: 1 };
    console.log('Storage: ' + data);

    urlId = data.urlId;
    data.urlId += 1;

    // Whitelist the json payload that we will accept.
    // Should find a better deserializer that would handle this based on a schema

    document.link = _.pick(document.link, ['longUrl', 'shortUrl', 'customUrl']);

    console.log('urlId: ' + urlId);

    document.link.shortUrl = shortUrl(urlId);

    console.log('ShortUrl: ' + document.link.shortUrl);

    document = _.extend(document, defaults);

    insertDocument(client, document);

    context.storage.set(data, function (error) {
      if (error) return cb(error);

      cb(null, 'Hello');
    });
  });
  res.end('Hello, world!');
});

app.get('/', (req, res) => {
  res.end('Hello world!');
});

module.exports = wt.fromExpress(app);