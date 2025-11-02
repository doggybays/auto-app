import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function makeCaption(topic) {
  const system = "You are a social media copywriter. Produce 3 one-line catchy captions and 10 hashtags, separated clearly.";
  const user = `Create 3 short captions and 10 hashtags for topic: ${topic}`;
  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      max_tokens: 200
    });
    return resp.choices?.[0]?.message?.content?.trim() || 'Separated but still unstoppable\n#meme';
  } catch (err) {
    console.error('AI caption error', err);
    return 'Separated but still unstoppable\n#meme';
  }
}
