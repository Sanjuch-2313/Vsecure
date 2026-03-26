import express from "express";
import {
  register,
  registerWithGesture,
  login,
  saveGesture,
  verifyGesture,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/register-with-gesture", registerWithGesture);
router.post("/login", login);
router.post("/save-gesture", saveGesture);
router.post("/verify-gesture", verifyGesture);

export default router;