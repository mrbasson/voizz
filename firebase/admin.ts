import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Check if Firebase Admin is already initialized
const apps = getApps();

// Initialize Firebase Admin if not already initialized
let app: App;

try {
  // Check if environment variables are properly set
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK environment variables are missing. Please check your .env.local file.');
    console.error('Required variables: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    
    // Create a dummy app for development if environment variables are missing
    app = apps.length === 0 ? initializeApp() : apps[0];
  } else {
    // Initialize with proper credentials
    app = apps.length === 0
      ? initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            // Replace escaped newlines with actual newlines if needed
            privateKey: privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey,
          }),
        })
      : apps[0];
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  // Fallback to a dummy app
  app = apps.length === 0 ? initializeApp() : apps[0];
}

export { app };
