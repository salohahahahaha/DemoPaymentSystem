const express = require('express');
const { randomUUID } = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- In-memory "database" (demo only, resets on restart) ----
const transactions = {}; // txnId -> { amount, vehicleNumber, ownerName, status, createdAt }
let walletBalance = 5000; // NPR demo payer wallet balance
let merchantBalance = 0; // NPR demo SeemaNet/border-office receiving account balance

// Create a new payment request (called from the border-crossing form page)
app.post('/api/create-transaction', (req, res) => {
  const { amount, vehicleNumber, ownerName } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  const id = randomUUID().slice(0, 8);
  transactions[id] = {
    id,
    amount: Number(amount),
    vehicleNumber: vehicleNumber || '-',
    ownerName: ownerName || '-',
    status: 'pending',
    createdAt: Date.now(),
  };
  res.json({ id, payUrl: `${req.protocol}://${req.get('host')}/pay.html?txn=${id}` });
});

// Fetch transaction + current demo wallet balance (called from the pay page after scan)
app.get('/api/transaction/:id', (req, res) => {
  const txn = transactions[req.params.id];
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ ...txn, walletBalance });
});

// Confirm payment (called when user taps "Pay Now" on the pay page)
app.post('/api/pay/:id', (req, res) => {
  const txn = transactions[req.params.id];
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  if (txn.status === 'paid') return res.json({ ok: true, alreadyPaid: true, walletBalance });

  if (walletBalance < txn.amount) {
    return res.status(400).json({ error: 'Insufficient balance', walletBalance });
  }

  walletBalance -= txn.amount;
  merchantBalance += txn.amount;
  txn.status = 'paid';
  txn.paidAt = Date.now();
  res.json({ ok: true, walletBalance, merchantBalance });
});

// Poll status (called from the form page while waiting for the phone to pay)
app.get('/api/status/:id', (req, res) => {
  const txn = transactions[req.params.id];
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ status: txn.status, merchantBalance });
});

// Fetch just the merchant/border-office account balance (for display on the form page)
app.get('/api/merchant-balance', (req, res) => {
  res.json({ merchantBalance });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SeemaNet payment demo running on port ${PORT}`));
