
// firebase-config.js
import firebase from 'firebase/app';
import 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNXWuCxwsByu3XJGQAYgpvNDjXOfVUTp0",
  authDomain: "pharmacistmock.firebaseapp.com",
  databaseURL: "https://pharmacistmock-default-rtdb.firebaseio.com",
  projectId: "pharmacistmock",
  storageBucket: "pharmacistmock.firebasestorage.app",
  messagingSenderId: "742461470716",
  appId: "1:742461470716:web:b78349c21eab81be14e479",
  measurementId: "G-YRYKFEC7Z3"
};

// 初始化 Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

// 輸出 firestore 用來存取資料庫
export const db = firebaseApp.firestore();