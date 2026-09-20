const { ApiError } = require('./errorMiddleware');

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return next(ApiError.unauthorized('You must be logged in to perform this action.'));
}

module.exports = {
  isAuthenticated
};
