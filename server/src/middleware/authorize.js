/**
 * server/src/middleware/authorize.js
 * Role-based access control (RBAC).
 * Usage: router.get('/path', authenticate, authorize('admin'), handler)
 *        router.get('/path', authenticate, authorize('doctor', 'admin'), handler)
 */

module.exports = function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
    }
    next();
  };
};
