export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Middleware] Logged: ${err.message}`);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    statusCode
  });
};
