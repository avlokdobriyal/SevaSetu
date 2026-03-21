const express = require("express");

const router = express.Router();

// Admin analytics routes go here.
router.get("/", (req, res) => {
  res.json({ message: "Admin routes ready" });
});

module.exports = router;
