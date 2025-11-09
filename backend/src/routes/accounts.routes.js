const express = require("express");
const router = express.Router();
const accountsController = require("../controllers/accounts.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const {
  validateAccountCreation,
  validateUUID,
  handleValidationErrors,
} = require("../utils/validators");

router.use(authenticateToken);

router.get("/", accountsController.getAccounts);
router.get("/total-balance", accountsController.getTotalBalance);
router.get(
  "/:id",
  validateUUID,
  handleValidationErrors,
  accountsController.getAccountById
);
router.post(
  "/",
  validateAccountCreation,
  handleValidationErrors,
  accountsController.createAccount
);
router.put(
  "/:id",
  validateUUID,
  handleValidationErrors,
  accountsController.updateAccount
);
router.patch(
  "/:id/balance",
  validateUUID,
  handleValidationErrors,
  accountsController.updateAccountBalance
);
router.delete(
  "/:id",
  validateUUID,
  handleValidationErrors,
  accountsController.deleteAccount
);

module.exports = router;
