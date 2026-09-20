class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }

  static badRequest(msg) {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = 'Unauthorized access') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden: Access is denied') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg) {
    return new ApiError(409, msg);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg);
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      console.error(`[ApiError ${err.statusCode}]`, err.stack || err.message);
    }
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      message: err.message
    });
  }

  console.error('Unhandled Error Stack:', err.stack || err.message);

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: `File upload error: ${err.message}`
    });
  }

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: err.message || 'Internal server error'
  });
}

module.exports = {
  ApiError,
  errorHandler
};
