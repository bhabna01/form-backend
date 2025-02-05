const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

// Get current user info
router.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  res.json(user);
});

// Admin-only route to get all users
router.get("/all", authenticate, isAdmin, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

module.exports = router;
