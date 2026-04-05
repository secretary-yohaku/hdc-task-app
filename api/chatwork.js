// Vercel Serverless Function - Chatwork API proxy
export default async function handler(req, res) {
  const token = process.env.CHATWORK_API_TOKEN;
  const roomId = process.env.CHATWORK_ROOM_ID;

  if (!token || !roomId) {
    return res.status(500).json({ error: "Chatwork設定がありません" });
  }

  try {
    const response = await fetch(
      `https://api.chatwork.com/v2/rooms/${roomId}/messages?force=1`,
      {
        headers: { "X-ChatWorkToken": token },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    const messages = await response.json();
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
