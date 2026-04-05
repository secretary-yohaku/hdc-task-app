export default function Archive({ tasks, onDelete }) {
  const doneTasks = tasks.filter((t) => t.completed);

  // 日付でグループ化
  const grouped = {};
  for (const task of doneTasks) {
    const date = task.createdAt?.slice(0, 10) || "不明";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(task);
  }
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="animate-fade-in">
      {doneTasks.length === 0 ? (
        <div className="text-center text-gray-300 py-12 text-sm">
          <div className="text-4xl mb-2.5">📭</div>
          完了済みタスクはありません
        </div>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="mb-4">
            <div className="text-xs font-semibold text-text-muted px-1 mb-2">
              📅 {date}
            </div>
            {grouped[date].map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-xl p-3 px-4 mb-1.5 border-[1.5px] border-card-border flex items-center gap-3 opacity-70"
              >
                <div className="w-5 h-5 rounded-full bg-success flex-shrink-0 flex items-center justify-center">
                  <span className="text-white text-[11px]">✓</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-400 line-through">
                    {task.title}
                  </div>
                  <div className="flex gap-1.5 mt-1 items-center flex-wrap">
                    {task.category === "parent" && (
                      <span className="bg-primary-light text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                        保護者連絡
                      </span>
                    )}
                    <span className="text-[10px] text-text-muted">
                      👤 {task.assignee}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="bg-transparent border-none cursor-pointer text-[#C8C0B8] text-lg px-0.5 flex-shrink-0 leading-none hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
