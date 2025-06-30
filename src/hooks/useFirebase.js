import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDFsAE2K-wW1FVsyGB0LJ20dXyDvo_EbFs",
  authDomain: "swim-workout-app.firebaseapp.com",
  projectId: "swim-workout-app",
  storageBucket: "swim-workout-app.firebasestorage.app",
  messagingSenderId: "134609329868",
  appId: "1:134609329868:web:a13c37fe423d1531016c69"
};

const useFirebase = (setMessage) => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Directly derive currentAppId from firebaseConfig.appId or provide a simple fallback
  // This resolves the '__app_id' no-undef error
  const currentAppId = firebaseConfig.appId || 'my-local-swim-app'; // Use appId from config or a default

  useEffect(() => {
    try {
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.error("Firebase configuration missing or incomplete. Cannot initialize Firebase.");
        setMessage({ text: 'Firebase configuration is missing or incomplete. Please update src/App.js.', type: 'error' });
        return;
      }

      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          setUserId(user.uid);
        } else {
          try {
            // Remove direct access to __initial_auth_token as a global.
            // If you intend to use a custom initial token, it should be passed as a prop
            // or derived from a secure environment variable (e.g., process.env.REACT_APP_INITIAL_AUTH_TOKEN).
            // For now, we'll assume anonymous sign-in is the primary fallback.
            // If __initial_auth_token was crucial for a custom auth flow, that logic needs to be explicitly integrated.
            // For typical CRA setups, it's not a common pattern.
            await signInAnonymously(firebaseAuth); // Rely on anonymous sign-in
          } catch (error) {
            console.error("Error during anonymous sign-in:", error);
            if (error.code === 'auth/configuration-not-found') {
              setMessage({ text: 'Authentication failed: Firebase Anonymous sign-in is not enabled for your project. Please enable it in Firebase Console -> Authentication -> Sign-in method.', type: 'error' });
            } else if (error.code === 'auth/admin-restricted-operation') {
                setMessage({ text: 'Authentication failed: Restricted operation. Ensure "localhost" is added to Firebase Console -> Authentication -> Settings -> Authorized domains.', type: 'error' });
            } else {
              setMessage({ text: `Authentication error during sign-in: ${error.message}`, type: 'error' });
            }
          }
        }
        setIsAuthReady(true);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      setMessage({ text: `Firebase initialization error: ${error.message}`, type: 'error' });
    }
  }, [setMessage]);

  return { db, auth, userId, isAuthReady, currentAppId };
};

export default useFirebase;