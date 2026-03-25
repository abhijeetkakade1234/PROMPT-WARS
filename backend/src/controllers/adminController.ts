import { Request, Response } from 'express';
import { prisma } from '../index';
import { GeminiService } from '../services/geminiService';

export class AdminController {
  static async listSubmissions(req: Request, res: Response) {
    const { round_id } = req.query;
    try {
      const submissions = await prisma.submission.findMany({
        where: round_id ? { round_id: Number(round_id) } : {},
        select: {
          id: true,
          user_id: true,
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
        include: { round1_data: true, round2_data: true }
      });

      if (!submission) return res.status(404).json({ error: "Submission not found" });
      if (submission.is_evaluated) return res.status(400).json({ error: "Already evaluated" });

      let results;
      if (submission.round_id === 1 && submission.round1_data) {
        results = await GeminiService.evaluateImage(submission.round1_data.prompt_text, submission.round1_data.image_url);
      } else if (submission.round_id === 2 && submission.round2_data) {
        results = await GeminiService.evaluateText(submission.round2_data.prompt_text, submission.round2_data.text_output);
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

      res.json({ message: "Evaluated successfully", results });
    } catch (error) {
      res.status(500).json({ error: "Evaluation failed" });
    }
  }

  static async evaluateRoundSequential(req: Request, res: Response) {
    const { roundId } = req.params;
    try {
      const pending = await prisma.submission.findMany({
        where: { round_id: Number(roundId), is_evaluated: false },
        include: { round1_data: true, round2_data: true }
      });

      const processed = [];
      for (const sub of pending) {
        try {
          let results;
          if (sub.round_id === 1 && sub.round1_data) {
            results = await GeminiService.evaluateImage(sub.round1_data.prompt_text, sub.round1_data.image_url);
          } else if (sub.round_id === 2 && sub.round2_data) {
            results = await GeminiService.evaluateText(sub.round2_data.prompt_text, sub.round2_data.text_output);
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
            processed.push(sub.id);
          }
          // Small delay to be extra safe with rate limits although service handles key rotation
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (e) {
          console.error(`Failed to evaluate submission ${sub.id}`, e);
        }
      }

      res.json({ message: `Processed ${processed.length} submissions`, processed_ids: processed });
    } catch (error) {
      res.status(500).json({ error: "Bulk evaluation failed" });
    }
  }
}
