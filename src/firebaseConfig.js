import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Not a secret — Firebase access control is enforced by the Realtime
// Database's security rules, not by hiding this config object.
const firebaseConfig = {
  apiKey: "AIzaSyBvn3vDa3hOxxOCzXa1FEFn8Xpmsew7nDI",
  authDomain: "smash-tracker-86838.firebaseapp.com",
  databaseURL: "https://smash-tracker-86838-default-rtdb.firebaseio.com",
  projectId: "smash-tracker-86838",
  storageBucket: "smash-tracker-86838.firebasestorage.app",
  messagingSenderId: "340788132875",
  appId: "1:340788132875:web:f136df1bafbd305c42db0e"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
