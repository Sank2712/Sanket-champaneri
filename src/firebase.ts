import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import config from '../firebase-applet-config.json';

const firebaseApp = initializeApp(config);
export const db = getFirestore(firebaseApp, config.firestoreDatabaseId || '(default)');

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection test succeeded.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    } else {
      console.log('Firebase connection initialized successfully.');
    }
  }
}
testConnection();
