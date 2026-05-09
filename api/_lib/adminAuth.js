import jwt from 'jsonwebtoken';

/**
 * Verify admin JWT token from request headers.
 * Returns decoded token if valid, or null if invalid.
 */
export function verifyAdmin(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'admin') return null;
    return decoded;
  } catch {
    return null;
  }
}
