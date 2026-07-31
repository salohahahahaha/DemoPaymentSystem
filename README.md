# SeemaNet Payment Demo

A demo "scan QR to pay" flow for the vehicle entry fee, like eSewa/Fonepay.

## How it works
1. `index.html` — the border-crossing form. Officer/owner fills vehicle number, name, fee amount, hits "Generate Payment QR".
2. A QR code appears, encoding a real link to `pay.html?txn=<id>`.
3. Owner scans it with their **actual phone camera** (from home, or anywhere) — it opens `pay.html` in their phone's browser.
4. `pay.html` shows a demo wallet (starts at Rs. 5000) and the amount due. Tapping "Confirm & Pay" deducts the amount.
5. The form page polls every 2 seconds and shows "✅ Payment Received" once paid.

Balances and transactions live in server memory — fine for a demo, resets if the server restarts.

## Run locally
```
npm install
npm start
```
Visit http://localhost:3000

## Deploy for real (so a phone can actually scan it)
You need a real public URL — pick one of these free options:

### Option A: Render.com (recommended, easiest)
1. Push this folder to a GitHub repo.
2. Go to https://render.com → New → Web Service → connect your repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Deploy. You'll get a URL like `https://seemanet-demo.onrender.com`.

### Option B: Railway.app
1. https://railway.app → New Project → Deploy from GitHub repo.
2. It auto-detects Node and runs `npm start`.
3. Generate a public domain from the service settings.

### Option C: Quick temporary tunnel (no deploy, for a live demo only)
If you just want it working for the next hour (e.g. during the hackathon judging):
```
npm start
```
then in another terminal:
```
npx localtunnel --port 3000
```
It gives you a temporary public URL (e.g. `https://random-name.loca.lt`) that forwards to your laptop. Good enough to scan live, but it dies when you close the terminal or your laptop sleeps — Render/Railway is safer for the actual event.

## Notes for the real SeemaNet integration
- Replace the in-memory `transactions`/`walletBalance` with your actual DB and real wallet/gateway logic (eSewa, Fonepay, Khalti APIs) later.
- The QR just needs to encode a URL — same idea works with any real payment gateway once you have API credentials.
