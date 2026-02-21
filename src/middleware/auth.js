/**
 * HTTP Basic Auth middleware for admin routes.
 * Requires ADMIN_USER and ADMIN_PASSWORD (or ADMIN_CREDENTIALS=user:pass).
 */

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const log = {
  info: (msg, data) =>
    ['debug', 'info'].includes(LOG_LEVEL) &&
    console.log('[auth]', msg, data !== undefined ? data : ''),
  warn: (msg, data) =>
    ['debug', 'info', 'warn'].includes(LOG_LEVEL) &&
    console.warn('[auth] WARN', msg, data !== undefined ? data : ''),
};

function getCredentials() {
  const creds = process.env.ADMIN_CREDENTIALS;
  if (creds && creds.includes(':')) {
    const [u, p] = creds.split(':', 2);
    return { user: u, pass: p };
  }
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (user && pass) return { user, pass };
  return null;
}

function basicAuth(req, res, next) {
  const creds = getCredentials();
  if (!creds) {
    log.warn('Admin auth not configured');
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required');
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Basic ')) {
    log.info('Missing Basic auth header');
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).send('Authentication required');
  }

  const decoded = Buffer.from(auth.slice(6), 'base64').toString('utf8');
  const [user, pass] = decoded.split(':', 2);

  if (user === creds.user && pass === creds.pass) {
    log.info('Auth success');
    return next();
  }

  log.info('Auth failed');
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
  return res.status(401).send('Invalid credentials');
}

module.exports = { basicAuth };
