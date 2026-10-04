// Handles routes that do not exist.
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
}

// Global error handler.
function errorHandler(err, req, res, next) {
  // Always log the real error on the server.
  // This is important for debugging production deployments.
  console.error("SERVER ERROR:", err);

  if (err.stack) {
    console.error(err.stack);
  }

  let statusCode =
    err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;

  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;

    const field =
      Object.keys(err.keyValue || {})[0] || "field";

    message = `Duplicate value for ${field}.`;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}.`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token.";
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired.";
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Something went wrong. Please try again."
        : message,
  });
}

module.exports = {
  notFound,
  errorHandler,
};