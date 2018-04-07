var fs = require('fs');

dbClient.prototype.insertDocument = function (doc) {
    fs.appendFile(require('app-root-path').resolve(this.dbfile), JSON.stringify(doc) + '\n', 'utf8',
       function (err) {
            if (err) throw err;
            // if no error
            console.log("Link is appended to file successfully.")
        });
};

function dbClient(dbconfig) {

    if (!(this instanceof dbClient)) {
        return new dbClient(dbconfig);
    }

    this.config = dbconfig;
    this.isDebug = true;
    this.dbfile = `/data/${this.config.databaseId}.${this.config.collectionId}.json`;
}

module.exports = dbClient;