import { useState, useEffect } from "react";
import {
  subscribeTasks,
  subscribeDailyCompletions,
  addTask,
  updateTask,
  deleteTask,
  toggleDailyCompletion,
} from "./utils/storage";
import TaskBoard from "./components/TaskBoard";
import DailyTasks from "./components/DailyTasks";
import ChatworkParser from "./components/ChatworkParser";
import Archive from "./components/Archive";

const TABS = [
  { id: "board", label: "📝 タスク" },
  { id: "daily", label: "📅 毎日タスク" },
  { id: "chatwork", label: "💬 Chatwork" },
  { id: "archive", label: "📦 アーカイブ" },
];

export default function App() {
  const [tab, setTab] = useState("board");
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [loading, setLoading] = useState(true);

  // Firestoreからリアルタイム購読
  useEffect(() => {
    let ready = 0;
    const done = () => { ready++; if (ready >= 2) setLoading(false); };

    const unsubTasks = subscribeTasks((t) => { setTasks(t); done(); });
    const unsubDaily = subscribeDailyCompletions((c) => { setCompletions(c); done(); });

    return () => {
      unsubTasks();
      unsubDaily();
    };
  }, []);

  const handleToggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) await updateTask(id, { completed: !task.completed });
  };

  const handleDeleteTask = async (id) => {
    await deleteTask(id);
  };

  const handleToggleDaily = async (id) => {
    await toggleDailyCompletion(id, completions);
  };

  const handleChatworkImport = async (newTasks) => {
    for (const task of newTasks) {
      await addTask(task);
    }
    setTab("board");
  };

  const activeTasks = tasks.filter((t) => !t.completed);
  const dailyDoneCount = Object.values(completions).filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg font-sans">
        <div className="text-primary text-sm">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg font-sans text-text">
      {/* ヘッダー */}
      <div className="bg-white border-b border-card-border sticky top-0 z-20">
        <div className="max-w-[900px] mx-auto px-4 pt-3.5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-lg">
              📋
            </div>
            <div>
              <div className="text-[15px] font-bold tracking-wide">
                放デイ タスク管理
              </div>
              <div className="text-[11px] text-text-light">
                {new Date().toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
            </div>
            <div className="ml-auto flex gap-1.5">
              <div className="bg-primary-light rounded-lg px-2.5 py-1 text-xs text-primary font-bold">
                残{activeTasks.length}件
              </div>
              <div className="bg-success-light rounded-lg px-2.5 py-1 text-xs text-success font-bold">
                日課 {dailyDoneCount}件完了
              </div>
            </div>
          </div>

          {/* タブ */}
          <div className="flex gap-0.5 bg-[#F2EDE6] rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 px-1 rounded-[9px] border-none cursor-pointer text-xs font-semibold transition-all duration-150 ${
                  tab === t.id
                    ? "bg-white text-primary shadow-[0_1px_6px_rgba(0,0,0,0.08)]"
                    : "bg-transparent text-text-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="h-3" />
        </div>
      </div>

      {/* コンテンツ */}
      <div className="max-w-[900px] mx-auto px-3.5 pt-4 pb-10">
        {tab === "board" && (
          <TaskBoard
            tasks={tasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
        )}
        {tab === "daily" && (
          <DailyTasks completions={completions} onToggle={handleToggleDaily} />
        )}
        {tab === "chatwork" && (
          <ChatworkParser onImport={handleChatworkImport} />
        )}
        {tab === "archive" && (
          <Archive tasks={tasks} onDelete={handleDeleteTask} />
        )}
      </div>
    </div>
  );
}
