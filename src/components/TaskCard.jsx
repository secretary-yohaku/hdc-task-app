import { useState, useRef, useEffect } from "react";
import { STAFF } from "../constants/staff";

const DAYS = ["月", "火", "水", "木", "金", "土", "日"];
const REPEAT_OPTIONS = [
  { value: "none", label: "なし" },
  { value: "daily", label: "毎日" },
  { value: "weekly", label: "毎週" },
  { value: "biweekly", label: "隔週" },
  { value: "monthly", label: "毎月" },
];

export default function TaskCard({ task, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showSettings, setShowSettings] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const saveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    }
    setEditing(false);
  };

  const toggleDay = (day) => {
    const current = task.days || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    onUpdate(task.id, { days: updated });
  };

  const borderColor = task.completed
    ? "border-gray-200"
    : task.category === "parent"
      ? "border-[#FFD6C8]"
      : "border-[#EDE8E0]";

  return (
    <div
      className={`bg-white rounded-xl p-3.5 px-4 mb-2 border-[1.5px] ${borderColor} transition-all duration-200 ${task.completed ? "opacity-60 !bg-gray-50" : ""}`}
    >
      <div className="flex items-start gap-3">
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
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); saveTitle(); }
                if (e.key === "Escape") { setEditTitle(task.title); setEditing(false); }
              }}
              className="w-full text-sm font-semibold leading-relaxed text-text border-[1.5px] border-primary rounded-lg px-2 py-1 outline-none bg-white"
            />
          ) : (
            <div
              onClick={() => { if (!task.completed) { setEditTitle(task.title); setEditing(true); } }}
              className={`text-sm font-semibold leading-relaxed cursor-pointer hover:text-primary transition-colors ${
                task.completed ? "text-gray-400 line-through !cursor-default" : "text-text"
              }`}
            >
              {task.title}
            </div>
          )}
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
            <select
              value={task.assignee}
              onChange={(e) => onUpdate(task.id, { assignee: e.target.value })}
              className="text-[11px] text-text-muted bg-transparent border border-card-border rounded-full px-2 py-0.5 outline-none cursor-pointer hover:border-primary transition-colors"
            >
              {STAFF.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          {/* リマインド・曜日・繰り返しバッジ */}
          {(task.dueDate || task.reminderTime || (task.days && task.days.length > 0) || (task.repeat && task.repeat !== "none")) && (
            <div className="flex gap-1.5 mt-1 items-center flex-wrap">
              {task.dueDate && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  task.dueDate < new Date().toISOString().slice(0, 10)
                    ? "bg-red-50 text-red-500"
                    : task.dueDate === new Date().toISOString().slice(0, 10)
                      ? "bg-[#FFF0EB] text-primary"
                      : "bg-gray-100 text-text-muted"
                }`}>
                  📆 {task.dueDate}
                </span>
              )}
              {task.reminderTime && (
                <span className="bg-[#FFF8E1] text-[#B8860B] rounded-full px-2 py-0.5 text-[10px] font-bold">
                  ⏰ {task.reminderTime}
                </span>
              )}
              {task.days && task.days.length > 0 && (
                <span className="bg-[#E8F0FE] text-[#1A73E8] rounded-full px-2 py-0.5 text-[10px] font-bold">
                  📅 {task.days.join("・")}
                </span>
              )}
              {task.repeat && task.repeat !== "none" && (
                <span className="bg-[#F3E8FF] text-[#7C3AED] rounded-full px-2 py-0.5 text-[10px] font-bold">
                  🔁 {{ daily: "毎日", weekly: "毎週", biweekly: "隔週", monthly: "毎月" }[task.repeat]}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-shrink-0">
          {!task.completed && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`bg-transparent border-none cursor-pointer text-lg px-0.5 leading-none transition-colors ${
                showSettings ? "text-primary" : "text-[#C8C0B8] hover:text-primary"
              }`}
              title="設定"
            >
              ⚙
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="bg-transparent border-none cursor-pointer text-[#C8C0B8] text-lg px-0.5 leading-none hover:text-red-400 transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* 設定パネル */}
      {showSettings && !task.completed && (
        <div className="mt-2.5 pt-2.5 border-t border-card-border animate-fade-in">
          {/* 期限 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted whitespace-nowrap">📆 期限</span>
            <input
              type="date"
              value={task.dueDate || ""}
              onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
              className="flex-1 border-[1.5px] border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary transition-colors bg-white"
            />
            {task.dueDate && (
              <button
                onClick={() => onUpdate(task.id, { dueDate: "" })}
                className="text-xs text-gray-400 hover:text-red-400 cursor-pointer bg-transparent border-none"
              >
                クリア
              </button>
            )}
          </div>

          {/* リマインド時刻 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-text-muted whitespace-nowrap">⏰ リマインド</span>
            <input
              type="time"
              value={task.reminderTime || ""}
              onChange={(e) => onUpdate(task.id, { reminderTime: e.target.value })}
              className="flex-1 border-[1.5px] border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary transition-colors bg-white"
            />
            {task.reminderTime && (
              <button
                onClick={() => onUpdate(task.id, { reminderTime: "" })}
                className="text-xs text-gray-400 hover:text-red-400 cursor-pointer bg-transparent border-none"
              >
                クリア
              </button>
            )}
          </div>

          {/* 曜日選択 */}
          <div className="mb-2">
            <span className="text-xs text-text-muted">📅 曜日</span>
            <div className="flex gap-1 mt-1">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`w-8 h-8 rounded-lg border-[1.5px] text-[11px] font-semibold cursor-pointer transition-all ${
                    (task.days || []).includes(day)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-text-muted border-card-border hover:border-primary"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 繰り返し */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted whitespace-nowrap">🔁 繰り返し</span>
            <select
              value={task.repeat || "none"}
              onChange={(e) => onUpdate(task.id, { repeat: e.target.value })}
              className="flex-1 border-[1.5px] border-card-border rounded-lg px-2.5 py-1.5 text-xs text-text outline-none focus:border-primary transition-colors bg-white"
            >
              {REPEAT_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
