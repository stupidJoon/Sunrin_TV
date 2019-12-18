var express = require('express');
const path = require('path');
const shortid = require('shortid');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, '../views/index.html'));
});
router.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/signin.html'));
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
