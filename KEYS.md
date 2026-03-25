# 🔑 PROMPT WARS: API Keys & Database Guide

This guide will help you get the required credentials to run the competition. Give this to your friend!

---

## 1. Google Gemini AI Keys (Judging)
The platform uses **Gemini 1.5 Flash** to judge submissions. You need at least one key, but two keys are recommended for high traffic.

1. **Go to**: [Google AI Studio](https://aistudio.google.com/)
2. **Sign in**: Use any Google Account.
3. **Get API Key**: 
   - Click the **"Get API key"** button in the sidebar.
   - Click **"Create API key in new project"**.
4. **Copy the Key**: You'll get a string like `AIzaSy...`.
5. **Repeat**: If you want rotation, create a second key in a different project or account.
6. **Paste into `.env`**:
   ```env
   GEMINI_API_KEY_1="your_first_key"
   GEMINI_API_KEY_2="your_second_key_optional"
   ```

---

## 2. PostgreSQL Database (Storage)
You need a database to store submissions and scores. We recommend **Neon.tech** for a free, fast setup.

1. **Go to**: [Neon.tech](https://neon.tech/)
2. **Create Project**: Name it "Prompt Wars".
3. **Get Connection String**:
   - In the dashboard, look for the **"Connection Details"** box.
   - Ensure the dropdown says **"Pooled Connection"**.
   - Copy the string that looks like: `postgresql://alex:password@ep-cool-darkness-1234.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Paste into `.env`**:
   ```env
   DATABASE_URL="your_copied_string"
   ```

---

## 3. Admin Access Key (Command Center)
This is a password YOU choose to protect the /admin dashboard.

1. **Think of a secret**: e.g., `war-room-2026`.
2. **Paste into `.env`**:
   ```env
   ADMIN_SECRET="war-room-2026"
   ```
3. **Use it**: When you visit `localhost:3000/admin`, enter this secret to unlock the controls.

---

## 🛠️ Summary Check
Your final `.env` file should look like this:
```env
DATABASE_URL="postgresql://..."
GEMINI_API_KEY_1="AIza..."
GEMINI_API_KEY_2="AIza..."
ADMIN_SECRET="your_secret"
PORT=5000
```
