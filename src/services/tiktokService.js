import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
const BASE = 'https://open.tiktokapis.com';
export function getTikTokAuthUrl(clientKey, redirectUri, state = 'state123') {
  const params = new URLSearchParams({ client_key: clientKey, response_type: 'code', scope: 'video.upload user.info.basic', redirect_uri: redirectUri, state });
  return `${BASE}/platform/oauth/connect?${params.toString()}`;
}
export async function exchangeCodeForToken(clientKey, clientSecret, code, redirectUri) {
  const resp = await axios.post(`${BASE}/oauth/access_token/`, { client_key: clientKey, client_secret: clientSecret, code, grant_type: 'authorization_code', redirect_uri: redirectUri }, { headers: { 'Content-Type': 'application/json' } });
  return resp.data;
}
export async function refreshTikTokToken(clientKey, refreshToken) {
  const resp = await axios.post(`${BASE}/oauth/refresh_token/`, { client_key: clientKey, grant_type: 'refresh_token', refresh_token: refreshToken }, { headers: { 'Content-Type': 'application/json' } });
  return resp.data;
}
export async function uploadVideoChunked(accessToken, filePath, chunkSize = 5 * 1024 * 1024) {
  const initResp = await axios.post(`${BASE}/video/upload/`, null, { params: { access_token: accessToken } }).catch(e => { throw new Error('TikTok init upload failed: ' + (e?.response?.data || e.message)); });
  const initData = initResp.data || {};
  const uploadUrl = initData.upload_url || initData.upload_url_list?.[0];
  if (!uploadUrl) throw new Error('No upload url from init');
  const stat = fs.statSync(filePath);
  const totalSize = stat.size;
  const fd = fs.openSync(filePath, 'r');
  let offset = 0;
  let part = 0;
  while (offset < totalSize) {
    const size = Math.min(chunkSize, totalSize - offset);
    const buffer = Buffer.alloc(size);
    fs.readSync(fd, buffer, 0, size, offset);
    const form = new FormData();
    form.append('video', buffer, { filename: `part-${part}.mp4` });
    await axios.post(uploadUrl, form, { headers: form.getHeaders(), maxBodyLength: Infinity }).catch(e => { throw new Error('Chunk upload failed: ' + (e?.response?.data || e.message)); });
    offset += size; part += 1;
  }
  fs.closeSync(fd);
  const commitResp = await axios.post(`${BASE}/video/commit/`, null, { params: { access_token: accessToken, upload_id: initData.upload_id } }).catch(e => { /*ignore*/ });
  return { init: initData, commit: commitResp?.data };
}
export async function uploadVideoToTikTok(accessToken, videoPathOrUrl, caption = '') {
  if (videoPathOrUrl.startsWith('http')) {
    const tmp = '/tmp/tiktok_tmp_video.mp4';
    const resp = await axios.get(videoPathOrUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tmp, resp.data);
    const out = await uploadVideoChunked(accessToken, tmp);
    try { fs.unlinkSync(tmp); } catch(e) {}
    return out;
  } else {
    return await uploadVideoChunked(accessToken, videoPathOrUrl);
  }
}
