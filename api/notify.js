// Vercel Cron Function - 毎日15時（JST）に未完了タスクをChatworkに通知
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

function getDb() {
  const config = {
    apiKey: "AIzaSyCo9kqk1bc-PgFi9VcEV6XtegA0h34zz98",
    authDomain: "tasku-labo.firebaseapp.com",
    projectId: "tasku-labo",
    storageBucket: "tasku-labo.firebasestorage.app",
    messagingSenderId: "791519986771",
    appId: "1:791519986771:web:d172f96ac5a989200372a6",
  };
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  return getFirestore(app);
}

export default async function handler(req, res) {
  const token = process.env.CHATWORK_API_TOKEN;
  const roomId = process.env.CHATWORK_NOTIFY_ROOM_ID || process.env.CHATWORK_ROOM_ID;

  if (!token || !roomId) {
    return res.status(500).json({ error: "Chatwork設定がありません" });
  }

  try {
    // Firestoreから未完了タスクを取得
    const db = getDb();
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("completed", "==", false));
    const snapshot = await getDocs(q);

    const allTasks = snapshot.docs.map((d) => d.data());

    // 今日の日付（JST）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const todayJST = new Date(now.getTime() + jstOffset).toISOString().slice(0, 10);

    // 日付指定ありのタスク → 当日のもののみ通知
    // 日付指定なしのタスク → 常に通知
    const tasks = allTasks.filter((t) => {
      if (t.dueDate) return t.dueDate === todayJST;
      return true;
    });

    if (tasks.length === 0) {
      return res.status(200).json({ message: "本日通知対象のタスクなし" });
    }

    const todayTasks = tasks.filter((t) => t.dueDate === todayJST);
    const noDueTasks = tasks.filter((t) => !t.dueDate);

    // Chatworkメッセージ組み立て
    let body = "[info][title]📋 本日のタスク一覧（15:00時点）[/title]";

    if (todayTasks.length > 0) {
      body += `⚡ 本日期限のタスク（${todayTasks.length}件）\n`;
      todayTasks.forEach((t, i) => {
        const assignee = t.assignee || "未割当";
        const category =
          t.category === "parent" ? "【保護者連絡】" :
          t.category === "user_prep" ? "【利用者準備】" : "";
        body += `${i + 1}. ${category}${t.title}（👤${assignee}）\n`;
      });
    }

    if (noDueTasks.length > 0) {
      if (todayTasks.length > 0) body += `\n`;
      body += `📌 期限なしの未完了タスク（${noDueTasks.length}件）\n`;
      noDueTasks.forEach((t, i) => {
        const assignee = t.assignee || "未割当";
        const category =
          t.category === "parent" ? "【保護者連絡】" :
          t.category === "user_prep" ? "【利用者準備】" : "";
        body += `${i + 1}. ${category}${t.title}（👤${assignee}）\n`;
      });
    }

    body += "[/info]";

    // Chatwork APIに送信
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

    return res.status(200).json({
      message: `${tasks.length}件のタスクを通知しました（本日期限: ${todayTasks.length}件、期限なし: ${noDueTasks.length}件）`,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
