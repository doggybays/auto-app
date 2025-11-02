import axios from 'axios';
export async function exchangeShortForLongLived(shortLivedToken) {
  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.FACEBOOK_APP_SECRET}&access_token=${shortLivedToken}`;
  const resp = await axios.get(url);
  return resp.data;
}
export async function refreshInstagramToken(longLivedToken) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`;
  const resp = await axios.get(url);
  return resp.data;
}
export async function publishImageToInstagram(igUserId, longLivedToken, imageUrl, caption) {
  const createUrl = `https://graph.facebook.com/v17.0/${igUserId}/media`;
  const createResp = await axios.post(createUrl, null, { params: { image_url: imageUrl, caption, access_token: longLivedToken } });
  const creationId = createResp.data.id;
  const publishUrl = `https://graph.facebook.com/v17.0/${igUserId}/media_publish`;
  const publishResp = await axios.post(publishUrl, null, { params: { creation_id: creationId, access_token: longLivedToken }});
  return publishResp.data;
}
