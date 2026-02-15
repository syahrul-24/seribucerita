/**
 * Centralized error handler.
 * Sends generic message to client, logs full detail to server.
 */
function errorHandler(err, req, res, _next) {
    // Log full error detail server-side
    console.error(`[ERROR] ${req.method} ${req.path}:`, {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });

    // Send generic error to client (never expose internals)
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode === 500
            ? 'Terjadi kesalahan pada server. Silakan coba lagi.'
            : err.message,
    });
}

export default errorHandler;
