const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

// Get all users
router.get("/users", authenticate, isAdmin, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Block/Unblock User
router.patch("/users/:id/toggle-block", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    data: { isBlocked: !req.body.isBlocked },
  });
  res.json(user);
});

// Delete User
router.delete("/users/:id", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ message: "User deleted" });
});

// Grant Admin Role
router.patch("/users/:id/make-admin", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    data: { role: "ADMIN" },
  });
  res.json(user);
});

// Remove Admin Role (Even from themselves)
router.patch("/users/:id/remove-admin", authenticate, isAdmin, async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    data: { role: "USER" },
  });

  res.json(user);
});

module.exports = router;
