var express = require('express'),
  wt = require('webtask-tools'),
  api = require('./routes/api');

const app = express();

app.use('/api', api);

module.exports = wt.fromExpress(app);