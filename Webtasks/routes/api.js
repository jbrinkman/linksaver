var router = require('express').Router(),
  _ = require('lodash'),
  getConnection = require('../lib/dbConnection'),
  shortUrl = require('../lib/shortUrl');

// middleware that is specific to this router
router.use(getConnection);

// define the links route
router.route('/links')
  // get all the links (accessed at GET http://localhost:8080/api/links)
  .get(function (req, res) {
    res.send('Hello World!');
  })

  .post(function (req, res, next) {
    var context = req.webtaskContext;

    if (context.body === undefined) {
      return next(new Error('undefined payload'));
    }

    var defaults = {
      saveDate: new Date().toISOString(),
      blogged: false,
      tweeted: false,
    };

    var document = _.pick(context.body, ['link', 'title', 'author', 'category'])
    var urlId;

    context.storage.get(function (err, data) {
      if (err) return next(new Error(err));

      data = data || {
        urlId: 1
      };

      urlId = data.urlId;
      data.urlId += 1;

      // Whitelist the json payload that we will accept.
      // Should find a better deserializer that would handle this based on a schema

      document.link = _.pick(document.link, ['longUrl', 'shortUrl', 'customUrl']);
      document.link.shortUrl = shortUrl(urlId);
      document = _.extend(document, defaults);
      req.dbClient.insertDocument(document);

      context.storage.set(data, function (err) {
        if (err) return next(new Error(err));
      });
    });

  });


module.exports = router;