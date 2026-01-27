const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

/**
 * Security headers middleware using Helmet.
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Rate limiter for login attempts to prevent brute-force attacks.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many login attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter to prevent abuse.
 */
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Protects against HTTP Parameter Pollution attacks.
 */
const parameterPollutionProtection = hpp();

/**
 * Sanitizes user input to prevent NoSQL injection attacks.
 */
const noSqlInjectionProtection = mongoSanitize({
  replaceWith: "_",
});

module.exports = {
  securityHeaders,
  loginRateLimiter,
  apiRateLimiter,
  parameterPollutionProtection,
  noSqlInjectionProtection,
};
