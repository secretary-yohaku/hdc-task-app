import { useState } from "react";
import { STAFF } from "../constants/staff";
import { parseChatwork } from "../utils/parser";
import { getProcessedMessageIds, saveProcessedMessageIds } from "../utils/storage";

export default function ChatworkParser({ onImport }) {
  const [parsed, setParsed] = useState([]);
  const [resultMsg, setResultMsg] = useState("");
  const [fetching, setFetching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [cwText, setCwText] = useState("");

  // ワンボタン：取得 → 重複チェック → 解析 → 即追加
  const handleOneClick = async () => {
    setFetching(true);
    setParsed([]);
    setResultMsg("");
    try {
      const res = await fetch("/api/chatwork");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setResultMsg(err.error || `取得エラー (${res.status})`);
        setFetching(false);
        return;
      }
      const messages = await res.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        setResultMsg("新着メッセージがありません");
        setFetching(false);
        return;
      }

      // 取得済みIDを取得して未処理のみフィルタ
      const processedIds = await getProcessedMessageIds();
      const newMessages = messages.filter(
        (m) => !processedIds.includes(String(m.message_id))
      );

      if (newMessages.length === 0) {
        setResultMsg("新しいメッセージはすべて取得済みです");
        setFetching(false);
        return;
      }

      const allText = newMessages
        .map((m) => `${m.account?.name || ""}\n${m.body || ""}`)
        .join("\n\n");

      const results = parseChatwork(allText);

      // 処理済みIDを保存（キーワードの有無に関わらず）
      const allIds = [
        ...processedIds,
        ...newMessages.map((m) => String(m.message_id)),
      ];
      await saveProcessedMessageIds(allIds);

      if (results.length === 0) {
        setResultMsg(
          `${newMessages.length}件の新着メッセージを確認しましたが、対象キーワードは見つかりませんでした`
        );
        setFetching(false);
        return;
      }

      // 即タスク追加
      const newTasks = results.map((p) => ({
        ...p,
        id: `cw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      }));
      onImport(newTasks);
      setResultMsg(
        `✅ ${results.length}件のタスクを追加しました！（${newMessages.length}件の新着から）`
      );
    } catch (err) {
      setResultMsg(`通信エラー: ${err.message}`);
    }
    setFetching(false);
  };

  // 手動モード
  const handleManualParse = () => {
    const results = parseChatwork(cwText);
    setParsed(results);
    setResultMsg(
      results.length > 0
        ? `${results.length}件のキーワードを検出しました`
        : "対象のキーワードを含むメッセージが見つかりませんでした"
    );
  };

  const updateAssignee = (index, assignee) => {
    setParsed((prev) =>
      prev.map((p, i) => (i === index ? { ...p, assignee } : p))
    );
  };

  const handleManualImport = () => {
    const newTasks = parsed.map((p) => ({
      ...p,
      id: `cw_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    }));
    onImport(newTasks);
    setParsed([]);
    setCwText("");
    setResultMsg("");
  };

  return (
    <div className="animate-fade-in">
      {/* ワンボタン取得 */}
      <div className="bg-white rounded-xl p-4 mb-3 border-[1.5px] border-card-border">
        <div className="text-sm font-bold mb-1">
          💬 Chatwork自動取得
        </div>
        <div className="text-xs text-gray-400 mb-3 bg-[#FFF8F5] rounded-lg p-2 px-3 border border-[#FFE0D0] leading-relaxed">
          📌 ボタン1つでChatworkの新着メッセージからキーワードを検出し、タスクボードに自動追加します。
          <br />
          ※ 一度取得したメッセージは再取得されません。
        </div>
        <button
          onClick={handleOneClick}
          disabled={fetching}
          className="w-full bg-primary text-white border-none p-4 rounded-lg cursor-pointer text-base font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fetching ? "⏳ 取得中..." : "🔄 Chatworkから取得してタスクに追加"}
        </button>
      </div>

      {/* 結果メッセージ */}
      {resultMsg && (
        <div
          className={`animate-fade-in rounded-lg p-2.5 px-3.5 mb-3 text-[13px] font-semibold border ${
            resultMsg.startsWith("✅")
              ? "bg-success-light text-[#3A8A3A] border-success-border"
              : "bg-[#FFF5E6] text-[#B87020] border-[#FFD8A0]"
          }`}
        >
          {resultMsg}
        </div>
      )}

      {/* 手動モード切替 */}
      <button
        onClick={() => setManualMode(!manualMode)}
        className="w-full p-2 rounded-lg border-[1.5px] border-card-border bg-transparent text-text-muted text-xs cursor-pointer mb-3 hover:bg-white transition-colors"
      >
        {manualMode ? "▲ 手動入力を閉じる" : "▼ 手動で貼り付けて読み取る"}
      </button>

      {/* 手動貼り付けモード */}
      {manualMode && (
        <div className="animate-fade-in bg-white rounded-xl p-4 mb-3 border-[1.5px] border-card-border">
          <textarea
            value={cwText}
            onChange={(e) => {
              setCwText(e.target.value);
              setParsed([]);
              setResultMsg("");
            }}
            placeholder={`Chatworkメッセージをここに貼り付け...\n\n例：\n田中 花子\n受給者証入れてます。よろしくお願いします。`}
            rows={7}
            className="w-full border-[1.5px] border-card-border rounded-lg px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary transition-colors resize-y leading-relaxed bg-white"
          />
          <button
            onClick={handleManualParse}
            className="mt-2 w-full bg-primary text-white border-none p-3 rounded-lg cursor-pointer text-sm font-bold hover:opacity-90 transition-opacity"
          >
            🔍 読み取る
          </button>
        </div>
      )}

      {/* 手動モードのプレビュー */}
      {parsed.length > 0 && (
        <div className="animate-fade-in">
          {parsed.map((p, i) => (
            <div
              key={i}
              className="bg-[#FFF5F2] rounded-xl p-3 px-3.5 mb-2 border-[1.5px] border-primary-border"
            >
              <div className="text-sm font-bold text-text">{p.title}</div>
              {p.note && (
                <div className="text-xs text-gray-500 mt-1.5 leading-relaxed bg-white rounded-md p-1.5 px-2.5 whitespace-pre-line">
                  {p.note}
                </div>
              )}
              <div className="mt-2">
                <select
                  value={p.assignee}
                  onChange={(e) => updateAssignee(i, e.target.value)}
                  className="border-[1.5px] border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary transition-colors bg-white"
                >
                  {STAFF.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button
            onClick={handleManualImport}
            className="w-full bg-success text-white border-none p-3.5 rounded-xl cursor-pointer text-sm font-bold mt-1 hover:opacity-90 transition-opacity"
          >
            ✅ タスクボードに追加する
          </button>
        </div>
      )}
    </div>
  );
}
