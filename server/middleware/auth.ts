import { verifyToken } from '../lib/jwt';

// Developer/testing bypass: if DEV_AUTH=true and a special token or header is present,
// treat requests as authenticated with DEV_USER_ID. This is ONLY for local/dev use.
export const requireAuth = (req: any, res: any, next: any) => {
  const auth = req.headers.authorization || req.query.auth_token;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  let token = auth;
  if (auth.startsWith('Bearer ')) token = auth.slice(7);

  // Dev bypass: if DEV_AUTH env var set and token matches dev token, accept
  const devAuthEnabled = process.env.DEV_AUTH === 'true' || process.env.NODE_ENV === 'development';
  if (devAuthEnabled && (token === 'dev-token' || req.headers['x-dev-user'])) {
    const devUserId = req.headers['x-dev-user'] || process.env.DEV_USER_ID || 'dev-user';
    req.auth = { sub: devUserId, dev: true };
    req.authUserId = devUserId;
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid token' });
  req.auth = payload;
  // payload should include sub (user id)
  req.authUserId = payload.sub || payload.id || null;
  next();
};

export const requireAuthOptional = (req: any, _res: any, next: any) => {
  const auth = req.headers.authorization || req.query.auth_token;
  if (!auth) return next();
  let token = auth;
  if (auth.startsWith('Bearer ')) token = auth.slice(7);

  const devAuthEnabled = process.env.DEV_AUTH === 'true' || process.env.NODE_ENV === 'development';
  if (devAuthEnabled && (token === 'dev-token' || req.headers['x-dev-user'])) {
    const devUserId = req.headers['x-dev-user'] || process.env.DEV_USER_ID || 'dev-user';
    req.auth = { sub: devUserId, dev: true };
    req.authUserId = devUserId;
    return next();
  }

  const payload = verifyToken(token);
  if (!payload) return next();
  req.auth = payload;
  req.authUserId = payload.sub || payload.id || null;
  next();
};
