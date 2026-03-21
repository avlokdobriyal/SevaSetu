const express = require("express");
const { getAllWards } = require("../controllers/ward/wardController");

const router = express.Router();

router.get("/", getAllWards);

module.exports = router;
