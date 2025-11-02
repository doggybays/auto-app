import OpenAI from 'openai';
import sharp from 'sharp';
import fs from 'fs';
import { spawn } from 'child_process';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImageWithMemeText(prompt, topText = 'SEPARATED BUT STILL UNSTOPPABLE') {
  try {
    const imgResp = await openai.images.generate({ model: 'dall-e-3', prompt, size: '1920x1080' });
    const b64 = imgResp.data?.[0]?.b64_json;
    if (!b64) throw new Error('Image generation failed');
    const buf = Buffer.from(b64, 'base64');
    const svg = `<svg width="1920" height="240"><style>.title{ fill: white; font-size:64px; font-weight:700; font-family:Impact, Arial, sans-serif; stroke:black; stroke-width:6px }</style><text x="50%" y="50%" text-anchor="middle" class="title">${escapeXml(topText)}</text></svg>`;
    const out = await sharp(buf).resize(1920, 1080).composite([{ input: Buffer.from(svg), top: 20, left: 0 }]).jpeg({ quality: 90 }).toBuffer();
    return out;
  } catch (err) {
    console.error('Image generation error', err);
    throw err;
  }
}

export async function makeShortVideoFromImage(imagePath, outputPath, duration = 10) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-y','-loop','1','-i', imagePath,'-vf', `zoompan=z='min(zoom+0.0005,1.1)':d=${duration*25}`,'-t', String(duration),'-pix_fmt','yuv420p','-c:v','libx264', outputPath ]);
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve(outputPath);
      else reject(new Error('ffmpeg failed with code ' + code));
    });
  });
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'\"]/g, function (c) { switch (c) { case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case "'": return '&apos;'; case '"': return '&quot;'; } });
}
