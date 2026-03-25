# ⚙️ BACKEND (Node.js + TypeScript + Express)

## Install

```bash
npm init -y
npm install express cors dotenv pg multer
npm install -D typescript ts-node-dev @types/node @types/express
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "outDir": "./dist",
    "esModuleInterop": true
  }
}
```

## Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── db/
│   ├── middleware/
│   └── index.ts
```

## index.ts

```ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log("Server running");
});
```

## Round Validation Logic

- Only active round allowed
- Prevent duplicate submission
- Lock previous rounds

## File Upload

Use multer for image upload.
