import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './Layout.css';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="layout">
      <div className={`sidebar${collapsed ? ' collapsed' : ''}${sidebarOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <ShieldCheck size={24} style={{ color: '#60a5fa', flexShrink: 0 }} />
          <span className="sidebar-logo-text">InsureTrack</span>
        </div>
        <Sidebar collapsed={collapsed} onNavClick={closeSidebar} />
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <button
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', display: 'none' }}
            onClick={() => setCollapsed(v => !v)}
          >
            {collapsed ? '→' : '← Collapse'}
          </button>
        </div>
      </div>
      <div className={`overlay${sidebarOpen ? ' visible' : ''}`} onClick={closeSidebar} />
      <div className={`main-content${collapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
