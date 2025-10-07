// Very simple in-memory rate limiter keyed by tenant (restaurantId) or host.
// For production, replace with Redis-based sliding window limiter.

const buckets = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQ_PER_WINDOW = 120;

function keyFromReq(req) {
  if (req.restaurantId) return `tenant:${req.restaurantId}`;
  return `host:${(req.headers.host || '').toLowerCase()}`;
}

export const tenantRateLimit = (req, res, next) => {
  const key = keyFromReq(req);
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  let arr = buckets.get(key) || [];
  // drop old
  arr = arr.filter(ts => ts >= windowStart);
  if (arr.length >= MAX_REQ_PER_WINDOW) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ success: false, message: 'Too many requests' });
  }
  arr.push(now);
  buckets.set(key, arr);
  return next();
};

export default { tenantRateLimit };

