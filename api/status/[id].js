import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { id } = req.query;
  const txn = await kv.get(`txn:${id}`);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });

  let merchantBalance = await kv.get('merchant:balance');
  if (merchantBalance === null || merchantBalance === undefined) merchantBalance = 0;

  res.status(200).json({ status: txn.status, merchantBalance });
}
