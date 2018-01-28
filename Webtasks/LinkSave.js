var DocumentDBClient = require('documentdb').DocumentClient;
var _ = require('lodash');
var databaseId = 'linkmuseum';
var collectionId = 'link';
var dbLink;
var collLink;

const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');
const debug_endpoint = 'https://localhost:8081/';
const debug_authKey = 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==';

function insertDocument(client, doc) {
  var createdList = [];

  dbLink = 'dbs/' + databaseId;

  collLink = dbLink + '/colls/' + collectionId;

  client.createDocument(collLink, doc, function(err, document) {
    if (err) {
      console.log(err);
    } else {
      console.log('created ' + document.id);
      createdList.push(document);
    }
  });
}

function shortUrl(num) {
  // Remove i, l and o to avoid letters which might be confused with numbers.
  var chars = '0123456789abcdefghjkmnpqrstuvwxyz',
    nbase = 33,
    newNumber = '',
    r;

  // in r we have the offset of the char that was converted to the new base
  while (num >= nbase) {
    r = num % nbase;
    newNumber = chars[r] + newNumber;
    num = ~~(num / nbase);
  }

  // the last number to convert
  newNumber = chars[num] + newNumber;

  return _.padStart(newNumber, 3, '0');
}

module.exports = function(context, cb) {
  if (context.body === undefined) {
    cb(null, 'undefined');
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

  context.storage.get(function(err, data) {
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

    context.storage.set(data, function(error) {
      if (error) return cb(error);

      cb(null, 'Hello');
    });
  });
};
