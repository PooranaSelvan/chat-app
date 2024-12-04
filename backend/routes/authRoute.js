import express from "express";
import { signup, login, logout, updateProfile, checkAuth } from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js"


const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/updateProfile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);


export default router;