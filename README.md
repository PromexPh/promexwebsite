# promexPH

Website for Promex (promexph.com).

The app lives in [`nextjs/`](nextjs/). It's a Next.js app deployed on Vercel from `main`
(Vercel Root Directory: `nextjs`). Every push to `main` goes to production.

## Local development

```bash
cd nextjs
npm install
npm run dev
```

Then open http://localhost:3000.

Environment variables go in `nextjs/.env.local`, which is gitignored. Never commit it.

## Building

```bash
cd nextjs
npm run build
```
