import React from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddBook from './AddBook';
import ManageBooks from './ManageBooks';
import Account from './Account';

export default function Admin() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) {
    navigate('/login');
    return null;
  }

  const handleSignout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <div className="main" style={{ maxWidth: '720px' }}>
      <div className="modal" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div className="admin-top">
          <span className="admin-top-title">Admin Panel</span>
          <button className="signout-btn" onClick={handleSignout}>Sign Out</button>
        </div>
        <div className="tab-bar">
          <Link to="/admin" className={`tab ${isActive('/admin') ? 'on' : ''}`}>📤 Upload Book</Link>
          <Link to="/admin/manage" className={`tab ${isActive('/admin/manage') ? 'on' : ''}`}>📋 Manage Books</Link>
          <Link to="/admin/account" className={`tab ${isActive('/admin/account') ? 'on' : ''}`}>⚙️ My Account</Link>
        </div>
        <div className="tab-body" style={{ display: 'block', minHeight: '60vh' }}>
          <Routes>
            <Route path="/" element={<AddBook />} />
            <Route path="/manage" element={<ManageBooks />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
