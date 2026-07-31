import { kv } from '@vercel/kv';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, vehicleNumber, ownerName } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const id = randomUUID().slice(0, 8);
  const txn = {
    id,
    amount: Number(amount),
    vehicleNumber: vehicleNumber || '-',
    ownerName: ownerName || '-',
    status: 'pending',
    createdAt: Date.now(),
  };
  await kv.set(`txn:${id}`, txn);

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['host'];
  res.status(200).json({ id, payUrl: `${proto}://${host}/pay.html?txn=${id}` });
}
