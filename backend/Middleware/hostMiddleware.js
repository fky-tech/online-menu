import dotenv from 'dotenv';

dotenv.config();

// Gate super admin APIs to a specific host (e.g., admin.yourapp.com)
export const adminHostGate = (req, res, next) => {
  const adminHost = (process.env.ADMIN_HOST || '').toLowerCase();
  if (!adminHost) return next(); // if not configured, do not block to avoid local dev breakage
  const host = (req.headers.host || '').toLowerCase();
  if (host === adminHost) return next();
  return res.status(403).json({ success: false, message: 'Forbidden: wrong host for super admin' });
};

export default { adminHostGate };

