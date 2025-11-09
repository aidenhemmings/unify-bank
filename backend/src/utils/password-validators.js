const { body } = require("express-validator");

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validatePasswordChange = [
  body("current_password")
    .trim()
    .notEmpty()
    .withMessage("Current password is required"),
  body("new_password")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .matches(PASSWORD_REGEX)
    .withMessage(
      "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character"
    ),
];

module.exports = {
  validatePasswordChange,
};
