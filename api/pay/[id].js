import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  const txn = await kv.get(`txn:${id}`);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });

  let walletBalance = await kv.get('wallet:balance');
  if (walletBalance === null || walletBalance === undefined) walletBalance = 5000;
  let merchantBalance = await kv.get('merchant:balance');
  if (merchantBalance === null || merchantBalance === undefined) merchantBalance = 0;

  if (txn.status === 'paid') {
    return res.status(200).json({ ok: true, alreadyPaid: true, walletBalance, merchantBalance });
  }

  if (walletBalance < txn.amount) {
    return res.status(400).json({ error: 'Insufficient balance', walletBalance });
  }

  walletBalance -= txn.amount;
  merchantBalance += txn.amount;
  txn.status = 'paid';
  txn.paidAt = Date.now();

  await kv.set('wallet:balance', walletBalance);
  await kv.set('merchant:balance', merchantBalance);
  await kv.set(`txn:${id}`, txn);

  res.status(200).json({ ok: true, walletBalance, merchantBalance });
}
