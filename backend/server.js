
import express from 'express';
import dotenv from 'dotenv';
import mySqlConnection from './Config/db.js';
import cors from 'cors';
import router from './Router/route.js';
import path from 'path';

dotenv.config()

const port = process.env.PORT || 5000;

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
const rootDomain = (process.env.ROOT_DOMAIN || '').toLowerCase();
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    // Exact allow
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    // Wildcard: subdomains of ROOT_DOMAIN
    try {
      const url = new URL(origin);
      const host = url.host.toLowerCase();
      if (rootDomain && (host === rootDomain || host.endsWith('.' + rootDomain))) {
        return callback(null, true);
      }
    } catch (_e) {}
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: false
}));

// Middleware to parse JSON (increase limit for safety if needed)
app.use(express.json());

// Optional: parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));


// Serve uploaded images statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', router)

app.listen(port, async () => {
    await mySqlConnection.query('SELECT 1');
    console.log(`Server is running on port ${port} and DB is connected`);

})
