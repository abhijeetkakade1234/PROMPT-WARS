import { Request, Response } from 'express';
import { prisma } from '../index';
import { GeminiService } from '../services/geminiService';

export class AdminController {
  private static async pause(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static getErrorReason(error: any) {
    if (!error) return "Unknown evaluation error";

    const direct = typeof error?.message === 'string' ? error.message : '';
    const apiMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.error ||
      error?.error?.message ||
      '';

    const reason = (direct || apiMessage || '').toString().trim();
    if (reason) return reason;

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown evaluation error";
    }
  }

  private static async refreshLeaderboardForUser(userId: number) {
    const aggregate = await prisma.score.aggregate({
      _sum: { total_score: true },
      where: {
        submission: {
          user_id: userId
        }
      }
    });

    const total = aggregate._sum.total_score || 0;
    await prisma.leaderboard.upsert({
      where: { user_id: userId },
      update: { total_score: total },
      create: { user_id: userId, total_score: total }
    });
  }

  static async listSubmissions(req: Request, res: Response) {
    const { round_id } = req.query;
    try {
      const submissions = await prisma.submission.findMany({
        where: round_id ? { round_id: Number(round_id) } : {},
        select: {
          id: true,
          user_id: true,
          user: {
            select: {
              name: true
            }
          },
          round_id: true,
          is_evaluated: true,
          created_at: true,
          round1_data: true,
          round2_data: true,
          round3_data: true,
          scores: true
          // ip_address is omitted
        },
        orderBy: { created_at: 'desc' }
      });
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }

  static async evaluateSubmission(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const submission = await prisma.submission.findUnique({
        where: { id: Number(id) },
        include: { round1_data: true, round2_data: true, round3_data: true }
      });

      if (!submission) return res.status(404).json({ error: "Submission not found" });
      if (submission.is_evaluated) return res.status(400).json({ error: "Already evaluated" });

      let results;
      if (submission.round_id === 1 && submission.round1_data) {
        results = await GeminiService.evaluateImage(submission.round1_data.prompt_text, submission.round1_data.image_url);
      } else if (submission.round_id === 2 && submission.round2_data) {
        results = await GeminiService.evaluateText(submission.round2_data.prompt_text, submission.round2_data.text_output);
      } else if (submission.round_id === 3 && submission.round3_data) {
        results = await GeminiService.evaluateRound3(submission.round3_data.prompt_1, submission.round3_data.prompt_2);
      } else {
        return res.status(400).json({ error: "Unsupported round for AI evaluation" });
      }

      await prisma.score.create({
        data: {
          submission_id: submission.id,
          total_score: results.total_score,
          breakdown_json: results
        }
      });

      await prisma.submission.update({
        where: { id: submission.id },
        data: { is_evaluated: true }
      });

      await AdminController.refreshLeaderboardForUser(submission.user_id);

      res.json({ message: "Evaluated successfully", results });
    } catch (error) {
      res.status(500).json({ error: "Evaluation failed" });
    }
  }

  static async evaluateRoundSequential(req: Request, res: Response) {
    const { roundId } = req.params;
    try {
      if (![1, 2, 3].includes(Number(roundId))) {
        return res.status(400).json({ error: "Only Round 1, Round 2, and Round 3 support AI evaluation" });
      }

      const pending = await prisma.submission.findMany({
        where: { round_id: Number(roundId), is_evaluated: false },
        include: { round1_data: true, round2_data: true, round3_data: true }
      });

      const processed: number[] = [];
      const failed: Array<{ submission_id: number; reason: string }> = [];
      for (const sub of pending) {
        try {
          let results;
          if (sub.round_id === 1 && sub.round1_data) {
            results = await GeminiService.evaluateImage(sub.round1_data.prompt_text, sub.round1_data.image_url);
          } else if (sub.round_id === 2 && sub.round2_data) {
            results = await GeminiService.evaluateText(sub.round2_data.prompt_text, sub.round2_data.text_output);
          } else if (sub.round_id === 3 && sub.round3_data) {
            results = await GeminiService.evaluateRound3(sub.round3_data.prompt_1, sub.round3_data.prompt_2);
          }

          if (results) {
            await prisma.score.create({
              data: {
                submission_id: sub.id,
                total_score: results.total_score,
                breakdown_json: results
              }
            });
            await prisma.submission.update({
              where: { id: sub.id },
              data: { is_evaluated: true }
            });

            await AdminController.refreshLeaderboardForUser(sub.user_id);
            processed.push(sub.id);
          } else {
            failed.push({ submission_id: sub.id, reason: "No evaluation result returned" });
          }
          // Keep evaluation pacing gentle to avoid quota spikes during events.
          await AdminController.pause(1000);
        } catch (e: any) {
          if (GeminiService.isRateLimitedError(e)) {
            console.warn(`Rate limit encountered while evaluating submission ${sub.id}. Cooling down for 20 seconds.`);
            await AdminController.pause(20000);
          }
          failed.push({ submission_id: sub.id, reason: AdminController.getErrorReason(e) });
          console.error(`Failed to evaluate submission ${sub.id}`, e);
        }
      }

      res.json({
        message: `Processed ${processed.length}/${pending.length} submissions`,
        total_pending: pending.length,
        processed_count: processed.length,
        failed_count: failed.length,
        processed_ids: processed,
        failed
      });
    } catch (error) {
      res.status(500).json({ error: "Bulk evaluation failed" });
    }
  }
}
