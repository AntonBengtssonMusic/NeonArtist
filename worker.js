export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle AI generate API
    if (url.pathname === '/api/generate') {
      const cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      };

      if (request.method === 'OPTIONS') {
        return new Response('ok', { headers: cors });
      }

      let body;
      try { body = await request.json(); }
      catch { return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }); }

      const { type, genre, artist, topic, mood } = body;

      let prompt;

      if (type === 'prompt') {
        prompt = `You are an expert AI music prompt engineer for tools like Suno and Udio.

Generate a detailed, ready-to-use music prompt based on:
- Genre/style: ${genre || 'not specified'}
- Sounds like: ${artist || 'no specific artist'}
- Mood/energy: ${mood || 'not specified'}

Return ONLY the prompt text — no explanations, no labels, no intro. Just the prompt itself, formatted for direct use in Suno or Udio. Keep it under 200 words. Be specific about instrumentation, tempo, vocals, atmosphere, and production style.`;
      } else if (type === 'lyrics') {
        prompt = `You are a professional songwriter and lyricist.

Write a complete, original song about: "${topic}"
${artist ? `Style influence: ${artist}` : ''}
${genre ? `Genre: ${genre}` : ''}
${mood ? `Mood: ${mood}` : ''}

Structure: Verse 1, Pre-Chorus, Chorus, Verse 2, Pre-Chorus, Chorus, Bridge, Final Chorus.

Label each section clearly. Write full lyrics — not placeholders. Make it emotionally resonant, vivid, and ready to record. Return only the lyrics with section labels, nothing else.`;
      } else {
        return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || 'API error' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ result: data.content[0].text }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Everything else — serve static assets
    return env.ASSETS.fetch(request);
  }
};
