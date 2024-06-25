import express from "express";
import { getProfile, Login, Logout } from "../controllers/Auth.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/profile", verifyToken, getProfile);
router.post("/login", Login);
router.delete("/logout", Logout);

export default router;
