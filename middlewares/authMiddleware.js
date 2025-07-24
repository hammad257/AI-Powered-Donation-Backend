const jwt = require('jsonwebtoken');

// 1. Verify Token Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains: { id, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// 2. Role-Based Middleware
const verifyRole = (roleArray) => {
  return (req, res, next) => {
    if (!req.user || !roleArray.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

module.exports = { verifyToken, verifyRole };
