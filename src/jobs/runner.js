import { makeCaption } from '../services/aiService.js';
import { generateImageWithMemeText, makeShortVideoFromImage } from '../services/mediaService.js';
import { uploadBufferToS3, uploadFileToS3 } from '../services/storageService.js';
import { postToFacebookImage, postToInstagramImage, postToTikTokVideo } from '../services/publisherService.js';
import fs from 'fs';
import path from 'path';
export async function runJob({ topic, platforms = ['facebook'] }) {
  const caption = await makeCaption(topic);
  const topLine = caption.split('\n')[0] || 'SEPARATED BUT STILL UNSTOPPABLE';
  const prompt = `anime classroom masked hoodie guy cinematic: ${topic}`;
  const buf = await generateImageWithMemeText(prompt, topLine);
  const key = `memes/${Date.now()}.jpg`;
  const imageUrl = await uploadBufferToS3(buf, key);
  const results = { imageUrl, caption: topLine, posts: {} };
  if (platforms.includes('tiktok') || platforms.includes('instagram_video')) {
    const tmpImg = path.join('/tmp', `img-${Date.now()}.jpg`);
    fs.writeFileSync(tmpImg, buf);
    const tmpVideo = path.join('/tmp', `vid-${Date.now()}.mp4`);
    await makeShortVideoFromImage(tmpImg, tmpVideo, 10);
    const videoKey = `videos/${Date.now()}.mp4`;
    const videoUrl = await uploadFileToS3(tmpVideo, videoKey);
    results.videoUrl = videoUrl;
    try { fs.unlinkSync(tmpImg); fs.unlinkSync(tmpVideo); } catch(e) {}
  }
  if (platforms.includes('facebook')) {
    try { const fb = await postToFacebookImage(process.env.META_PAGE_ACCESS_TOKEN, process.env.META_PAGE_ID, imageUrl, topLine, topic); results.posts.facebook = fb; } catch (e) { results.posts.facebook = { error: e.message }; }
  }
  if (platforms.includes('instagram')) {
    try { const ig = await postToInstagramImage(process.env.META_PAGE_ACCESS_TOKEN, process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID, imageUrl, topLine, topic); results.posts.instagram = ig; } catch (e) { results.posts.instagram = { error: e.message }; }
  }
  if (platforms.includes('tiktok')) {
    try { if (!results.videoUrl) throw new Error('No video created for TikTok'); const tk = await postToTikTokVideo(process.env.TIKTOK_ACCESS_TOKEN, results.videoUrl, topLine, topic); results.posts.tiktok = tk; } catch (e) { results.posts.tiktok = { error: e.message }; }
  }
  return results;
}
