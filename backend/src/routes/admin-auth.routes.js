const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/admin-auth.controller");
const {
  authenticateAdminToken,
} = require("../middleware/admin-auth.middleware");
const { loginRateLimiter } = require("../middleware/security.middleware");
const {
  validateLogin,
  handleValidationErrors,
} = require("../utils/validators");

/**
 * Admin authentication routes.
 */

router.post(
  "/login",
  loginRateLimiter,
  validateLogin,
  handleValidationErrors,
  adminAuthController.login,
);

router.post("/logout", authenticateAdminToken, adminAuthController.logout);
router.get("/validate", adminAuthController.validateToken);
router.get("/profile", authenticateAdminToken, adminAuthController.getProfile);
router.put(
  "/password",
  authenticateAdminToken,
  adminAuthController.updatePassword,
);

module.exports = router;
