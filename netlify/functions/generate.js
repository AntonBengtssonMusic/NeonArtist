exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "ok" };

  let body;
  try { body = JSON.parse(event.body); } catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { type, genre, artist, topic, mood } = body;

  let prompt;

  if (type === "prompt") {
    prompt = `You are an expert AI music prompt engineer for tools like Suno and Udio.

Generate a detailed, ready-to-use music prompt based on:
- Genre/style: ${genre || "not specified"}
- Sounds like: ${artist || "no specific artist"}
- Topic/theme: ${topic || "not specified"}
- Mood/energy: ${mood || "not specified"}

Return ONLY the prompt text — no explanations, no labels, no intro. Just the prompt itself, formatted for direct use in Suno or Udio. Keep it under 200 words. Be specific about instrumentation, tempo, vocals, atmosphere, and production style.`;
  } else if (type === "lyrics") {
    prompt = `You are a professional songwriter and lyricist.

Write a complete, original song about: "${topic}"
${artist ? `Style influence: ${artist}` : ""}
${genre ? `Genre: ${genre}` : ""}
${mood ? `Mood: ${mood}` : ""}

Structure: Verse 1, Pre-Chorus, Chorus, Verse 2, Pre-Chorus, Chorus, Bridge, Final Chorus.

Label each section clearly. Write full lyrics — not placeholders. Make it emotionally resonant, vivid, and ready to record. Return only the lyrics with section labels, nothing else.`;
  } else {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid type" }) };
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: data.error?.message || "API error" }) };

  return {
    statusCode: 200,
    headers: cors,
    body: JSON.stringify({ result: data.content[0].text }),
  };
};
