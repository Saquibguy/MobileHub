const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// Verifies JWT from Authorization: Bearer <token>, attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated. Token missing." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists." });
    if (user.isBlocked) return res.status(403).json({ success: false, message: "Account is blocked." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
});

// Role-based access control: authorize("ADMIN"), authorize("ADMIN","SELLER") etc.
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions." });
  }
  next();
};

module.exports = { protect, authorize };
