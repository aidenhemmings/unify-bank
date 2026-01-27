const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  deleteUser,
  inviteUser,
  getInvitations,
  cancelInvitation,
  resendInvitation,
  validateInvitation,
  acceptInvitation,
  getDashboardStats,
} = require("../controllers/admin-users.controller");
const {
  authenticateAdminToken,
} = require("../middleware/admin-auth.middleware");

// Public routes (no auth required)
router.get("/invitations/validate/:token", validateInvitation);
router.post("/invitations/accept/:token", acceptInvitation);

// Protected routes (admin auth required)
router.use(authenticateAdminToken);

// Dashboard stats
router.get("/stats", getDashboardStats);

// Invitation management (must be before /:id routes)
router.post("/invitations", inviteUser);
router.get("/invitations", getInvitations);
router.post("/invitations/:id/cancel", cancelInvitation);
router.post("/invitations/:id/resend", resendInvitation);

// User management
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.post("/:id/deactivate", deactivateUser);
router.post("/:id/reactivate", reactivateUser);
router.delete("/:id", deleteUser);

module.exports = router;
