import { z } from 'zod';

export const round1Schema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  prompt_text: z.string().min(5, "Prompt must be at least 5 characters"),
  image_url: z.string().url("A valid image URL is required")
});

export const round2Schema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  prompt_text: z.string().min(5, "Prompt must be at least 5 characters"),
  text_output: z.string().min(10, "Story must be at least 10 characters")
});

export const round3Schema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  prompt_1: z.string().min(5, "Prompt 1 must be at least 5 characters"),
  prompt_2: z.string().min(5, "Prompt 2 must be at least 5 characters")
});
