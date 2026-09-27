import { useState, useEffect, useCallback } from 'react';
import { auth, logOut as firebaseLogOut, onAuthStateChanged } from '../firebase';

export interface UserSession {
  name: string;
  email: string;
}

const SESSION_STORAGE_KEY = 'finwise_session_token';
const DEFAULT_USER: UserSession = {
  name: 'Anjali Bhat',
  email: 'anjaliextraa01@gmail.com',
};

export function useAuthSession() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(sessionStorage.getItem(SESSION_STORAGE_KEY));
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_USER);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser({
          name: user.displayName || DEFAULT_USER.name,
          email: user.email || DEFAULT_USER.email,
        });
        setIsAuthenticated(true);
        sessionStorage.setItem(SESSION_STORAGE_KEY, `firebase_${user.uid}`);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = useCallback((user: { name: string; email: string; token?: string }) => {
    setCurrentUser({
      name: user.name,
      email: user.email,
    });
    setIsAuthenticated(true);
    sessionStorage.setItem(SESSION_STORAGE_KEY, user.token || `token_${Date.now()}`);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await firebaseLogOut();
    } catch (err) {
      console.warn('Firebase logout warning:', err);
    }
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return {
    isAuthenticated,
    currentUser,
    handleLoginSuccess,
    handleLogout,
  };
}
