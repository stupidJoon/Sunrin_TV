var express = require('express');
const path = require('path');
const shortid = require('shortid');
const passport = require('passport');
const bcyrpt = require('bcrypt');
const Users = require('../passport/user.js')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});
router.get('/signin', (req, res) => {
  // if (req.isAuthenticated()) {
  //   // res.sendFile(path.join(__dirname, '../views/signin.html'));
  //   res.render(path.join(__dirname, '../views/signin.jade'));
  // }
  // else {
  //   // res.sendFile(path.join(__dirname, '../views/signin.html'));
  //   res.render(path.join(__dirname, '../views/signin.jade'));
  // }
  res.render(path.join(__dirname, '../views/signin.jade'), { auth: req.query.auth_fail });
});
router.post('/signin', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/signin?auth_fail=true' }));
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signup.html'));
});
router.post('/signup', (req, res) => {
  bcyrpt.hash(req.body['pw'], bcryptSettings.saltRounds, (err, hash) => {
    Users.signUp(req.body['id'], hash);
  });
  res.json({'status': true});
});
router.get('/signout', (req, res) => {
  req.logout();
  res.redirect('/');
});
router.get('/caller', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/caller.html'));
});
router.get('/callee', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/callee.html'));
});
router.get('/session', (req, res) => {
  res.redirect('/session/*' + shortid.generate());
});
router.get(/\/session\//, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/session.html'));
});

module.exports = router;
