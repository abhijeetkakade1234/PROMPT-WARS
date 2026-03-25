# 🎨 FRONTEND (Next.js App Router)

## Setup

```bash
npx create-next-app@latest
npm install axios
```

## Folder Structure

```
app/
├── page.tsx
├── dashboard/
│   └── page.tsx
├── components/
│   ├── RoundCard.tsx
│   ├── SubmissionModal.tsx
```

## UI Logic

- Show 3 rounds
- Disable locked rounds
- Show 'Coming Soon' for Round 3

## Example Component

```tsx
export default function RoundCard({ round, active }) {
  return (
    <div>
      <h2>{round.name}</h2>
      {!active && <p>Locked</p>}
    </div>
  );
}
```
