const app = require('./app');
const { port } = require('./config/env');
const { testConnection } = require('./config/db');

(async function start() {
  try {
    await testConnection();

    app.listen(port, () => {
      console.log(`[Server] Inventory Management API running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('[Startup Error] Failed to start server:', err.message);
    process.exit(1);
  }
})();

// Guard against unhandled promise rejections crashing the process silently
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});
