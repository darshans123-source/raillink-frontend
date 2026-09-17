import React, { createContext, useContext, useState, useEffect } from 'react';
import { hashPassword } from '../utils/crypto';

const USERS_STORAGE_KEY = 'aiRailLinkUsers';
const CURRENT_USER_KEY = 'aiRailLinkCurrentUser';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error('Failed to parse current user from localStorage:', err);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Helper to load all registered users
  const getUsers = () => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to read users from localStorage:', err);
      return [];
    }
  };

  // Register a new user
  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = name.trim();

      const users = getUsers();
      const existing = users.find((u) => u.email === trimmedEmail);
      if (existing) {
        throw new Error('An account with this email address already exists.');
      }

      const passwordHash = await hashPassword(password);
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: trimmedName,
        email: trimmedEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      // Set current session (excluding passwordHash)
      const sessionData = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
      setCurrentUser(sessionData);

      return sessionData;
    } finally {
      setLoading(false);
    }
  };

  // Login existing user
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const passwordHash = await hashPassword(password);

      const users = getUsers();
      const user = users.find(
        (u) => u.email === trimmedEmail && u.passwordHash === passwordHash
      );

      if (!user) {
        throw new Error('Invalid email or password.');
      }

      const sessionData = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
      setCurrentUser(sessionData);
      return sessionData;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  // Delete local account
  const deleteAccount = () => {
    if (!currentUser) return;
    const users = getUsers().filter((u) => u.id !== currentUser.id);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        register,
        login,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
