// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user info to request
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Expects 'Bearer <token>'
  
  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info from token payload
    next();
  } catch (error) {
      console.log('Invalid token' );
    return res.status(401).json({ message: 'Invalid token' });
   
  }
};

// Middleware to allow only admins
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Middleware to allow only authenticated users (regular users)
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
//   if (req.user.role !== 'user') {
//     return res.status(403).json({ message: 'Access denied: Users only' });
//   }
  next();
};

module.exports = { verifyToken, requireAdmin, requireUser };
