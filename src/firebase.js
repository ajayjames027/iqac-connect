import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSB3LR02kLfzdOjIzkNauNPIvW6juruYY",
  authDomain: "iqac-connect.firebaseapp.com",
  projectId: "iqac-connect",
  storageBucket: "iqac-connect.firebasestorage.app",
  messagingSenderId: "507632081021",
  appId: "1:507632081021:web:4b3d55195be11759fdb914"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
