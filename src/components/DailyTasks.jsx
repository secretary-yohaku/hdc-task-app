import { DAILY_SECTIONS } from "../constants/dailyTasks";

export default function DailyTasks({ completions, onToggle }) {
  const allTasks = DAILY_SECTIONS.flatMap((s) => s.tasks);
  const totalDone = allTasks.filter((t) => completions[t.id]).length;
  const totalAll = allTasks.length;
  const totalPct = Math.round((totalDone / totalAll) * 100);

  return (
    <div className="animate-fade-in">
      {/* 全体進捗 */}
      <div className="bg-white rounded-xl p-4 px-5 mb-4 border-[1.5px] border-card-border flex items-center gap-4">
        <div className="flex-1">
          <div className="text-xs text-text-light mb-0.5">本日の日課進捗</div>
          <div
            className={`text-2xl font-bold ${totalDone === totalAll ? "text-success" : "text-text"}`}
          >
            {totalDone}
            <span className="text-sm text-text-light font-normal">
              {" "}/ {totalAll} 完了
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-card-border overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-[width] duration-400 ease-out"
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: `conic-gradient(#5B8C5A ${totalPct * 3.6}deg, #EDE8E0 0)`,
          }}
        >
          <div
            className={`w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold ${totalPct === 100 ? "text-success" : "text-gray-500"}`}
          >
            {totalPct === 100 ? "🎉" : `${totalPct}%`}
          </div>
        </div>
      </div>

      {/* セクション */}
      {DAILY_SECTIONS.map((section) => {
        const sectionDone = section.tasks.filter((t) => completions[t.id]).length;
        const sectionPct = Math.round((sectionDone / section.tasks.length) * 100);

        return (
          <div key={section.title} className="mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-[13px] font-bold text-text">{section.title}</h3>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  sectionPct === 100
                    ? "bg-success-light text-success"
                    : "bg-gray-100 text-text-muted"
                }`}
              >
                {sectionDone}/{section.tasks.length}
              </span>
            </div>
            {section.tasks.map((task) => {
              const done = !!completions[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() => onToggle(task.id)}
                  className={`bg-white rounded-xl py-3 px-4 mb-1.5 border-[1.5px] flex items-center gap-3 cursor-pointer transition-all duration-150 hover:border-success-border ${
                    done
                      ? "!bg-[#F2FAF2] border-success-border"
                      : "border-card-border"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex-shrink-0 border-2 flex items-center justify-center transition-all duration-150 ${
                      done
                        ? "border-success bg-success"
                        : "border-[#D0C8C0] bg-transparent"
                    }`}
                  >
                    {done && (
                      <span className="text-white text-[13px]">✓</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${
                        done
                          ? "text-gray-400 line-through"
                          : "text-text"
                      }`}
                    >
                      {task.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
