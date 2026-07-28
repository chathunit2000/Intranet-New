module.exports = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};
