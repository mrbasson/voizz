'use client';

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { Analytics, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC5Wa9jY2u2U4JbWtpGz2PErtWv0n1FWyc",
  authDomain: "voizz-b7bfa.firebaseapp.com",
  projectId: "voizz-b7bfa",
  storageBucket: "voizz-b7bfa.firebasestorage.app",
  messagingSenderId: "584783176868",
  appId: "1:584783176868:web:8008d44c5ebb17cd673231",
  measurementId: "G-W492HJK7H3"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

let analytics: Analytics | undefined;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };
