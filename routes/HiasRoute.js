import express from "express";
import {
  createHias,
  deleteHias,
  getHias,
  getHiasAnalytics,
  getHiasById,
  getMyHias,
  updateHias,
} from "../controllers/Hias.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/hias/analytics", verifyToken, getHiasAnalytics);
router.get("/hias", verifyToken, getHias);
router.get("/hias/:id", verifyToken, getHiasById);
router.get("/myhias/:id", verifyToken, getMyHias);
router.post("/hias", verifyToken, createHias);
router.patch("/hias/:id", verifyToken, updateHias);
router.delete("/hias/:id", verifyToken, deleteHias);

export default router;
