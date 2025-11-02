import axios from 'axios';
import { recordPost } from './analyticsService.js';

export async function postToFacebookImage(pageAccessToken, pageId, imageUrl, message, topic='') {
  const url = `https://graph.facebook.com/${pageId}/photos`;
  const params = { url: imageUrl, caption: message, access_token: pageAccessToken };
  const resp = await axios.post(url, null, { params });
  try { await recordPost('facebook', resp.data.id, topic, message, imageUrl); } catch(e){}
  return resp.data;
}

export async function postToInstagramImage(pageAccessToken, instagramBusinessId, imageUrl, caption, topic='') {
  const createUrl = `https://graph.facebook.com/v17.0/${instagramBusinessId}/media`;
  const createResp = await axios.post(createUrl, null, { params: { image_url: imageUrl, caption, access_token: pageAccessToken } });
  const creationId = createResp.data.id;
  const publishUrl = `https://graph.facebook.com/v17.0/${instagramBusinessId}/media_publish`;
  const publishResp = await axios.post(publishUrl, null, { params: { creation_id: creationId, access_token: pageAccessToken } });
  try { await recordPost('instagram', publishResp.data.id, topic, caption, imageUrl); } catch(e){}
  return publishResp.data;
}

export async function postToTikTokVideo(accessToken, videoUrl, caption, topic='') {
  throw new Error('TikTok automatic upload must be implemented using the official TikTok Developer two-step upload. See README.');
}
