import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureDefaultAdminUser } from './bootstrap.js';

const PORT = process.env.PORT || 8001;

async function start() {
  try {
    await connectDB();
    await ensureDefaultAdminUser();
    app.listen(PORT, () => {
      console.log(`[server] NeoBuilder ERP API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
