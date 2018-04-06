var DocumentDBClient = require('documentdb').DocumentClient;

dbClient.prototype.insertDocument = function (doc) {
    let createdList = [];

    let dbLink = 'dbs/' + this.config.databaseId;

    let collLink = dbLink + '/colls/' + this.client.collectionId;

    this.client.createDocument(collLink, doc, function (err, document) {
        if (err) {
            console.log(err);
        } else {
            console.log('created ' + document.id);
            createdList.push(document);
        }
    });
}; 

function dbClient(dbconfig) {

    if (!(this instanceof dbClient)) {
        return new dbClient(dbconfig);
    }

    this.config = dbconfig;
    this.client = new DocumentDBClient(this.config.endpoint, { masterKey: this.config.authKey });
    this.isDebug = false;
}

module.exports = dbClient; 