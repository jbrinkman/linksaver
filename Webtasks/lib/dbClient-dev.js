var jsonfile = require('jsonfile');

dbClient.prototype.insertDocument = function (doc) {
    var file = require('app-root-path').resolve(this.dbfile);
    jsonfile.readFile(file,
        function (err, db) {
            if (err) throw err;
            console.log(db.length);
            db.push(doc);
            jsonfile.writeFile(file,
                db, {
                    spaces: 4
                },
                function (err) {
                    if (err) throw err;
                    // if no error
                    console.log("Link is appended to file successfully.")
                });
        }
    );
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