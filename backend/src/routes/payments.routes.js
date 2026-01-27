const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validatePaymentCreation,
  validateUUID,
  handleValidationErrors,
} = require("../utils/validators");

/**
 * Applies authentication middleware to all payment routes.
 */

router.use(authenticateToken);

router.get("/", paymentsController.getPayments);
router.get("/pending", paymentsController.getPendingPayments);
router.get("/incoming-pending", paymentsController.getIncomingPendingPayments);
router.get("/status/:status", paymentsController.getPaymentsByStatus);
router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  paymentsController.getPaymentById,
);
router.post(
  "/",
  validatePaymentCreation,
  handleValidationErrors,
  paymentsController.createPayment,
);
router.post("/process-scheduled", paymentsController.processScheduledPayments);
router.post(
  "/:id/process",
  validateUUID,
  handleValidationErrors,
  paymentsController.processPayment,
);
router.post(
  "/:id/approve",
  validateUUID,
  handleValidationErrors,
  paymentsController.approvePayment,
);
router.post(
  "/:id/decline",
  validateUUID,
  handleValidationErrors,
  paymentsController.declinePayment,
);
router.put(
  "/:id",
  validateUUID,
  handleValidationErrors,
  paymentsController.updatePayment,
);
router.patch(
  "/:id/cancel",
  validateUUID,
  handleValidationErrors,
  paymentsController.cancelPayment,
);

module.exports = router;
