const pool = require('./db/pool');
const { findUserByServiceNo } = require('./services/userService');

findUserByServiceNo('6609')
  .then((user) => {
    console.log('USER', user);
    return pool.query('SELECT 1');
  })
  .then(([result]) => {
    console.log('DB_OK', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error('ERR', err.stack || err);
    process.exit(1);
  });
