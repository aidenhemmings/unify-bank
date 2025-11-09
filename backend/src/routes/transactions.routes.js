const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transactions.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validateTransactionCreation,
  validateUUID,
  handleValidationErrors,
} = require("../utils/validators");

router.use(authenticateToken);

router.get("/", transactionsController.getAllTransactions);
router.get(
  "/account/:accountId",
  validateUUID,
  handleValidationErrors,
  transactionsController.getTransactionsByAccount
);
router.get(
  "/category/:category",
  transactionsController.getTransactionsByCategory
);
router.get("/stats/:year/:month", transactionsController.getMonthlyStats);
router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  transactionsController.getTransactionById
);
router.post(
  "/",
  validateTransactionCreation,
  handleValidationErrors,
  transactionsController.createTransaction
);
router.put(
  "/:id",
  validateUUID,
  handleValidationErrors,
  transactionsController.updateTransaction
);
router.delete(
  "/:id",
  validateUUID,
  handleValidationErrors,
  transactionsController.deleteTransaction
);

module.exports = router;
