import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="modal" style={{ maxWidth: '380px', position: 'relative', margin: '2rem' }}>
        <button className="modal-x" onClick={() => navigate('/')}>✕</button>
        <div className="login-wrap">
          <div className="login-logo">🔐</div>
          <div className="modal-title">Admin Login</div>
          <div className="modal-sub">Sign in to manage the library.</div>
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Username</label>
              <input type="text" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {error && <div className="err-msg" style={{ display: 'block' }}>Incorrect username or password.</div>}
            <button type="submit" className="btn-full">Sign In</button>
          </form>

        </div>
      </div>
    </div>
  );
}
