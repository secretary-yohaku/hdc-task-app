// Vercel Cron Function - 2週間に1回（火曜）インク・消耗品チェックリマインド
export default async function handler(req, res) {
  const token = process.env.CHATWORK_API_TOKEN;
  const roomId = process.env.CHATWORK_NOTIFY_ROOM_ID || process.env.CHATWORK_ROOM_ID;

  if (!token || !roomId) {
    return res.status(500).json({ error: "Chatwork設定がありません" });
  }

  // 2週間に1回の判定（基準日からの週数が偶数かどうか）
  const now = new Date();
  const jst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  // 2026-01-06（火曜）を基準日とする
  const baseDate = new Date(2026, 0, 6);
  const diffDays = Math.floor((jst - baseDate) / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffWeeks % 2 !== 0) {
    return res.status(200).json({ message: "今週はスキップ（隔週）" });
  }

  try {
    const body = "[info]🖨️ インク・消耗品チェックの日です！残量確認して、残り1本以下なら今日中に発注してください[/info]";

    const response = await fetch(
      `https://api.chatwork.com/v2/rooms/${roomId}/messages`,
      {
        method: "POST",
        headers: {
          "X-ChatWorkToken": token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `body=${encodeURIComponent(body)}`,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }

    return res.status(200).json({ message: "インクリマインド送信完了" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
