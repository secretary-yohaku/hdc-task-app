export default function TaskCard({ task, onToggle, onDelete }) {
  const borderColor = task.completed
    ? "border-gray-200"
    : task.category === "parent"
      ? "border-[#FFD6C8]"
      : "border-[#EDE8E0]";

  return (
    <div
      className={`bg-white rounded-xl p-3.5 px-4 mb-2 border-[1.5px] ${borderColor} flex items-start gap-3 transition-all duration-200 ${task.completed ? "opacity-60 !bg-gray-50" : ""}`}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer ${
          task.completed
            ? "border-success bg-success"
            : "border-[#D0C8C0] bg-transparent"
        }`}
      >
        {task.completed && (
          <span className="text-white text-[13px] leading-none">✓</span>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-semibold leading-relaxed ${
            task.completed ? "text-gray-400 line-through" : "text-text"
          }`}
        >
          {task.title}
        </div>
        {task.note && (
          <div className="text-xs text-gray-400 mt-1 leading-relaxed whitespace-pre-line">
            {task.note}
          </div>
        )}
        <div className="flex gap-1.5 mt-1.5 items-center flex-wrap">
          {task.category === "parent" && (
            <span className="bg-primary-light text-primary rounded-full px-2 py-0.5 text-[11px] font-bold">
              保護者連絡
            </span>
          )}
          {task.category === "user_prep" && (
            <span className="bg-blue-50 text-blue-500 rounded-full px-2 py-0.5 text-[11px] font-bold">
              利用者準備
            </span>
          )}
          {task.source === "chatwork" && (
            <span className="bg-success-light text-[#4A9E4A] rounded-full px-2 py-0.5 text-[11px] font-bold">
              Chatwork
            </span>
          )}
          <span className="text-[11px] text-text-muted">
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
  );
}
