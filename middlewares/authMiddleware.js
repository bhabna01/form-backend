const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Ensure user is an admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== "ADMIN") return res.status(403).json({ error: "Access Denied" });
  next();
};

module.exports = { authenticate, isAdmin };
