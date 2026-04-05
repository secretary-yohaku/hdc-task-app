import { useState } from "react";
import { STAFF } from "../constants/staff";
import { addTask } from "../utils/storage";
import TaskCard from "./TaskCard";

const CATEGORIES = [
  { value: "general", label: "一般" },
  { value: "parent", label: "保護者連絡" },
  { value: "user_prep", label: "利用者準備" },
];

export default function TaskBoard({ tasks, onToggle, onDelete }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "未割当",
    note: "",
    category: "general",
  });

  const activeTasks = tasks.filter((t) => !t.completed);
  const doneTasks = tasks.filter((t) => t.completed);

  const handleAdd = async () => {
    if (!newTask.title.trim()) return;
    const task = {
      id: `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newTask.title,
      assignee: newTask.assignee,
      note: newTask.note,
      category: newTask.category,
      completed: false,
      createdAt: new Date().toISOString(),
      source: "manual",
    };
    await addTask(task);
    setNewTask({ title: "", assignee: "未割当", note: "", category: "general" });
    setShowAdd(false);
  };

  return (
    <div className="animate-fade-in">
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full p-3 rounded-xl border-2 border-dashed border-[#E8C8BE] bg-transparent text-primary text-sm font-semibold cursor-pointer mb-3.5 hover:bg-primary-light transition-colors"
        >
          ＋ タスクを追加
        </button>
      ) : (
        <div className="animate-fade-in bg-white rounded-xl p-4 mb-3.5 border-[1.5px] border-primary-border shadow-[0_4px_20px_rgba(232,96,58,0.07)]">
          <input
            type="text"
            placeholder="タスク内容を入力..."
            value={newTask.title}
            autoFocus
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full border-[1.5px] border-card-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors mb-2 bg-white"
          />
          <div className="flex gap-2 mb-2">
            <select
              value={newTask.assignee}
              onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              className="flex-1 border-[1.5px] border-card-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors bg-white"
            >
              {STAFF.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              className="flex-1 border-[1.5px] border-card-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="メモ（任意）"
            value={newTask.note}
            onChange={(e) => setNewTask({ ...newTask, note: e.target.value })}
            className="w-full border-[1.5px] border-card-border rounded-lg px-3 py-2.5 text-sm text-text outline-none focus:border-primary transition-colors mb-3 bg-white"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="bg-primary text-white border-none px-5 py-2.5 rounded-lg cursor-pointer text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              追加
            </button>
            <button
              onClick={() => {
                setShowAdd(false);
                setNewTask({ title: "", assignee: "未割当", note: "", category: "general" });
              }}
              className="bg-transparent text-gray-400 border-[1.5px] border-card-border px-4 py-2.5 rounded-lg cursor-pointer text-[13px] hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {activeTasks.length === 0 ? (
        <div className="text-center text-gray-300 py-12 text-sm">
          <div className="text-4xl mb-2.5">✨</div>
          タスクはありません！お疲れさまです
        </div>
      ) : (
        activeTasks.map((task) => (
          <div className="animate-fade-in" key={task.id}>
            <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} />
          </div>
        ))
      )}

      {doneTasks.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setShowDone(!showDone)}
            className="w-full p-2.5 rounded-lg border-[1.5px] border-card-border bg-transparent text-text-muted text-[13px] cursor-pointer mb-2 hover:bg-white transition-colors"
          >
            {showDone ? "▲" : "▼"} 完了済み（{doneTasks.length}件）
          </button>
          {showDone &&
            doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
            ))}
        </div>
      )}
    </div>
  );
}
