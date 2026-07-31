import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { id } = req.query;
  const txn = await kv.get(`txn:${id}`);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });

  let walletBalance = await kv.get('wallet:balance');
  if (walletBalance === null || walletBalance === undefined) {
    walletBalance = 5000;
    await kv.set('wallet:balance', walletBalance);
  }

  res.status(200).json({ ...txn, walletBalance });
}
