const mysql = require('mysql');
const bcyrpt = require('bcrypt');

var exports = module.exports = {};

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'test',
  password: 'test',
  database: 'sunrin_tv'
});

module.exports.findId = (id, cb) => {
  pool.query('SELECT id FROM user WHERE id=?', [id], (error, results, fields) => {
    if (error) {
      cb(error, null);
      return;
    }
    if (!results[0]) {
      cb(null, false);
      return;
    }
    const length = Object.keys(results[0]).length;
    if (length == 1) {
      cb(null, true)
    }
    else {
      cb(null, false)
    }
  });
};

module.exports.findPw = (id, pw, cb) => {
  pool.query('SELECT * FROM user WHERE id=?', [id], (error, results, fields) => {
    if (error) cb(error, null);
    const user = results[0];
    bcyrpt.compare(pw, user['pw'], (err, same) => {
      if (same == true) {
        cb(true, user);
      }
      else {
        cb(false, null);
      }
    });
  });
};

module.exports.signUp = (id, pw) => {
  console.log('id:', id, ', pw:', pw);
  pool.query('INSERT INTO user VALUES (?, ?)', [id, pw], (error, results, fields) => {
    if (error) throw error;
  });
};

module.exports.idCheck = (id, cb) => {
  pool.query('SELECT id FROM user WHERE id=?', [id], (error, results, fields) => {
    if (error) throw error;
    const length = results.length;
    if (length == 1) {
      return cb(true);
    }
    else {
      return cb(false);
    }
  });
}

module.exports.addPublicSession = (code, caller) => {
  pool.query('INSERT INTO public_session (code, caller) VALUES (?, ?)', [code, caller]);
}
module.exports.deletePublicSession = (code) => {
  pool.query('DELETE FROM public_session WHERE code=?', [code]);
}