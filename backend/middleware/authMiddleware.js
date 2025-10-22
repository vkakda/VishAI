const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Read token from Authorization header
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "No token, authorization denied" });

  // Remove "Bearer " if token starts with it
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Attach userId as req.user.id
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
