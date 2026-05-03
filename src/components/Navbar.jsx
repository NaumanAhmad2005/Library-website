import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('libra_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const isDark = theme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('libra_theme', newTheme);
  };

  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
          <div className="brand-icon">📚</div>
          <span className="brand-name">Shelf of Moiz</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="theme-toggle" onClick={toggleTheme} title="Switch theme">
            <div className="toggle-track"><div className="toggle-knob"></div></div>
            <span className="toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span className="toggle-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          {isAdmin ? (
            <button className="admin-btn active" onClick={() => navigate('/admin')}>
              ✓ Admin
            </button>
          ) : (
            <button className="admin-btn" onClick={() => navigate('/login')}>
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
