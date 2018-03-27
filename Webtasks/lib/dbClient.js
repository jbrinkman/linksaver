var DocumentDBClient = require('documentdb').DocumentClient;

const argv = process.execArgv.join();
const isDebug = argv.includes('inspect') || argv.includes('debug');
const debug_endpoint = 'https://localhost:8081/';
const debug_authKey = 'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==';

dbClient.prototype.insertDocument = function (doc) {
    let createdList = [];

    let dbLink = 'dbs/' + this.config.databaseId;

    let collLink = dbLink + '/colls/' + this.client.collectionId;
    console.log(collLink);

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

    this.config.endpoint = isDebug ? debug_endpoint : this.config.endpoint;
    this.config.authKey = isDebug ? debug_authKey : this.config.authKey;

    this.client = new DocumentDBClient(this.config.endpoint, { masterKey: this.config.authKey });
}

module.exports = dbClient; 