import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [creds, setCreds] = useState({ user: 'admin', pass: 'A.29122004.a' });

  useEffect(() => {
    const fetchCreds = async () => {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'admin_creds').single();
        if (data && !error) {
          setCreds({ user: data.admin_user, pass: data.admin_pass });
          localStorage.setItem('libra_creds', JSON.stringify({ user: data.admin_user, pass: data.admin_pass }));
        } else {
          // Fallback to local storage if table not setup yet
          const s = localStorage.getItem('libra_creds');
          if (s) setCreds(JSON.parse(s));
        }
      } catch (e) {
        console.error("Could not fetch synced creds:", e);
        const s = localStorage.getItem('libra_creds');
        if (s) setCreds(JSON.parse(s));
      }
    };
    fetchCreds();
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

  const updateCreds = async (newCreds) => {
    const updated = { ...creds, ...newCreds };
    setCreds(updated);
    localStorage.setItem('libra_creds', JSON.stringify(updated));
    
    // Attempt to sync to Supabase
    try {
      await supabase.from('settings').upsert({
        id: 'admin_creds',
        admin_user: updated.user,
        admin_pass: updated.pass
      });
    } catch (e) {
      console.error("Could not sync creds to Supabase:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout, creds, updateCreds }}>
      {children}
    </AuthContext.Provider>
  );
};
