var DocumentDBClient = require('documentdb').DocumentClient,
  _ = require('underscore'),
  databaseId = 'linkmuseum',
  collectionId = 'link',
  dbLink,
  collLink;

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength = targetLength >> 0; //truncate if number or convert non-number to 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}

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

  return newNumber.padStart(3, '0');
}

module.exports = function(context, cb) {
  if (context.body === undefined) {
    cb(null, 'undefined');
  }

  var defaults = {
      saveDate: new Date().toISOString(),
      blogged: false,
      tweeted: false,
    },
    client = new DocumentDBClient(context.secrets.endpoint, {
      masterKey: context.secrets.authKey,
    }),
    document = _.pick(context.body, ['link', 'title', 'author', 'category']),
    urlId;

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
