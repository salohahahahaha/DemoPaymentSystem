# SeemaNet Payment Demo (Vercel version)

Same "scan QR to pay" flow as before, restructured for Vercel:
- `/public/index.html` — officer/border form, generates QR (payer/receiver roles explained below)
- `/public/pay.html` — opens when the QR is scanned, shows demo payer wallet
- `/api/*.js` — serverless functions (replacing the old `server.js` Express server)
- Data (transactions, payer wallet, merchant/border-office balance) is stored in **Vercel KV**, not in-memory — this is required because serverless functions don't share memory between requests.

## Why this changed from the Express version
Vercel functions are stateless: each request can run on a different instance with a blank memory. The old `server.js` kept balances as plain JS variables, which worked fine on a persistent server (Render/Railway) but breaks silently on Vercel — a transaction created by one function call might not exist when the next call checks it. Vercel KV (a hosted Redis) fixes this by giving all functions a shared store.

## Setup steps

### 1. Push this project to GitHub (same as before)
```
git init
git add .
git commit -m "Vercel version with KV"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import into Vercel
- https://vercel.com → New Project → import your GitHub repo → Deploy
- It'll auto-detect the `/api` functions and `/public` static files, no config needed.

### 3. Attach a KV database (one-time)
- In your Vercel project → **Storage** tab → **Create Database** → choose **KV**
- Name it anything, pick a region close to your users
- Click **Connect** to your project — Vercel automatically injects the required environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.), you don't need to copy anything manually
- Redeploy the project once (Deployments tab → ⋯ → Redeploy) so the new env vars take effect

### 4. Test it
Open your Vercel URL (e.g. `https://seemanet-payment-demo.vercel.app`), fill the form, generate the QR, scan it with your phone, and confirm payment. The payer wallet starts at Rs. 5000 and the Border Office account starts at Rs. 0 — both live in KV now, so they persist correctly across the officer page and the phone page.

## Notes
- `server.js` from the earlier Express version is no longer used on Vercel — safe to delete, or keep for local testing without Vercel.
- Local testing on Vercel's own setup requires the Vercel CLI (`npm i -g vercel`, then `vercel dev`), which also needs the KV env vars — easiest to just test on the deployed URL.
