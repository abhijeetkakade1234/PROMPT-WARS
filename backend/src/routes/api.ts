import { Router } from 'express';
import { SubmissionController } from '../controllers/submissionController';
import { RoundService } from '../services/roundService';
import { prisma } from '../index';
import multer from 'multer';
import { AdminController } from '../controllers/adminController';
import { adminAuth } from '../middleware/authMiddleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Submission Routes
router.post('/submit/round1', upload.single('image'), SubmissionController.submitRound1);
router.post('/submit/round2', SubmissionController.submitRound2);
router.post('/submit/round3', SubmissionController.submitRound3);

// Get All Rounds
router.get('/rounds', async (req, res) => {
  const rounds = await RoundService.getAllRounds();
  res.json(rounds);
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  const leaderboard = await prisma.leaderboard.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { total_score: 'desc' }
  });
  res.json(leaderboard);
});

// Admin Routes
router.patch('/admin/round/:id/activate', adminAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await RoundService.activateRound(parseInt(id));
    res.json({ message: `Round ${id} activated successfully` });
  } catch (error) {
    res.status(500).json({ error: "Failed to activate round" });
  }
});

router.get('/admin/submissions', adminAuth, AdminController.listSubmissions);
router.post('/admin/evaluate/:id', adminAuth, AdminController.evaluateSubmission);
router.post('/admin/evaluate-round/:roundId', adminAuth, AdminController.evaluateRoundSequential);

// Seed Rounds (Helper)
router.post('/admin/seed-rounds', adminAuth, async (req, res) => {
  await prisma.round.createMany({
    data: [
      { id: 1, name: "Image Prompting", description: "Generate a stunning visual using AI.", is_active: true },
      { id: 2, name: "Creative Text Prompting", description: "Write a short story that wows the judges.", is_active: false },
      { id: 3, name: "Code Prompting", description: "A hidden trial for the elite.", is_active: false }
    ],
    skipDuplicates: true
  });
  res.json({ message: "Rounds seeded with descriptions" });
});

export default router;
