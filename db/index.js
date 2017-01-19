var pg = require('pg');

var client = new pg.Client('postgres://localhost/twitterdb');

client.connect();

module.exports = client;
