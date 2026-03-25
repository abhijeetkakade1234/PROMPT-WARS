# 📡 API CONTRACT

## Submit Round 1

POST /submit/round1

Body:
{
  "prompt": "text",
  "image": file
}

## Submit Round 2

POST /submit/round2

{
  "prompt": "text",
  "output": "text"
}

## Submit Round 3

POST /submit/round3

{
  "prompt_1": "text",
  "prompt_2": "text"
}

## Leaderboard

GET /leaderboard
