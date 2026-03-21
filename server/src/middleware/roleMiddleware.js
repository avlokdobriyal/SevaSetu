const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized. Please login first.");
  }

  if (!allowedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error("Forbidden. You do not have access to this resource.");
  }

  next();
};

module.exports = {
  authorize,
};
