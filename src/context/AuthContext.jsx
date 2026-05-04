import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [creds, setCreds] = useState({ user: 'admin', pass: 'A.29122004.a' });

  useEffect(() => {
    try {
      const s = localStorage.getItem('libra_creds');
      if (s) {
        setCreds(JSON.parse(s));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const login = (u, p) => {
    if (u === creds.user && p === creds.pass) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const updateCreds = (newCreds) => {
    const updated = { ...creds, ...newCreds };
    setCreds(updated);
    localStorage.setItem('libra_creds', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, creds, updateCreds }}>
      {children}
    </AuthContext.Provider>
  );
};
