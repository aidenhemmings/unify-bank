const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const { loginRateLimiter } = require("../middleware/security.middleware");
const {
  validateLogin,
  handleValidationErrors,
} = require("../utils/validators");

router.post(
  "/login",
  loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  authController.login
);
router.post("/logout", authenticateToken, authController.logout);
router.get("/validate", authController.validateToken);

module.exports = router;
