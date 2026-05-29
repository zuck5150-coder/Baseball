# Baseball Command Center

Production-ready Next.js scaffold for the Baseball Command Center app.

## What is included

- Mobile-first React/Next.js app
- Live MLB schedule and box-score cards
- Embedded highlight feed
- Baseball Twitter-style social feed
- League leaders with All MLB / AL / NL filters
- Backend API routes for schedule, clips, and leaders
- Tailwind styling
- Vercel-ready deployment setup

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Create a GitHub repo named `baseball-command-center`.
2. Upload these files to the repo.
3. Go to Vercel and import the repo.
4. Click Deploy.

## Important notes

The backend proxy routes reduce frontend load and make the app more stable than the Canvas-only prototype. For true production push notifications, add Firebase Cloud Messaging or OneSignal later.
