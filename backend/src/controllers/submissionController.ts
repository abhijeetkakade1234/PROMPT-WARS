import { Request, Response } from 'express';
import { prisma } from '../index';
import { GeminiService } from '../services/geminiService';
import { RoundService } from '../services/roundService';
import { round1Schema, round2Schema, round3Schema } from '../utils/validation';

export class SubmissionController {
  static async submitRound1(req: Request, res: Response) {
    const validated = round1Schema.safeParse(req.body);
    if (!validated.success) return res.status(400).json({ error: validated.error.format() });

    const { user_id, prompt_text } = validated.data;
    const image_url = (req.file as any)?.path; // Cloudinary URL
    
    if (!image_url) return res.status(400).json({ error: "Image transmission failed (Cloudinary error)" });

    const ip_address = req.ip;
    
    const isActive = await RoundService.isRoundActionable(1);
    if (!isActive) return res.status(403).json({ error: "Round 1 is locked or inactive" });

    // Anti-spam: check if this IP or UserID already submitted for this round
    const existing = await prisma.submission.findFirst({
      where: {
        round_id: 1,
        OR: [
          { ip_address },
          { user_id }
        ]
      }
    });

    if (existing) return res.status(403).json({ error: "Transmission Blocked: Neural Signature or IP already recorded for this round." });

    try {
      const submission = await prisma.submission.create({
        data: {
          user_id,
          round_id: 1,
          ip_address,
          round1_data: {
            create: { prompt_text, image_url }
          }
        }
      });

      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ error: "Submission failed" });
    }
  }

  static async submitRound2(req: Request, res: Response) {
    const validated = round2Schema.safeParse(req.body);
    if (!validated.success) return res.status(400).json({ error: validated.error.format() });

    const { user_id, prompt_text, text_output } = validated.data;
    const ip_address = req.ip;
    
    const isActive = await RoundService.isRoundActionable(2);
    if (!isActive) return res.status(403).json({ error: "Round 2 is locked or inactive" });

    // Anti-spam: check if this IP or UserID already submitted for this round
    const existing = await prisma.submission.findFirst({
      where: {
        round_id: 2,
        OR: [
          { ip_address },
          { user_id }
        ]
      }
    });

    if (existing) return res.status(403).json({ error: "Transmission Blocked: Neural Signature or IP already recorded for this round." });

    try {
      const submission = await prisma.submission.create({
        data: {
          user_id,
          round_id: 2,
          ip_address,
          round2_data: {
            create: { prompt_text, text_output }
          }
        }
      });

      res.status(201).json(submission);
    } catch (error) {
      res.status(500).json({ error: "Submission failed" });
    }
  }

  static async submitRound3(req: Request, res: Response) {
    const validated = round3Schema.safeParse(req.body);
    if (!validated.success) return res.status(400).json({ error: validated.error.format() });

    const { user_id, prompt_1, prompt_2 } = validated.data;
    const ip_address = req.ip;
    
    const isActive = await RoundService.isRoundActionable(3);
    if (!isActive) return res.status(403).json({ error: "Round 3 is hidden or inactive" });

    // Anti-spam: check if this IP or UserID already submitted for this round
    const existing = await prisma.submission.findFirst({
      where: {
        round_id: 3,
        OR: [
          { ip_address },
          { user_id }
        ]
      }
    });

    if (existing) return res.status(403).json({ error: "Transmission Blocked: Neural Signature or IP already recorded for this round." });

    if (!prompt_1 || !prompt_2) {
      return res.status(400).json({ error: "At least two prompts are required" });
    }

    try {
      const submission = await prisma.submission.create({
        data: {
          user_id,
          round_id: 3,
          ip_address,
          round3_data: {
            create: { prompt_1, prompt_2 }
          }
        }
      });

      res.status(201).json({ message: "Round 3 submission successful. Good luck with the live demo!", submission_id: submission.id });
    } catch (error) {
      res.status(500).json({ error: "Submission failed" });
    }
  }
}
