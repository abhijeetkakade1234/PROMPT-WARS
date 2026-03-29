# API CONTRACT

## Submit Round 1

POST /api/submit/round1

Content-Type: multipart/form-data

Body:
{
  "user_id": "1",
  "prompt_text": "text",
  "image": file
}

## Submit Round 2

POST /api/submit/round2

Content-Type: application/json

Body:
{
  "user_id": "1",
  "prompt_text": "text",
  "text_output": "text"
}

## Submit Round 3

POST /api/submit/round3

Content-Type: application/json

Body:
{
  "user_id": "1",
  "prompt_1": "text",
  "prompt_2": "text"
}

## Leaderboard

GET /api/leaderboard

## User Submissions

GET /api/submissions/{user_id}

## Troubleshooting

- If `GET /api/rounds` returns `500` or `503`, verify backend `DATABASE_URL` starts with `postgresql://` or `postgres://`.
- Ensure database connectivity is healthy before starting backend.
- If schema is missing, run `npx prisma db push` in `backend` and seed rounds via admin endpoint.

## Operational Limits

- Prompt fields (`prompt_text`, `prompt_1`, `prompt_2`) are capped at `1000` chars by default.
- You can override with backend env: `MAX_PROMPT_CHARS`.
- Bulk AI evaluation includes cooldown/backoff when Gemini rate limits are hit.
- Gemini model selection supports fallback chain via env:
  - `GEMINI_MODEL_CANDIDATES=gemini-2.5-flash,gemini-2.0-flash,gemini-1.5-flash-002`
