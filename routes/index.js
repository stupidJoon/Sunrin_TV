var express = require('express');
const path = require('path');
const shortid = require('shortid');
const passport = require('passport');
const bcyrpt = require('bcrypt');
const Users = require('../passport/user.js');

var router = express.Router();
const bcryptSettings = {
  saltRounds: 10
};

/* GET home page. */
router.get('/', function(req, res, next) {
  Users.selectPublicSession().then((results) => {
    res.render(path.join(__dirname, '../views/index.jade'), { auth: req.isAuthenticated(), public_sessions: results });
  });
  // res.sendFile(path.join(__dirname, '../views/index.html'));
});
router.get('/signin', (req, res) => {
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
  res.redirect('/signin');
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
  res.render(path.join(__dirname, '../views/session.jade'), { user: req.user });
  // res.sendFile(path.join(__dirname, '../views/session.html'));
});

module.exports = router;
