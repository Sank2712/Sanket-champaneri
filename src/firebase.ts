import { initializeApp } from 'firebase/app';
import { initializeFirestore, setLogLevel } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import config from '../firebase-applet-config.json';

// Silence Firestore SDK internal logs (such as transient "Could not reach Cloud Firestore backend" warning messages)
setLogLevel('silent');

const firebaseApp = initializeApp(config);
export const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true
}, config.firestoreDatabaseId || '(default)');

export const auth = getAuth(firebaseApp);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  const errMsg = error instanceof Error ? error.message : String(error);
  const isTransient = 
    errMsg.toLowerCase().includes('unavailable') || 
    errMsg.toLowerCase().includes('failed to get document') || 
    errMsg.toLowerCase().includes('could not reach cloud firestore') ||
    errMsg.toLowerCase().includes('offline') ||
    errMsg.toLowerCase().includes('network');

  if (operationType === OperationType.GET || isTransient) {
    console.warn('Firestore (Transient/Offline Mode Warning): ', JSON.stringify(errInfo));
    return;
  }

  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

