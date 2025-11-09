const { body, param, validationResult } = require("express-validator");

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;
const ACCOUNT_NUMBER_REGEX = /^[0-9]{8,16}$/;
const NAME_REGEX = /^[a-zA-Z\s'-]{1,50}$/;
const DESCRIPTION_REGEX = /^[a-zA-Z0-9\s.,!?'-]{0,200}$/;

const sanitizeInput = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/[<>]/g, "").substring(0, 1000);
};

const validateLogin = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .matches(USERNAME_REGEX)
    .withMessage("Invalid username format")
    .customSanitizer(sanitizeInput),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 100 })
    .withMessage("Password must be between 8 and 100 characters"),
];

const validateRegistration = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .matches(USERNAME_REGEX)
    .withMessage(
      "Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens"
    )
    .customSanitizer(sanitizeInput),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
    ),
  body("email")
    .optional()
    .trim()
    .matches(EMAIL_REGEX)
    .withMessage("Invalid email format")
    .customSanitizer(sanitizeInput),
  body("first_name")
    .optional()
    .trim()
    .matches(NAME_REGEX)
    .withMessage("Invalid first name format")
    .customSanitizer(sanitizeInput),
  body("last_name")
    .optional()
    .trim()
    .matches(NAME_REGEX)
    .withMessage("Invalid last name format")
    .customSanitizer(sanitizeInput),
];

const validateAccountCreation = [
  body("account_name")
    .trim()
    .notEmpty()
    .withMessage("Account name is required")
    .matches(NAME_REGEX)
    .withMessage("Invalid account name format")
    .customSanitizer(sanitizeInput),
  body("account_number")
    .trim()
    .notEmpty()
    .withMessage("Account number is required")
    .matches(ACCOUNT_NUMBER_REGEX)
    .withMessage("Invalid account number format"),
  body("account_type")
    .trim()
    .notEmpty()
    .withMessage("Account type is required")
    .isIn(["checking", "savings", "credit"])
    .withMessage("Invalid account type"),
  body("balance")
    .optional()
    .matches(AMOUNT_REGEX)
    .withMessage("Invalid balance format"),
  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters")
    .matches(/^[A-Z]{3}$/)
    .withMessage("Currency must be uppercase letters"),
];

const validatePaymentCreation = [
  body("recipient_name")
    .trim()
    .notEmpty()
    .withMessage("Recipient name is required")
    .matches(NAME_REGEX)
    .withMessage("Invalid recipient name format")
    .customSanitizer(sanitizeInput),
  body("recipient_account")
    .trim()
    .notEmpty()
    .withMessage("Recipient account is required")
    .matches(ACCOUNT_NUMBER_REGEX)
    .withMessage("Invalid account number format"),
  body("amount")
    .trim()
    .notEmpty()
    .withMessage("Amount is required")
    .matches(AMOUNT_REGEX)
    .withMessage("Invalid amount format")
    .custom((value) => parseFloat(value) > 0)
    .withMessage("Amount must be greater than 0"),
  body("description")
    .optional()
    .trim()
    .matches(DESCRIPTION_REGEX)
    .withMessage("Invalid description format")
    .customSanitizer(sanitizeInput),
  body("scheduled_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  body("frequency")
    .optional()
    .trim()
    .isIn(["once", "daily", "weekly", "monthly", "yearly"])
    .withMessage("Invalid frequency"),
];

const validateTransactionCreation = [
  body("account_id")
    .trim()
    .notEmpty()
    .withMessage("Account ID is required")
    .matches(UUID_REGEX)
    .withMessage("Invalid account ID format"),
  body("amount")
    .trim()
    .notEmpty()
    .withMessage("Amount is required")
    .matches(AMOUNT_REGEX)
    .withMessage("Invalid amount format")
    .custom((value) => parseFloat(value) > 0)
    .withMessage("Amount must be greater than 0"),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["credit", "debit"])
    .withMessage("Invalid transaction type"),
  body("category")
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s]{1,30}$/)
    .withMessage("Invalid category format")
    .customSanitizer(sanitizeInput),
  body("description")
    .optional()
    .trim()
    .matches(DESCRIPTION_REGEX)
    .withMessage("Invalid description format")
    .customSanitizer(sanitizeInput),
];

const validateUUID = [
  param("id").trim().matches(UUID_REGEX).withMessage("Invalid ID format"),
];

const validateUserUpdate = [
  body("username")
    .optional()
    .trim()
    .matches(USERNAME_REGEX)
    .withMessage("Invalid username format")
    .customSanitizer(sanitizeInput),
  body("email")
    .optional()
    .trim()
    .matches(EMAIL_REGEX)
    .withMessage("Invalid email format")
    .customSanitizer(sanitizeInput),
  body("first_name")
    .optional()
    .trim()
    .matches(NAME_REGEX)
    .withMessage("Invalid first name format")
    .customSanitizer(sanitizeInput),
  body("last_name")
    .optional()
    .trim()
    .matches(NAME_REGEX)
    .withMessage("Invalid last name format")
    .customSanitizer(sanitizeInput),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateRegistration,
  validateAccountCreation,
  validatePaymentCreation,
  validateTransactionCreation,
  validateUUID,
  validateUserUpdate,
  handleValidationErrors,
};
