# 🌌 PROMPT WARS: The Ultimate AI Contest Platform

PROMPT WARS is a production-ready, cinematic web platform designed for AI prompting competitions. It features a triple-round structure, automated/manual AI evaluation via Gemini, and a high-fidelity "Star Wars" inspired sci-fi aesthetic.

---

## 🚀 Vision
To provide a secure, scalable, and visually stunning arena for prompt engineers to showcase their skills in image generation, creative writing, and logic.

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Axios, Lucide React.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Multer.
- **Database**: PostgreSQL (Supabase/Neon compatible).
- **AI**: Google Gemini AI (Gemini 1.5 Flash) with key rotation.
- **Security**: Zod (Validation), Express-Rate-Limit, IP-based anti-spam tracking.
- **DevOps**: GitHub Actions CI/CD, Husky, lint-staged.

---

## 📂 Project Structure
- `/frontend`: Next.js application with a responsive sci-fi dashboard.
- `/backend`: Express server handling submissions, IP tracking, and AI scoring.
- `/prompt-wars-pro-docs`: Original technical specifications and design docs.

---

## ⚙️ Quick Start

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. `cp .env.example .env` (Add your `DATABASE_URL` and `GEMINI_API_KEY_1/2`)
4. `npx prisma generate`
5. `npm run dev`

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

### 3. Initialization
Visit `http://localhost:3000/admin` and click **"Reset System"** or **"Re-Seed"** to initialize the competition rounds in your database.

---

## 🛡️ Security Features
- **IP Protection**: Prevents multiple submissions from the same device per round.
- **API Reliability**: Built-in key rotation to handle 2x+ more traffic than standard Gemini limits.
- **Manual Oversight**: Admins can trigger sequential AI evaluation to ensure fair and stable scoring.

---

## 📜 License
Internal Event Use Only.
