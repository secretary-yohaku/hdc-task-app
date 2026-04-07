import { useState } from "react";

export default function Trash({ trashItems, onRestore, onPermanentDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  // 日付でグループ化（deletedAtベース）
  const grouped = {};
  for (const item of trashItems) {
    const date = item.deletedAt?.slice(0, 10) || "不明";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="animate-fade-in">
      {trashItems.length === 0 ? (
        <div className="text-center text-gray-300 py-12 text-sm">
          <div className="text-4xl mb-2.5">🗑️</div>
          ゴミ箱は空です
        </div>
      ) : (
        <>
          <div className="text-xs text-text-muted mb-3 px-1">
            削除したタスクを復元できます。完全削除すると元に戻せません。
          </div>
          {sortedDates.map((date) => (
            <div key={date} className="mb-4">
              <div className="text-xs font-semibold text-text-muted px-1 mb-2">
                🗑️ {date} に削除
              </div>
              {grouped[date].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3 px-4 mb-1.5 border-[1.5px] border-card-border flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-text font-semibold">
                      {item.title}
                    </div>
                    <div className="flex gap-1.5 mt-1 items-center flex-wrap">
                      {item.category === "parent" && (
                        <span className="bg-primary-light text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                          保護者連絡
                        </span>
                      )}
                      {item.category === "user_prep" && (
                        <span className="bg-blue-50 text-blue-500 rounded-full px-2 py-0.5 text-[10px] font-bold">
                          利用者準備
                        </span>
                      )}
                      <span className="text-[10px] text-text-muted">
                        👤 {item.assignee || "未割当"}
                      </span>
                      {item.dueDate && (
                        <span className="text-[10px] text-text-muted">
                          📆 {item.dueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => onRestore(item.id)}
                      className="bg-primary text-white border-none px-3 py-1.5 rounded-lg cursor-pointer text-[11px] font-semibold hover:opacity-90 transition-opacity"
                    >
                      復元
                    </button>
                    {confirmId === item.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            onPermanentDelete(item.id);
                            setConfirmId(null);
                          }}
                          className="bg-red-500 text-white border-none px-2.5 py-1.5 rounded-lg cursor-pointer text-[11px] font-semibold hover:opacity-90 transition-opacity"
                        >
                          確定
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="bg-transparent text-gray-400 border border-card-border px-2 py-1.5 rounded-lg cursor-pointer text-[11px] hover:bg-gray-50 transition-colors"
                        >
                          戻す
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(item.id)}
                        className="bg-transparent text-gray-400 border border-card-border px-2.5 py-1.5 rounded-lg cursor-pointer text-[11px] hover:text-red-400 hover:border-red-300 transition-colors"
                      >
                        完全削除
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
