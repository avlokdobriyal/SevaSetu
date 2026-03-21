const express = require("express");
const {
  fileGrievance,
  getGrievances,
  getGrievanceById,
  assignWorker,
  markInProgress,
  markResolved,
  closeGrievance,
  appealGrievance,
} = require("../controllers/grievance/grievanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { uploadGrievanceImages } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .post(authorize("citizen"), uploadGrievanceImages.array("images", 3), fileGrievance)
  .get(authorize("citizen", "officer", "worker", "admin"), getGrievances);

router
  .route("/:id")
  .get(authorize("citizen", "officer", "worker", "admin"), getGrievanceById);

router
  .route("/:id/assign-worker")
  .patch(authorize("officer"), assignWorker);

router
  .route("/:id/start-work")
  .patch(authorize("worker"), markInProgress);

router
  .route("/:id/resolve")
  .patch(authorize("worker"), markResolved);

router
  .route("/:id/close")
  .patch(authorize("officer"), closeGrievance);

router
  .route("/:id/appeal")
  .patch(authorize("citizen"), appealGrievance);

module.exports = router;
