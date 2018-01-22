var DocumentDBClient = require('documentdb').DocumentClient
  , _ = require('underscore')
  , databaseId = 'linkmuseum'
  , collectionId = 'link'
  , dbLink
  , collLink;

function insertDocument(client, doc) {
  var createdList = [];

  dbLink = 'dbs/' + databaseId;
  console.log(dbLink);

  collLink = dbLink + '/colls/' + collectionId;
  console.log(collLink);
  
  client.createDocument(collLink, doc, function (err, document) {
    if (err) {
      console.log(err);
    } else {
      console.log('created ' + document.id);
      createdList.push(document);
    }
  });
}

function shortUrl(num)
{
  // Remove i, l and o to avoid letters which might be confused with numbers.
  var chars = '0123456789abcdefghjkmnpqrstuvwxyz'
    , nbase = 33
    , newNumber = ''
    , r;

  // in r we have the offset of the char that was converted to the new base
  while (num >= nbase) {
    r = num % nbase;
    newNumber = chars[r] + newNumber;
    num = num / nbase;
  }
  // the last number to convert
  newNumber = chars[num] + newNumber;

  return newNumber;
}

module.exports = function (context, cb) {
  console.log(context.body);
  var defaults = { 
    saveDate: new Date().toISOString(),
    blogged: false,
    tweeted: false
  } 

  var client = new DocumentDBClient(context.secrets.endpoint, { masterKey: context.secrets.authKey });

  if (context.body === undefined) {
    cb(null, 'undefined');
  }

  // Whitelist the json payload that we will accept.
  // Should find a better deserializer that would handle this based on a schema
  var document = _.pick(context.body, ['link','title', 'author', 'category']);
  document.link = _.pick(document.link, ['longUrl', 'shortUrl', 'customUrl']);
  
  document = _.extend(document, defaults);
  
  insertDocument(client, document);

  cb(null, 'Hello'); 
};