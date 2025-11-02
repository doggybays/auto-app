import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import Sentry from '@sentry/node';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV || 'production', tracesSampleRate: 0.05 });
  process.on('unhandledRejection', (reason) => { Sentry.captureException(reason); });
  process.on('uncaughtException', (err) => { Sentry.captureException(err); });
}

import tiktokRouter from './src/services/tiktokRoutes.js';
import instagramRouter from './src/services/instagramRoutes.js';
import { makeCaption } from './src/services/aiService.js';
import { generateImageWithMemeText } from './src/services/mediaService.js';
import { uploadBufferToS3 } from './src/services/storageService.js';
import { enqueuePostJob } from './src/jobs/queue.js';
import { scheduleDailyJobs, manualScheduleNow } from './src/scheduler/scheduler.js';
import { initDb } from './src/services/analyticsService.js';
import { initTokenStore } from './src/services/tokenStore.js';

const app = express();
app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/tiktok', tiktokRouter);
app.use('/instagram', instagramRouter);

app.get('/', (req, res) => res.render('index', { version: '0.4.0' }));

app.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const captionText = await makeCaption(topic);
    const prompt = `anime style classroom masked hoodie guy, cinematic, high detail: ${topic}`;
    const imageBuffer = await generateImageWithMemeText(prompt, captionText.split('\n')[0]);
    const key = `memes/${Date.now()}.jpg`;
    const url = await uploadBufferToS3(imageBuffer, key);
    return res.json({ caption: captionText, imageUrl: url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/enqueue', async (req, res) => {
  try {
    const { topic, platforms } = req.body;
    if (!topic || !platforms) return res.status(400).json({ error: 'topic and platforms required' });
    const job = await enqueuePostJob({ topic, platforms });
    return res.json({ enqueued: true, jobId: job.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/admin/schedule-now', async (req, res) => {
  try {
    const result = await manualScheduleNow();
    return res.json({ result });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

(async () => {
  await initDb();
  scheduleDailyJobs();
  await initTokenStore();
})();

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}
export default app;
