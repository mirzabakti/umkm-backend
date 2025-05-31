const jwt = require('jsonwebtoken');
const JWT_SECRET = 'umkm_secret_key'; // Untuk produksi, gunakan env variable

// Middleware verifikasi token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Middleware cek admin/owner
exports.isAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'owner') return next();
  return res.status(403).json({ message: 'Admin access only' });
};

// Middleware cek customer
exports.isCustomer = (req, res, next) => {
  if (req.user.role === 'customer') return next();
  return res.status(403).json({ message: 'Customer access only' });
};

// Middleware cek peran (untuk mengizinkan beberapa peran)
exports.authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
}; 