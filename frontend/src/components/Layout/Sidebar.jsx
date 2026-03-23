import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Activity, GitBranch, Shield,
  Bell, Settings, UserCog, Package, ChevronRight, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'agent'] },
  { to: '/leads', label: 'Leads', icon: Users, roles: ['admin', 'manager', 'agent'] },
  { to: '/activities', label: 'Activities', icon: Activity, roles: ['admin', 'manager', 'agent'] },
  { to: '/pipeline', label: 'Pipeline', icon: GitBranch, roles: ['admin', 'manager', 'agent'] },
  { to: '/policies', label: 'Policies', icon: Shield, roles: ['admin', 'manager', 'agent'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'manager', 'agent'] },
];

const adminItems = [
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

const Sidebar = ({ collapsed, onNavClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'agent';

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(to + '/');

  const renderNavItem = (item) => {
    if (!item.roles.includes(role)) return null;
    const Icon = item.icon;
    const active = isActive(item.to);
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`nav-item${active ? ' active' : ''}`}
        onClick={onNavClick}
        title={collapsed ? item.label : undefined}
      >
        <Icon size={18} />
        <span className="nav-item-label">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="sidebar-nav">
      <div className="nav-section">
        <div className="nav-section-title">Main Menu</div>
        {navItems.map(renderNavItem)}
      </div>
      {role === 'admin' && (
        <div className="nav-section">
          <div className="nav-section-title">Administration</div>
          {adminItems.map(renderNavItem)}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
