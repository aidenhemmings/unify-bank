const express = require("express");
const cors = require("cors");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const accountsRoutes = require("./routes/accounts.routes");
const paymentsRoutes = require("./routes/payments.routes");
const transactionsRoutes = require("./routes/transactions.routes");
const usersRoutes = require("./routes/users.routes");
const adminAuthRoutes = require("./routes/admin-auth.routes");
const adminUsersRoutes = require("./routes/admin-users.routes");
const RealtimeService = require("./services/realtime.service");

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
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-User-Token",
      "X-Admin-Token",
    ],
    maxAge: 86400,
  }),
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
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/users", adminUsersRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Socket.io CORS options
const socketCorsOptions = {
  origin: ["http://localhost:4200", "https://localhost:4200"],
  credentials: true,
};

if (process.env.NODE_ENV === "production") {
  const server = http.createServer(app);
  const io = new Server(server, { cors: socketCorsOptions });

  // Initialize real-time service
  const realtimeService = new RealtimeService(io);
  realtimeService.initialize();

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} else {
  // Try Docker paths first, then fall back to local development paths
  const dockerSslKeyPath = "/app/ssl/localhost.key";
  const dockerSslCertPath = "/app/ssl/localhost.crt";
  const localSslKeyPath = path.join(__dirname, "../../ssl/localhost.key");
  const localSslCertPath = path.join(__dirname, "../../ssl/localhost.crt");

  let sslKeyPath, sslCertPath;

  if (fs.existsSync(dockerSslKeyPath) && fs.existsSync(dockerSslCertPath)) {
    sslKeyPath = dockerSslKeyPath;
    sslCertPath = dockerSslCertPath;
  } else if (fs.existsSync(localSslKeyPath) && fs.existsSync(localSslCertPath)) {
    sslKeyPath = localSslKeyPath;
    sslCertPath = localSslCertPath;
  }

  if (sslKeyPath && sslCertPath) {
    try {
      const httpsOptions = {
        key: fs.readFileSync(sslKeyPath),
        cert: fs.readFileSync(sslCertPath),
      };

      const server = https.createServer(httpsOptions, app);
    const io = new Server(server, { cors: socketCorsOptions });

    // Initialize real-time service
    const realtimeService = new RealtimeService(io);
    realtimeService.initialize();

    server.listen(PORT, () => {
        console.log(`HTTPS Server running on https://localhost:${PORT}`);
      });
    } catch (err) {
      console.error(`Error loading SSL certificates: ${err.message}`);
      console.log(`Running on HTTP instead`);
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      console.log(`WebSocket real-time service initialized`);
      });
    }
  } else {
    console.log(`SSL certificates not found, running on HTTP`);
    const server = http.createServer(app);
    const io = new Server(server, { cors: socketCorsOptions });

    // Initialize real-time service
    const realtimeService = new RealtimeService(io);
    realtimeService.initialize();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

module.exports = app;