const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const transactionsRoutes = require("./routes/transactionsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const savingsRoutes = require('./routes/savingsRoutes');
const errorHandler = require("./middleware/errorHandler");


dotenv.config();

const app = express();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// Root Route
// =========================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Finance Advisor API is running",
  });
});

// =========================
// Authentication Routes
// =========================
app.use("/api/auth", authRoutes);

// =========================
// Transaction Routes (Protected)
// =========================
app.use("/api/transactions", authMiddleware, transactionsRoutes);

// =========================
// Dashboard Route (Protected)
// =========================
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

// =========================
// Budget Routes (Protected)
// =========================
app.use("/api/budgets", authMiddleware, budgetRoutes);

//=========================
//Savings Routes(Protected)
app.use('/api/savings', authMiddleware, savingsRoutes);

// =========================
// 404 Route Handler
// =========================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =========================
// Global Error Handler
// =========================
app.use(errorHandler);

module.exports = app;