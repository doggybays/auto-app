import express from 'express';
import { refreshInstagramToken } from './instagramService.js';
const router = express.Router();
router.get('/refresh', async (req, res) => {
  try {
    const token = process.env.TIKTOK_ACCESS_TOKEN || req.query.token;
    if (!token) return res.status(400).send('token required');
    const resp = await refreshInstagramToken(token);
    return res.json(resp);
  } catch (e) {
    console.error(e);
    return res.status(500).send('refresh failed');
  }
});
router.get('/connect', (req, res) => {
  res.send('Follow Meta docs to connect your Instagram Business account and provide tokens in .env');
});
export default router;
