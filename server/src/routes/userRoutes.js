const express = require("express");
const {
  createOfficerByAdmin,
  createWorkerByOfficer,
  getWorkers,
  getOfficers,
  toggleUserActive,
} = require("../controllers/user/userController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect);

router.route("/workers").get(authorize("officer", "admin"), getWorkers);
router.route("/workers").post(authorize("officer"), createWorkerByOfficer);

router.route("/officers").get(authorize("admin"), getOfficers);
router.route("/officers").post(authorize("admin"), createOfficerByAdmin);

router.route("/:id/toggle-active").patch(authorize("admin"), toggleUserActive);

module.exports = router;
