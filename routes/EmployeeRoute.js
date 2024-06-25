import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  deleteEmployee,
  getEmployeeAnalytics,
  getEmployeesDecrypted,
} from "../controllers/Employee.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();

router.get("/employees/analytics", verifyToken, getEmployeeAnalytics);
router.get("/employees", verifyToken, getEmployees);
router.get("/employees/decrypted", verifyToken, getEmployeesDecrypted);
router.get("/employees/:id", verifyToken, getEmployeeById);
router.post("/employees", createEmployee);
router.delete("/employees/:id", verifyToken, deleteEmployee);

export default router;
