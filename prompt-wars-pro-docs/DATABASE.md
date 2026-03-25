# 🗄️ DATABASE (PostgreSQL)

## Full Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user'
);

CREATE TABLE rounds (
    id SERIAL PRIMARY KEY,
    name TEXT,
    is_active BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    round_id INT REFERENCES rounds(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE round1_submissions (
    submission_id INT PRIMARY KEY REFERENCES submissions(id),
    prompt_text TEXT,
    image_url TEXT
);

CREATE TABLE round2_submissions (
    submission_id INT PRIMARY KEY REFERENCES submissions(id),
    prompt_text TEXT,
    text_output TEXT
);

CREATE TABLE round3_submissions (
    submission_id INT PRIMARY KEY REFERENCES submissions(id),
    prompt_1 TEXT,
    prompt_2 TEXT
);

CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    submission_id INT REFERENCES submissions(id),
    total_score FLOAT,
    breakdown_json JSONB
);

CREATE TABLE leaderboard (
    user_id INT PRIMARY KEY REFERENCES users(id),
    total_score FLOAT DEFAULT 0
);
```
