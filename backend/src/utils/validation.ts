import { z } from 'zod';

const MAX_PROMPT_CHARS = Number(process.env.MAX_PROMPT_CHARS || 1000);
const MIN_PROMPT_WORDS = Number(process.env.MIN_PROMPT_WORDS || 3);
const MIN_STORY_WORDS = Number(process.env.MIN_STORY_WORDS || 20);

const wordsCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

export const round1Schema = z.object({
  user_id: z
    .string()
    .trim()
    .min(2, "User ID is required")
    .max(64, "User ID must be at most 64 characters"),
  prompt_text: z
    .string()
    .min(5, "Prompt must be at least 5 characters")
    .max(MAX_PROMPT_CHARS, `Prompt must be at most ${MAX_PROMPT_CHARS} characters`),
  image_url: z.string().url().optional() // Handled by multer/cloudinary
}).refine((data) => wordsCount(data.prompt_text) >= MIN_PROMPT_WORDS, {
  message: `Prompt must be at least ${MIN_PROMPT_WORDS} words`,
  path: ['prompt_text']
});

export const round2Schema = z.object({
  user_id: z
    .string()
    .trim()
    .min(2, "User ID is required")
    .max(64, "User ID must be at most 64 characters"),
  prompt_text: z
    .string()
    .min(5, "Prompt must be at least 5 characters")
    .max(MAX_PROMPT_CHARS, `Prompt must be at most ${MAX_PROMPT_CHARS} characters`),
  text_output: z
    .string()
    .min(10, "Story must be at least 10 characters")
    .max(MAX_PROMPT_CHARS, `Story must be at most ${MAX_PROMPT_CHARS} characters`)
}).refine((data) => wordsCount(data.prompt_text) >= MIN_PROMPT_WORDS, {
  message: `Prompt must be at least ${MIN_PROMPT_WORDS} words`,
  path: ['prompt_text']
}).refine((data) => wordsCount(data.text_output) >= MIN_STORY_WORDS, {
  message: `Story must be at least ${MIN_STORY_WORDS} words`,
  path: ['text_output']
});

export const round3Schema = z.object({
  user_id: z
    .string()
    .trim()
    .min(2, "User ID is required")
    .max(64, "User ID must be at most 64 characters"),
  prompt_1: z
    .string()
    .min(5, "Prompt 1 must be at least 5 characters")
    .max(MAX_PROMPT_CHARS, `Prompt 1 must be at most ${MAX_PROMPT_CHARS} characters`),
  prompt_2: z
    .string()
    .min(5, "Prompt 2 must be at least 5 characters")
    .max(MAX_PROMPT_CHARS, `Prompt 2 must be at most ${MAX_PROMPT_CHARS} characters`)
}).refine((data) => wordsCount(data.prompt_1) >= MIN_PROMPT_WORDS, {
  message: `Prompt 1 must be at least ${MIN_PROMPT_WORDS} words`,
  path: ['prompt_1']
}).refine((data) => wordsCount(data.prompt_2) >= MIN_PROMPT_WORDS, {
  message: `Prompt 2 must be at least ${MIN_PROMPT_WORDS} words`,
  path: ['prompt_2']
});
