'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db');

module.exports = router;


// a reusable function
function respondWithAllTweets (req, res, next){

  var query = 'SELECT tweets.id, name, content, picture_url FROM tweets INNER JOIN users ON tweets.user_id = users.id';

  var tweetsQuery = client.query(query, function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    // console.log(tweets);
    res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
  });

  return tweetsQuery;
}

// var respondWithAllTweets =
// client.query('SELECT * FROM tweets', function (err, result) {
//   if (err) return next(err); // pass errors to Express
//   var tweets = result.rows;
//   console.log(tweets);
//   res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
// });

// here we basically treet the root view and tweets view as identical
router.get('/', respondWithAllTweets);
router.get('/tweets', respondWithAllTweets);

// single-user page
router.get('/users/:username', function(req, res, next){
  // var tweetsForName = tweetBank.find({ name: req.params.username });
  // res.render('index', {
  //   title: 'Twitter.js',
  //   tweets: tweetsForName,
  //   showForm: true,
  //   username: req.params.username
  // });
  let userQuery = req.params.username;

  var query = 'SELECT tweets.id, name, content, picture_url FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE name= $1';

  var tweetsQuery = client.query(query, [userQuery], function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    console.log(tweets);
    res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
  });

  return tweetsQuery;
});

// single-tweet page
router.get('/tweets/:id', function(req, res, next){
  // var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
  // res.render('index', {
  //   title: 'Twitter.js',
  //   tweets: tweetsWithThatId // an array of only one element ;-)
  // });
  let idQuery = + req.params.id;

  var query = 'SELECT tweets.id, name, content, picture_url FROM tweets INNER JOIN users ON tweets.user_id = users.id WHERE tweets.id= $1';

  var tweetsQuery = client.query(query, [idQuery], function (err, result) {
    if (err) return next(err); // pass errors to Express
    var tweets = result.rows;
    console.log(tweets);
    res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
  });

  return tweetsQuery;

});

// create a new tweet
router.post('/tweets', function(req, res, next){
  // var newTweet = tweetBank.add(req.body.name, req.body.content);

  let userQuery = req.body.name;
  let tweetContent = req.body.content;

  var query = 'SELECT * FROM users WHERE name = $1';
  //1. seach name against users TABLE,
  //2. if user exists, retrieve user id,
  //3. add tweet to tweets with user id,
  //4. if user does not exist first add user, retrieve id,
  //5. add tweet with user id,

  // var tweetsQuery =
  client.query(query, [userQuery], function (err, result) {
    if (err) return next(err); // pass errors to Express
    // var tweets = result.rows;
    // console.log(tweets.length);
    // res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    let insert = 'INSERT INTO tweets (user_id, content) VALUES ( $1, $2 )';

    if (result.rows.length) { //if true ther is a user
      let insertVals = [result.rows[0].id, tweetContent];
      client.query(insert, insertVals);
    } else {
      let userInsert = 'INSERT INTO users ( name, picture_url) VALUES ( $1, $2 )';
      let insertVals = [userQuery, 'http://learngroup.org/assets/images/logos/default_male.jpg'];
      // let newUserId = null;
      client.query(userInsert, insertVals);
      client.query(query, [userQuery], function (err, result) {
        if (err) return next(err); // pass errors to Express
        let newUserId = result.rows[0].id;
        client.query(insert, [newUserId, tweetContent]);
      });
      // client.query(insert, [newUserId, tweetContent]);
    }
  });

  // return tweetsQuery;

  res.redirect('/');
});

// // replaced this hard-coded route with general static routing in app.js
// router.get('/stylesheets/style.css', function(req, res, next){
//   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
// });
