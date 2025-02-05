const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const checkAuth = (req, res, next) => {
  if (!req.headers.userid) return res.status(401).json({ error: "Unauthorized" });
  req.userId = req.headers.userid; // Simulating user session
  next();
};

// Get all responses for a template
router.get("/:templateId", async (req, res) => {
  const { templateId } = req.params;
  const forms = await prisma.form.findMany({
    where: { templateId },
    include: { user: true },
  });
  res.json(forms);
});

// Submit a form response
router.post("/", async (req, res) => {
  const { userId, templateId, answers } = req.body;
  try {
    const form = await prisma.form.create({
      data: { userId, templateId, answers },
    });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: "Error submitting form" });
  }
});
// Submit a form (only authenticated users)
router.post("/", checkAuth, async (req, res) => {
  const { templateId, answers } = req.body;
  try {
    const form = await prisma.form.create({
      data: {
        userId: req.userId, // Use authenticated user
        templateId,
        answers,
      },
    });
    res.json(form);
  } catch (error) {
    res.status(500).json({ error: "Error submitting form" });
  }
});

// Get forms for a specific template (only for creator or admin)
router.get("/:templateId", checkAuth, async (req, res) => {
  const { templateId } = req.params;
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) return res.status(404).json({ error: "Template not found" });

  if (template.authorId !== req.userId) return res.status(403).json({ error: "Access Denied" });

  const forms = await prisma.form.findMany({
    where: { templateId },
    include: { user: true },
  });

  res.json(forms);
});

router.get("/:templateId/stats", checkAuth, async (req, res) => {
  const { templateId } = req.params;
  const forms = await prisma.form.findMany({ where: { templateId } });

  if (forms.length === 0) return res.json({ message: "No responses yet." });

  let stats = {};

  forms.forEach((form) => {
    Object.entries(form.answers).forEach(([questionId, answer]) => {
      if (!stats[questionId]) stats[questionId] = { count: 0, sum: 0, answers: {} };
      stats[questionId].count++;
      if (!isNaN(answer)) stats[questionId].sum += parseInt(answer);
      stats[questionId].answers[answer] = (stats[questionId].answers[answer] || 0) + 1;
    });
  });

  let result = Object.entries(stats).map(([qId, data]) => ({
    questionId: qId,
    average: data.sum / data.count || "N/A",
    mostCommon: Object.entries(data.answers).reduce((a, b) => (b[1] > a[1] ? b : a), ["N/A", 0])[0],
  }));

  res.json(result);
});


module.exports = router;
