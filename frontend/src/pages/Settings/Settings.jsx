import React, { useState } from 'react';
import { Users, Shield, Package, Tag } from 'lucide-react';
import UserManager from './UserManager';
import RoleManager from './RoleManager';
import ProductTypeManager from './ProductTypeManager';
import SubStatusManager from './SubStatusManager';

const tabs = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'products', label: 'Product Types', icon: Package },
  { id: 'substatuses', label: 'Sub-Statuses', icon: Tag },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Manage system configuration</p>
      </div>
      <div style={{ display: 'flex', gap: '2px', borderBottom: '2px solid var(--border)', flexWrap: 'wrap' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab.id ? 600 : 400, color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent', marginBottom: '-2px', transition: 'var(--transition)' }}>
              <Icon size={15} />{tab.label}
            </button>
          );
        })}
      </div>
      <div>
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'roles' && <RoleManager />}
        {activeTab === 'products' && <ProductTypeManager />}
        {activeTab === 'substatuses' && <SubStatusManager />}
      </div>
    </div>
  );
};

export default Settings;
