import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Account() {
  const { creds, updateCreds, logout } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [confirmPassU, setConfirmPassU] = useState('');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  
  const [uErr, setUErr] = useState('');
  const [uOk, setUOk] = useState('');
  const [pErr, setPErr] = useState('');
  const [pOk, setPOk] = useState('');

  const changeUsername = () => {
    setUErr(''); setUOk('');
    if(!newUsername) return setUErr('Username cannot be empty.');
    if(newUsername.length < 3) return setUErr('Username must be at least 3 characters.');
    if(confirmPassU !== creds.pass) return setUErr('Current password is incorrect.');
    
    updateCreds({ user: newUsername });
    setNewUsername('');
    setConfirmPassU('');
    setUOk('Username updated successfully!');
  };

  const changePassword = () => {
    setPErr(''); setPOk('');
    if(curPass !== creds.pass) return setPErr('Current password is incorrect.');
    if(!newPass) return setPErr('New password cannot be empty.');
    if(newPass.length < 6) return setPErr('Password must be at least 6 characters.');
    if(newPass !== confPass) return setPErr('Passwords do not match.');
    
    updateCreds({ pass: newPass });
    setCurPass(''); setNewPass(''); setConfPass('');
    setPOk('Password changed successfully!');
  };

  const resetCredentials = () => {
    if(window.confirm('Reset credentials to default?\nThis will sign you out and restore admin / library123.')) {
      updateCreds({ user: 'admin', pass: 'library123' });
      logout();
    }
  };

  return (
    <div>
      <div className="account-section">
        <div className="section-divider">Current Account</div>
        <div className="account-info-card">
          <div className="account-avatar">👤</div>
          <div>
            <div className="account-name">{creds.user}</div>
            <div className="account-role">Administrator</div>
          </div>
        </div>
      </div>
      <div className="account-section">
        <div className="section-divider">Change Username</div>
        <div className="field"><label>New Username</label><input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Enter new username" /></div>
        <div className="field"><label>Current Password (to confirm)</label><input type="password" value={confirmPassU} onChange={e => setConfirmPassU(e.target.value)} placeholder="Enter current password" /></div>
        {uErr && <div className="err-msg" style={{display:'block'}}>{uErr}</div>}
        {uOk && <div className="ok-msg" style={{display:'block'}}>{uOk}</div>}
        <button className="btn-full" onClick={changeUsername}>Update Username</button>
      </div>
      <div className="account-section">
        <div className="section-divider">Change Password</div>
        <div className="field"><label>Current Password</label><input type="password" value={curPass} onChange={e => setCurPass(e.target.value)} placeholder="Current password" /></div>
        <div className="field"><label>New Password</label><input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password (min 6 chars)" /></div>
        <div className="field"><label>Confirm New Password</label><input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="Confirm new password" /></div>
        {pErr && <div className="err-msg" style={{display:'block'}}>{pErr}</div>}
        {pOk && <div className="ok-msg" style={{display:'block'}}>{pOk}</div>}
        <button className="btn-full" onClick={changePassword}>Update Password</button>
      </div>
      <div className="account-section">
        <div className="section-divider">Danger Zone</div>
        <div className="danger-zone">
          <div className="danger-title">⚠ Reset All Credentials</div>
          <div className="danger-sub">Resets username and password to <strong>admin / library123</strong> and signs you out.</div>
          <button className="btn-danger-full" onClick={resetCredentials}>Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}
