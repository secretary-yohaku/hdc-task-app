import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo9kqk1bc-PgFi9VcEV6XtegA0h34zz98",
  authDomain: "tasku-labo.firebaseapp.com",
  projectId: "tasku-labo",
  storageBucket: "tasku-labo.firebasestorage.app",
  messagingSenderId: "791519986771",
  appId: "1:791519986771:web:d172f96ac5a989200372a6",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
