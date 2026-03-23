USE activity_tracker;

-- ============================================================
-- Roles
-- ============================================================
INSERT INTO roles (name, permissions) VALUES
('Admin', JSON_OBJECT(
  'users', JSON_ARRAY('create','read','update','delete'),
  'leads', JSON_ARRAY('create','read','update','delete'),
  'activities', JSON_ARRAY('create','read','update','delete'),
  'policies', JSON_ARRAY('create','read','update','delete'),
  'opportunities', JSON_ARRAY('create','read','update','delete'),
  'reports', JSON_ARRAY('read'),
  'config', JSON_ARRAY('create','read','update','delete')
)),
('Sales Agent', JSON_OBJECT(
  'leads', JSON_ARRAY('create','read','update'),
  'activities', JSON_ARRAY('create','read','update','delete'),
  'policies', JSON_ARRAY('read'),
  'opportunities', JSON_ARRAY('create','read','update')
)),
('Team Leader', JSON_OBJECT(
  'users', JSON_ARRAY('read'),
  'leads', JSON_ARRAY('create','read','update','delete'),
  'activities', JSON_ARRAY('create','read','update','delete'),
  'policies', JSON_ARRAY('create','read','update'),
  'opportunities', JSON_ARRAY('create','read','update','delete'),
  'reports', JSON_ARRAY('read')
)),
('Branch Manager', JSON_OBJECT(
  'users', JSON_ARRAY('create','read','update'),
  'leads', JSON_ARRAY('create','read','update','delete'),
  'activities', JSON_ARRAY('create','read','update','delete'),
  'policies', JSON_ARRAY('create','read','update','delete'),
  'opportunities', JSON_ARRAY('create','read','update','delete'),
  'reports', JSON_ARRAY('read')
)),
('Compliance Officer', JSON_OBJECT(
  'users', JSON_ARRAY('read'),
  'leads', JSON_ARRAY('read'),
  'activities', JSON_ARRAY('read'),
  'policies', JSON_ARRAY('read'),
  'opportunities', JSON_ARRAY('read'),
  'reports', JSON_ARRAY('read')
));

-- ============================================================
-- Branches
-- ============================================================
INSERT INTO branches (name, location) VALUES
('HQ Branch', 'Head Office, Main Street');

-- ============================================================
-- Product Types
-- ============================================================
INSERT INTO product_types (name, description) VALUES
('Life Insurance', 'Coverage for life-related risks and mortality'),
('Motor Insurance', 'Coverage for vehicles including cars, motorcycles and trucks'),
('Health Insurance', 'Medical and health coverage for individuals and families');

-- ============================================================
-- Lead Sub-Statuses
-- ============================================================
INSERT INTO lead_sub_statuses (lead_status, sub_status_name) VALUES
-- New
('New', 'Pending Review'),
('New', 'Just Received'),
('New', 'Unassigned'),
-- Contacted
('Contacted', 'Left Voicemail'),
('Contacted', 'Email Sent'),
('Contacted', 'Awaiting Response'),
-- Qualified
('Qualified', 'Needs Analysis Done'),
('Qualified', 'Budget Confirmed'),
('Qualified', 'Decision Maker Identified'),
-- Proposal
('Proposal', 'Quote Sent'),
('Proposal', 'Under Review'),
('Proposal', 'Negotiating'),
-- Closed
('Closed', 'Won'),
('Closed', 'Lost'),
('Closed', 'Not Interested'),
('Closed', 'Duplicate');

-- ============================================================
-- Default Admin User
-- Password: Admin@123
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
-- ============================================================
INSERT INTO users (name, email, password, role_id, branch_id, is_active)
VALUES (
  'System Administrator',
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  (SELECT role_id FROM roles WHERE name = 'Admin' LIMIT 1),
  (SELECT branch_id FROM branches WHERE name = 'HQ Branch' LIMIT 1),
  1
);
