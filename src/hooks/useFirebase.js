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
            // eslint-disable-next-line no-undef
            const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
            if (initialAuthToken) {
                // eslint-disable-next-line no-undef
                await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } else {
                await signInAnonymously(firebaseAuth);
            }
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
  }, [setMessage]); // Depend on setMessage to avoid stale closures

  return { db, auth, userId, isAuthReady };
};

export default useFirebase;