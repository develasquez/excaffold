module.exports = process.env.EXCAFFOLD_COV
  ? require('./lib-cov/excaffold')
  : require('./lib/excaffold');