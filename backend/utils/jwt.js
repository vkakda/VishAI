const jwt = require("jsonwebtoken");

function verifyToken(token) {
  if (!token) throw new Error("No token provided");
  try {
    const decoded = jwt.verify(token.split(" ")[1] || token, process.env.JWT_SECRET);
    return decoded.id; // assuming your JWT payload has `id`
  } catch (err) {
    console.error("JWT verification error:", err);
    return null;
  }
}

module.exports = { verifyToken };
