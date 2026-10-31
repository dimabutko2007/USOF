const { ApiError } = require('./errorMiddleware');

function checkRole(requiredRole) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (req.session.user.role !== requiredRole) {
      return next(ApiError.forbidden(`Access denied. Requires '${requiredRole}' role.`));
    }

    next();
  };
}

module.exports = {
  checkRole
};
