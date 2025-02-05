
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();
const app = express();
const prisma = new PrismaClient(); // Initialize Prisma Client

app.use(cors());
app.use(express.json());

const templateRoutes = require("./routes/templateRoutes");
const formRoutes = require("./routes/formRoutes");

// ✅ Database connection test route
app.get("/db-check", async (req, res) => {
  try {
    await prisma.$connect(); // Try connecting to the DB
    res.json({ success: true, message: "Database connected successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed!", error: error.message });
  }
});

app.use("/api/templates", templateRoutes);
app.use("/api/forms", formRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Forms backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
