import express from 'express';
import { getTikTokAuthUrl, exchangeCodeForToken, uploadVideoToTikTok } from './tiktokService.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
router.get('/connect', (req, res) => {
  const url = getTikTokAuthUrl(process.env.TIKTOK_CLIENT_KEY, process.env.TIKTOK_REDIRECT_URI);
  res.redirect(url);
});
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');
  try {
    const tokenResp = await exchangeCodeForToken(process.env.TIKTOK_CLIENT_KEY, process.env.TIKTOK_CLIENT_SECRET, code, process.env.TIKTOK_REDIRECT_URI);
    req.session.tiktok = tokenResp;
    res.send('TikTok connected. You may close this window.');
  } catch (e) {
    console.error(e);
    res.status(500).send('TikTok connect error: ' + e.message);
  }
});
router.post('/upload-local', async (req, res) => {
  try {
    const token = req.session?.tiktok?.access_token || process.env.TIKTOK_ACCESS_TOKEN;
    if (!token) return res.status(400).send('No TikTok token. Connect first.');
    const { localPath, caption } = req.body;
    if (!localPath) return res.status(400).send('localPath required');
    const result = await uploadVideoToTikTok(token, localPath, caption || '');
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
export default router;
