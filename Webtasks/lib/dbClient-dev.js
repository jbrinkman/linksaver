
dbClient.prototype.insertDocument = function (doc) {
    //TODO: Add code to append this to a local text file
    
    console.log(`Document: ${doc}`);
}; 

function dbClient(dbconfig) {

    if (!(this instanceof dbClient)) {
        return new dbClient(dbconfig);
    }

    this.config = dbconfig;
    this.isDebug = true;
}

module.exports = dbClient; 