import express from "express";
import {
  createProSession,
  deleteProSession,
  endProSession,
  getProSessionById,
  getProSessions,
  submitProAnswer,
} from "../controllers/proSessionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleAudio } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Apply auth protection to ALL routes in this file automatically
router.use(protect);

// 1. Root Routes ("/")
router.route("/")
  .get(getProSessions)
  .post(createProSession);

// 2. ID Routes ("/:id")
router.route("/:id")
  .get(getProSessionById)
  .delete(deleteProSession);

// 3. Action Routes
router.route("/:id/submit-answer").post(uploadSingleAudio, submitProAnswer);
router.route("/:id/end").post(endProSession);

export default router;