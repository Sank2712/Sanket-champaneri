import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const firebaseApp = initializeApp(config);
export const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true
}, config.firestoreDatabaseId || '(default)');

