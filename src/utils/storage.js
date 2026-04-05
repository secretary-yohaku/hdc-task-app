import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── タスク ──────────────────────────────────────────
const tasksCol = collection(db, "tasks");
const tasksQuery = query(tasksCol, orderBy("createdAt", "desc"));

/** リアルタイムでタスク一覧を購読 */
export function subscribeTasks(callback) {
  return onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(tasks);
  });
}

/** タスク追加 */
export async function addTask(task) {
  await setDoc(doc(tasksCol, task.id), task);
}

/** タスク更新（完了トグル等） */
export async function updateTask(id, data) {
  await updateDoc(doc(tasksCol, id), data);
}

/** タスク削除 */
export async function deleteTask(id) {
  await deleteDoc(doc(tasksCol, id));
}

// ─── 毎日タスク（日付ごとの完了状態） ─────────────────
function dailyDocRef() {
  return doc(db, "dailyCompletions", todayStr());
}

/** リアルタイムで本日の日課完了状態を購読 */
export function subscribeDailyCompletions(callback) {
  return onSnapshot(dailyDocRef(), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : {});
  });
}

/** 日課の完了トグル */
export async function toggleDailyCompletion(id, currentCompletions) {
  const updated = { ...currentCompletions, [id]: !currentCompletions[id] };
  await setDoc(dailyDocRef(), updated);
}
