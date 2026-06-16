// src/routes/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  refreshTokenHandler,
  logout,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshTokenHandler);
router.post("/logout", logout);

export default router;
