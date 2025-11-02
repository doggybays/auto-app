import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';
import { runJob } from './runner.js';
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const queueName = 'post-queue';
export const queue = new Queue(queueName, { connection });
new QueueScheduler(queueName, { connection });
export async function enqueuePostJob(payload) { const job = await queue.add('generate-and-post', payload, { attempts: 5, backoff: { type: 'exponential', delay: 5000 } }); return job; }
const worker = new Worker(queueName, async job => { return await runJob(job.data); }, { connection });
worker.on('completed', (job, returnvalue) => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job.id, err));
