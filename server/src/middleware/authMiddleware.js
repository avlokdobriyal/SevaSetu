const jwt = require("jsonwebtoken");
const { User } = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. Missing or invalid token.");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized. Token is invalid or expired.");
  }

  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("Not authorized. User not found.");
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error("Your account is deactivated. Please contact admin.");
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
