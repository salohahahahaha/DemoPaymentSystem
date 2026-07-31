import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  let merchantBalance = await kv.get('merchant:balance');
  if (merchantBalance === null || merchantBalance === undefined) merchantBalance = 0;
  res.status(200).json({ merchantBalance });
}
