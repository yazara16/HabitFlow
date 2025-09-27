import { verifyToken } from '../lib/jwt';

export const requireAuth = (req: any, res: any, next: any) => {
  const auth = req.headers.authorization || req.query.auth_token;
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });
  let token = auth;
  if (auth.startsWith('Bearer ')) token = auth.slice(7);
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
  const payload = verifyToken(token);
  if (!payload) return next();
  req.auth = payload;
  req.authUserId = payload.sub || payload.id || null;
  next();
};
