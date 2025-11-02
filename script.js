// script.js — client-only meme generator
const canvas = document.getElementById('memeCanvas');
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const randomBtn = document.getElementById('randomBtn');
const topInput = document.getElementById('topInput');
const bottomInput = document.getElementById('bottomInput');
const bgSelect = document.getElementById('bgSelect');
const vibeSelect = document.getElementById('vibeSelect');

const WATERMARK = "Malaysian Jokes Hub";

// Simple local backgrounds: colored blocks and procedural gradients
function drawBackground(style) {
  const w = canvas.width, h = canvas.height;
  if (style === 'mamak') {
    // warm coffee gradient
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#f6e7d8'); g.addColorStop(1,'#f0c987');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  } else if (style === 'school') {
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#e2efff'); g.addColorStop(1,'#bfe0ff');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  } else if (style === 'bus') {
    const g = ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#ffeedd'); g.addColorStop(1,'#ffd7b5');
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  } else if (style === 'generic') {
    ctx.fillStyle = '#1f2937'; ctx.fillRect(0,0,w,h);
  } else {
    // random trendy gradient
    const c1 = ['#ff9a9e','#a18cd1','#fbc2eb','#f6d365','#f093fb'][Math.floor(Math.random()*5)];
    const c2 = ['#fad0c4','#fbc2eb','#a6c0fe','#ffd6a5','#fdfbfb'][Math.floor(Math.random()*5)];
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
  }
}

// text drawing helpers
function drawTopText(text) {
  if (!text) return;
  const w = canvas.width;
  ctx.save();
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 12;
  ctx.font = 'bold 72px Impact, Arial';
  ctx.textAlign = 'center';
  wrapText(ctx, text.toUpperCase(), w/2, 140, w - 120, 72);
  ctx.restore();
}

function drawBottomText(text) {
  if (!text) return;
  const w = canvas.width, h = canvas.height;
  ctx.save();
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'rgba(0,0,0,0.8)';
  ctx.lineWidth = 12;
  ctx.font = 'bold 64px Impact, Arial';
  ctx.textAlign = 'center';
  wrapText(ctx, text.toUpperCase(), w/2, h - 200, w - 120, 64);
  ctx.restore();
}

function drawWatermark() {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = '600 20px Inter, Arial';
  ctx.textAlign = 'left';
  ctx.fillText(WATERMARK, 20, canvas.height - 28);
  ctx.restore();
}

// wrap text utility
function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '', testLine, metrics, testWidth;
  for (let n = 0; n < words.length; n++) {
    const word = words[n];
    testLine = line + word + ' ';
    metrics = context.measureText(testLine);
    testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.strokeText(line, x, y);
      context.fillText(line, x, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.strokeText(line, x, y);
  context.fillText(line, x, y);
}

// random caption generator for B+E: Malaysia life + TikTok trending blend
const captionTemplates = [
  // Malaysia daily life
  "When TNB bill datang and you only have RM2 in wallet",
  "Mamak uncle: 'Nanti kau balik, punya la story' — Me: no plans",
  "My Grab driver knows more about my life than my ex",
  "SPM student: 'I studied 2 hours' — SPM exam: 'nah fam'",
  "Waiting for LRT like it's a Pokémon spawn",
  // TikTok trending style
  "POV: You thought you saved money — then TNB hit",
  "That moment the auntie at pasar calls you 'cik' and you feel 80",
  "This trend but make it Malaysian: {replace_with_local}",
  "When the nasi lemak is RM1 extra but still worth it",
  "Try not to laugh: Malaysian edition (you will fail)"
];

const hashtags = [
  "#MalaysianJokes","#Lepak","#Mamak","#TNB","#SPM","#GrabStories","#MRT","#NasiLemak","#TikTokMY","#Malaysia"
];

function makeRandomCaption() {
  const t = captionTemplates[Math.floor(Math.random()*captionTemplates.length)];
  // sometimes tweak for local flavor
  const fill = ["mamak edition","with teh tarik","in KL","during raya","after tuition"];
  return `${t.includes('{replace_with_local}') ? t.replace('{replace_with_local}', fill[Math.floor(Math.random()*fill.length)]) : t}\n${pickHashtags(4)}`;
}
function pickHashtags(n){ const pick = []; const tmp = [...hashtags]; for(let i=0;i<n;i++){ const idx=Math.floor(Math.random()*tmp.length); pick.push(tmp.splice(idx,1)[0]);} return pick.join(' '); }

function generateMeme() {
  const top = topInput.value.trim();
  const bottom = bottomInput.value.trim();
  const bg = bgSelect.value;
  const vibe = vibeSelect.value;

  drawBackground(bg === 'random' ? 'random' : bg);

  // optional: place a subtle trending badge (top-right)
  if (vibe === 'tiktok' || vibe === 'both') {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(canvas.width-220, 40, 200, 60);
    ctx.fillStyle = 'white';
    ctx.font = '600 22px Inter, Arial';
    ctx.fillText('Trending • Malaysian Jokes Hub', canvas.width-120, 80);
    ctx.restore();
  }

  // draw black translucent panel for readability
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(40, 90, canvas.width-80, 420);
  ctx.restore();

  // draw texts
  drawTopText(top);
  drawBottomText(bottom);

  // default filler if both empty
  if (!top && !bottom) {
    const caption = makeRandomCaption();
    drawTopText(caption.split('\\n')[0]);
    drawBottomText(caption.split('\\n').slice(1).join(' '));
  }

  drawWatermark();
  downloadBtn.disabled = false;
}

// download
function downloadImage() {
  const url = canvas.toDataURL('image/jpeg', 0.95);
  const a = document.createElement('a');
  a.href = url;
  a.download = `malaysia_jokes_${Date.now()}.jpg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// wire up buttons
generateBtn.addEventListener('click', generateMeme);
downloadBtn.addEventListener('click', downloadImage);
randomBtn.addEventListener('click', () => {
  const caption = makeRandomCaption().split('\\n');
  topInput.value = caption[0] || '';
  bottomInput.value = caption[1] || '';
});

window.addEventListener('load', () => {
  // initial meme
  generateMeme();
});
