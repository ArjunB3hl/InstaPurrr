/**
 * API Logger Middleware
 * Wraps an API handler to provide consistent error handling and logging
 * 
 * @param {Function} handler - The API route handler
 * @returns {Function} - Enhanced handler with error logging
 */
export default function withApiLogger(handler) {
  return async (req, res) => {
    const startTime = Date.now();
    const { url, method } = req;

    try {
      console.log(`➡️ ${method} ${url} - Request received`);
      
      // Call the original handler
      await handler(req, res);
      
      const duration = Date.now() - startTime;
      console.log(`✅ ${method} ${url} - Completed in ${duration}ms with status ${res.statusCode}`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${method} ${url} - Failed in ${duration}ms: ${error.message}`);
      console.error(error.stack);
      
      // Send error response if one hasn't been sent yet
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Internal Server Error',
          message: error.message,
          // Only include stack in development
          ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
        });
      }
    }
  };
}
