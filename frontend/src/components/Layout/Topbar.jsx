import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User, Settings, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const Topbar = ({ onMenuClick }) => {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = user ? (user.name || user.email || 'U').slice(0, 2).toUpperCase() : 'U';

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="topbar">
      <button className="hamburger-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <Menu size={20} />
      </button>
      <div className="topbar-search">
        <span className="topbar-search-icon"><Search size={14} /></span>
        <input placeholder="Search leads, activities..." />
      </div>
      <div className="topbar-actions">
        <Link to="/notifications" className="topbar-icon-btn" title="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </Link>
        <div className="user-menu" ref={menuRef}>
          <button className="user-menu-btn" onClick={() => setMenuOpen(v => !v)}>
            <div className="user-avatar">{initials}</div>
            <span style={{ fontSize: '13px', fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email || 'User'}
            </span>
          </button>
          {menuOpen && (
            <div className="user-dropdown">
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>{user?.name || 'User'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '2px' }}>{user?.email}</div>
                <div style={{ marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', padding: '1px 6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '999px', textTransform: 'capitalize' }}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <Link to="/settings" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>
                <User size={14} /> Profile
              </Link>
              {isAdmin && (
                <Link to="/settings" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>
                  <Settings size={14} /> Settings
                </Link>
              )}
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <button className="user-dropdown-item danger" style={{ width: '100%', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={handleLogout}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
