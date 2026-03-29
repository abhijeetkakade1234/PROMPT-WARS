import { Router } from 'express';
import { SubmissionController } from '../controllers/submissionController';
import { RoundService } from '../services/roundService';
import { prisma } from '../index';
import multer from 'multer';
import { AdminController } from '../controllers/adminController';
import { adminAuth } from '../middleware/authMiddleware';
import { parser } from '../utils/cloudinary';

const router = Router();

// Submission Routes
router.post('/submit/round1', parser.single('image'), SubmissionController.submitRound1);
router.post('/submit/round2', SubmissionController.submitRound2);
router.post('/submit/round3', SubmissionController.submitRound3);

// Get All Rounds
router.get('/rounds', async (req, res) => {
  try {
    const rounds = await RoundService.getAllRounds();
    res.json(rounds);
  } catch (error: any) {
    const prismaCode = error?.code as string | undefined;

    if (prismaCode === 'P2021' || prismaCode === 'P2022') {
      return res.status(503).json({
        error: 'Database schema is not initialized. Run Prisma migrations/db push and seed rounds.'
      });
    }

    if (prismaCode?.startsWith('P10')) {
      return res.status(503).json({
        error: 'Database is unavailable. Please verify DATABASE_URL and database connectivity.'
      });
    }

    return res.status(500).json({ error: 'Failed to fetch rounds' });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await prisma.leaderboard.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { total_score: 'desc' }
    });
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

router.get('/leaderboard/round/:roundId', async (req, res) => {
  try {
    const roundId = Number(req.params.roundId);
    if (![1, 2].includes(roundId)) {
      return res.status(400).json({ error: "Only round 1 or 2 is supported" });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        round_id: roundId,
        is_evaluated: true
      },
      include: {
        user: { select: { id: true, name: true } },
        scores: true,
        round1_data: true,
        round2_data: true
      }
    });

    const items = submissions
      .map((s) => {
        const score = s.scores[0]?.total_score ?? null;
        return {
          submission_id: s.id,
          user_id: s.user_id,
          user_name: s.user.name,
          round_id: s.round_id,
          total_score: score,
          prompt_text: s.round_id === 1 ? s.round1_data?.prompt_text : s.round2_data?.prompt_text,
          image_url: s.round_id === 1 ? s.round1_data?.image_url : null,
          text_output: s.round_id === 2 ? s.round2_data?.text_output : null,
          created_at: s.created_at
        };
      })
      .filter((x) => x.total_score !== null)
      .sort((a, b) => Number(b.total_score) - Number(a.total_score));

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch round leaderboard" });
  }
});

router.get('/leaderboard/user/:userId/details', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const submissions = await prisma.submission.findMany({
      where: { user_id: userId, round_id: { in: [1, 2] } },
      include: {
        round: true,
        round1_data: true,
        round2_data: true,
        scores: true
      },
      orderBy: { round_id: 'asc' }
    });

    return res.json({
      user,
      rounds: submissions.map((s) => ({
        submission_id: s.id,
        round_id: s.round_id,
        round_name: s.round.name,
        total_score: s.scores[0]?.total_score ?? null,
        prompt_text: s.round_id === 1 ? s.round1_data?.prompt_text : s.round2_data?.prompt_text,
        image_url: s.round_id === 1 ? s.round1_data?.image_url : null,
        text_output: s.round_id === 2 ? s.round2_data?.text_output : null,
        created_at: s.created_at
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user leaderboard details" });
  }
});

router.get('/submissions/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (Number.isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user_id" });
    }

    const submissions = await prisma.submission.findMany({
      where: { user_id: userId },
      include: {
        round1_data: true,
        round2_data: true,
        round3_data: true,
        scores: true
      },
      orderBy: { created_at: 'desc' }
    });

    return res.json(submissions);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user submissions" });
  }
});

router.get('/results/:participantId', async (req, res) => {
  try {
    const participantId = String(req.params.participantId || '').trim();
    if (!participantId) {
      return res.status(400).json({ error: "participantId is required" });
    }

    const user = await prisma.user.findFirst({
      where: { name: participantId },
      select: { id: true, name: true }
    });

    if (!user) {
      return res.json({ participant_id: participantId, submissions: [] });
    }

    const submissions = await prisma.submission.findMany({
      where: { user_id: user.id },
      include: { scores: true, round: true },
      orderBy: { round_id: 'asc' }
    });

    return res.json({
      participant_id: participantId,
      submissions: submissions.map((s) => ({
        submission_id: s.id,
        round_id: s.round_id,
        round_name: s.round.name,
        is_evaluated: s.is_evaluated,
        total_score: s.scores[0]?.total_score ?? null
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch participant results" });
  }
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

router.patch('/admin/round/:id/unlock', adminAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await RoundService.unlockRound(parseInt(id));
    res.json({ message: `Round ${id} unlocked successfully. Other rounds are locked.` });
  } catch (error) {
    res.status(500).json({ error: "Failed to unlock round" });
  }
});

router.patch('/admin/round/:id/deactivate', adminAuth, async (req, res) => {
  const id = req.params.id as string;
  try {
    await RoundService.deactivateRound(parseInt(id));
    res.json({ message: `Round ${id} deactivated successfully` });
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate round" });
  }
});

router.get('/admin/submissions', adminAuth, AdminController.listSubmissions);
router.post('/admin/evaluate/:id', adminAuth, AdminController.evaluateSubmission);
router.post('/admin/evaluate-round/:roundId', adminAuth, AdminController.evaluateRoundSequential);

// Seed Rounds (Helper)
router.post('/admin/seed-rounds', adminAuth, async (req, res) => {
  await prisma.$transaction([
    prisma.round.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        name: "Image Prompting",
        description: "Generate a stunning visual using AI.",
        is_active: true,
        is_locked: false
      },
      update: {
        name: "Image Prompting",
        description: "Generate a stunning visual using AI.",
        is_active: true,
        is_locked: false
      }
    }),
    prisma.round.upsert({
      where: { id: 2 },
      create: {
        id: 2,
        name: "Creative Text Prompting",
        description: "Write a short story that wows the judges.",
        is_active: false,
        is_locked: true
      },
      update: {
        name: "Creative Text Prompting",
        description: "Write a short story that wows the judges.",
        is_active: false,
        is_locked: true
      }
    }),
    prisma.round.upsert({
      where: { id: 3 },
      create: {
        id: 3,
        name: "Code Prompting",
        description: "A hidden trial for the elite.",
        is_active: false,
        is_locked: true
      },
      update: {
        name: "Code Prompting",
        description: "A hidden trial for the elite.",
        is_active: false,
        is_locked: true
      }
    })
  ]);
  res.json({ message: "Rounds seeded. Round 1 is active and unlocked by default." });
});

export default router;
