function dbConnection(req, res, next) {
    var context = req.webtaskContext,
        dbClient = (context.secrets.debug == 'true') ? require('./dbClient-dev') : require('./dbClient'),
        linkDbConfig = {
            databaseId: 'linkmuseum',
            collectionId: 'link',
            endpoint: context.secrets.endpoint,
            authKey: context.secrets.authKey
        };

    req.dbClient = new dbClient(linkDbConfig);
    next()
}

module.exports = dbConnection;