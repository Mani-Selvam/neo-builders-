import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 8000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, 'localhost', () => {
      console.log(`[server] NeoBuilder ERP API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[server] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
