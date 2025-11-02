# Auto Meme App Starter (Full)

This starter generates memes/videos using OpenAI + FFmpeg, uploads to S3, and can auto-post to Facebook/Instagram/TikTok.
It includes a scheduler, job queue (BullMQ), token storage example, CI/CD, Terraform for infra, and a small admin UI.

See `.env.example` for required environment variables.

Run locally:
1. Copy `.env.example` -> `.env` and fill keys.
2. npm install
3. Start Redis (or set REDIS_URL to a hosted Redis)
4. npm run dev
5. Visit http://localhost:3000
