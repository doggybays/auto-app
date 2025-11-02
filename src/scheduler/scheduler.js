import schedule from 'node-schedule';
import { enqueuePostJob } from '../jobs/queue.js';
export function scheduleDailyJobs() {
  schedule.scheduleJob('0 13 * * *', async () => {
    console.log('Running scheduled job 13:00');
    await enqueuePostJob({ topic: 'exam day vibes', platforms: ['facebook','instagram','tiktok'] });
  });
  schedule.scheduleJob('0 21 * * *', async () => {
    console.log('Running scheduled job 21:00');
    await enqueuePostJob({ topic: 'study grind', platforms: ['facebook','instagram'] });
  });
  console.log('Scheduled daily posting jobs set up.');
}
export async function manualScheduleNow() {
  const job = await enqueuePostJob({ topic: 'manual trigger', platforms: ['facebook'] });
  return { jobId: job.id };
}
