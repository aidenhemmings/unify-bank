const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const accountsRoutes = require("./routes/accounts.routes");
const paymentsRoutes = require("./routes/payments.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const usersRoutes = require("./routes/users.routes");

const {
  securityHeaders,
  apiRateLimiter,
  parameterPollutionProtection,
  noSqlInjectionProtection,
} = require("./middleware/security.middleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(securityHeaders);

app.use(
  cors({
    origin: ["http://localhost:4200", "https://localhost:4200"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-User-Token"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(noSqlInjectionProtection);
app.use(parameterPollutionProtection);

app.use(apiRateLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/users", usersRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

if (process.env.NODE_ENV === "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} else {
  const sslKeyPath = path.join(__dirname, "../../ssl/localhost.key");
  const sslCertPath = path.join(__dirname, "../../ssl/localhost.crt");

  if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
    const httpsOptions = {
      key: fs.readFileSync(sslKeyPath),
      cert: fs.readFileSync(sslCertPath),
    };

    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`HTTPS Server running on https://localhost:${PORT}`);
      console.log(`SSL/TLS encryption enabled`);
    });
  } else {
    app.listen(PORT, () => {
      console.log(
        `Running on http://localhost:${PORT} (SSL certificates not found)`
      );
      console.log(`Generate SSL certificates for HTTPS support`);
    });
  }
}

module.exports = app;
