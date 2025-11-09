const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validateUserUpdate,
  handleValidationErrors,
} = require("../utils/validators");
const { validatePasswordChange } = require("../utils/password-validators");

router.use(authenticateToken);

router.get("/profile", usersController.getUserProfile);
router.put(
  "/profile",
  validateUserUpdate,
  handleValidationErrors,
  usersController.updateUserProfile
);
router.put(
  "/change-password",
  validatePasswordChange,
  handleValidationErrors,
  usersController.changePassword
);
router.get("/settings", usersController.getUserSettings);
router.put("/settings", usersController.updateUserSettings);
router.patch("/settings/toggle-dark-mode", usersController.toggleDarkMode);

module.exports = router;
