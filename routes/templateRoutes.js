const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all templates
router.get("/", async (req, res) => {
  const templates = await prisma.template.findMany({
    include: { author: true },
  });
  res.json(templates);
});

// Create a new template
router.post("/", async (req, res) => {
  const { title, description, topic, tags, isPublic, authorId, questions } = req.body;
  try {
    const template = await prisma.template.create({
      data: {
        title,
        description,
        topic,
        tags,
        isPublic,
        authorId,
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : null,
          })),
        },
      },
    });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Error creating template" });
  }
});

module.exports = router;
