// キーワード定義
const KEYWORDS = [
  { pattern: "受給者証", title: "📄 受給者証確認" },
  { pattern: "持たせています", title: "📦 持ち物確認" },
  { pattern: "預けています", title: "📦 預かり物確認" },
  { pattern: "ご確認お願い", title: "📋 確認依頼" },
];

// Chatworkタグ・メタ情報を除去
function cleanChatworkText(text) {
  return text
    // [hr] [info] [title] [/title] [/info] などのタグを除去
    .replace(/\[\/?\w+\]/g, "")
    // (commentId: 123) や (commentld: 123) を除去
    .replace(/\(comment[Il]d\s*[:：]\s*\d+\s*\)/gi, "")
    // 空行が連続する場合は1つにまとめる
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseChatwork(text) {
  if (!text.trim()) return [];
  text = cleanChatworkText(text);

  // メッセージブロックごとに分割（「📥」で区切り）
  const blocks = text.split(/(?=📥)/).filter((b) => b.trim());
  // 📥がない場合はテキスト全体を1ブロックとして扱う
  const messageBlocks = blocks.length > 0 ? blocks : [text];
  const results = [];

  for (const block of messageBlocks) {
    const blockText = block.trim();
    const lines = blockText.split("\n").map((l) => l.trim());

    // 「・保護者：〇〇さん」から保護者名を取得
    let parentName = "";
    for (const line of lines) {
      const match = line.match(/・保護者[：:](.+?)(?:さん|様)?$/);
      if (match) {
        parentName = match[1].trim();
        break;
      }
    }

    // ブロック全体でどのキーワードにヒットするかチェック（1ブロック1キーワード1タスク）
    const matchedKeywords = new Set();
    for (const line of lines) {
      for (const kw of KEYWORDS) {
        if (line.includes(kw.pattern)) {
          matchedKeywords.add(kw);
        }
      }
    }

    for (const kw of matchedKeywords) {
      const name = parentName || findSender(lines);
      results.push({
        title: name
          ? `${kw.title}【${name} 様】`
          : `${kw.title}【保護者】`,
        assignee: "未割当",
        note: blockText,
        category: "parent",
        completed: false,
        createdAt: new Date().toISOString(),
        source: "chatwork",
        senderName: name,
      });
    }
  }
  return results;
}

// フォールバック：「・保護者：」がない場合の送信者検出
function findSender(lines) {
  for (const line of lines) {
    if (!line || line.startsWith("📥") || line.startsWith("・")) continue;
    if (/^\d{1,2}:\d{2}/.test(line)) continue;
    if (/^\d{4}[\/\-]/.test(line)) continue;
    if (KEYWORDS.some((kw) => line.includes(kw.pattern))) continue;
    if (line.startsWith("[To:") || line.startsWith("To:")) continue;
    if (line.length > 0 && line.length <= 25) {
      return line.replace(/[\[\]「」:：]/g, "").trim();
    }
  }
  return "";
}
