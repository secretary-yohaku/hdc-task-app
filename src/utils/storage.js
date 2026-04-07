import {
  collection,
  doc,
  setDoc,
  getDoc,
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

/** タスク削除（ゴミ箱に移動） */
export async function deleteTask(id) {
  const taskDoc = await getDoc(doc(tasksCol, id));
  if (taskDoc.exists()) {
    const taskData = taskDoc.data();
    await setDoc(doc(trashCol, id), {
      ...taskData,
      deletedAt: new Date().toISOString(),
    });
  }
  await deleteDoc(doc(tasksCol, id));
}

// ─── ゴミ箱 ─────────────────────────────────────────
const trashCol = collection(db, "trash");
const trashQuery = query(trashCol, orderBy("deletedAt", "desc"));

/** ゴミ箱のタスク一覧を購読 */
export function subscribeTrash(callback) {
  return onSnapshot(trashQuery, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

/** ゴミ箱からタスクを復元 */
export async function restoreTask(id) {
  const trashDoc = await getDoc(doc(trashCol, id));
  if (trashDoc.exists()) {
    const { deletedAt, ...taskData } = trashDoc.data();
    await setDoc(doc(tasksCol, id), taskData);
    await deleteDoc(doc(trashCol, id));
  }
}

/** ゴミ箱から完全削除 */
export async function permanentDeleteTask(id) {
  await deleteDoc(doc(trashCol, id));
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

// ─── Chatwork取得済みメッセージID管理 ─────────────────
const processedRef = doc(db, "chatworkState", "processedIds");

/** 取得済みメッセージIDを取得 */
export async function getProcessedMessageIds() {
  const snap = await getDoc(processedRef);
  return snap.exists() ? snap.data().ids || [] : [];
}

/** 取得済みメッセージIDを保存 */
export async function saveProcessedMessageIds(ids) {
  await setDoc(processedRef, { ids })
}
