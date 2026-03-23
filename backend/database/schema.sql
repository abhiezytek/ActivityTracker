-- ============================================================
-- Insurance Sales Activity Tracker - Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS activity_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE activity_tracker;

-- ============================================================
-- 1. roles
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  role_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  permissions JSON NOT NULL DEFAULT ('{}'),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. branches
-- ============================================================
CREATE TABLE IF NOT EXISTS branches (
  branch_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  location   VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 3. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role_id    INT UNSIGNED NOT NULL,
  branch_id  INT UNSIGNED,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role   FOREIGN KEY (role_id)   REFERENCES roles(role_id),
  CONSTRAINT fk_users_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role_id  ON users (role_id);
CREATE INDEX idx_users_branch_id ON users (branch_id);

-- ============================================================
-- 4. product_types
-- ============================================================
CREATE TABLE IF NOT EXISTS product_types (
  product_type_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(150) NOT NULL UNIQUE,
  description     TEXT,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 5. leads
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  lead_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name   VARCHAR(200) NOT NULL,
  phone           VARCHAR(30)  NOT NULL,
  email           VARCHAR(255),
  product_type_id INT UNSIGNED,
  source          ENUM('online','referral','walk-in') NOT NULL DEFAULT 'online',
  status          ENUM('New','Contacted','Qualified','Proposal','Closed') NOT NULL DEFAULT 'New',
  sub_status      VARCHAR(100),
  assigned_to     INT UNSIGNED,
  created_by      INT UNSIGNED,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted      TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT fk_leads_product_type FOREIGN KEY (product_type_id) REFERENCES product_types(product_type_id),
  CONSTRAINT fk_leads_assigned_to  FOREIGN KEY (assigned_to)     REFERENCES users(user_id),
  CONSTRAINT fk_leads_created_by   FOREIGN KEY (created_by)      REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_leads_status          ON leads (status);
CREATE INDEX idx_leads_assigned_to     ON leads (assigned_to);
CREATE INDEX idx_leads_product_type_id ON leads (product_type_id);
CREATE INDEX idx_leads_is_deleted      ON leads (is_deleted);
CREATE INDEX idx_leads_created_at      ON leads (created_at);

-- ============================================================
-- 6. lead_sub_statuses
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_sub_statuses (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_status     ENUM('New','Contacted','Qualified','Proposal','Closed') NOT NULL,
  sub_status_name VARCHAR(100) NOT NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_lead_sub_status (lead_status, sub_status_name)
) ENGINE=InnoDB;

-- ============================================================
-- 7. activities
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  activity_id       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id           INT UNSIGNED NOT NULL,
  user_id           INT UNSIGNED NOT NULL,
  activity_type     ENUM('call','meeting','follow-up') NOT NULL,
  activity_date     DATETIME NOT NULL,
  duration_minutes  INT UNSIGNED,
  outcome           VARCHAR(255),
  notes             TEXT,
  location_lat      DECIMAL(10,8),
  location_long     DECIMAL(11,8),
  is_scheduled      TINYINT(1) NOT NULL DEFAULT 0,
  reminder_at       DATETIME,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_lead FOREIGN KEY (lead_id) REFERENCES leads(lead_id),
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_activities_lead_id      ON activities (lead_id);
CREATE INDEX idx_activities_user_id      ON activities (user_id);
CREATE INDEX idx_activities_activity_date ON activities (activity_date);
CREATE INDEX idx_activities_is_scheduled ON activities (is_scheduled);

-- ============================================================
-- 8. opportunities
-- ============================================================
CREATE TABLE IF NOT EXISTS opportunities (
  opportunity_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lead_id         INT UNSIGNED NOT NULL,
  stage           VARCHAR(100) NOT NULL,
  premium_amount  DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  probability     TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '0-100',
  notes           TEXT,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_opportunities_lead FOREIGN KEY (lead_id) REFERENCES leads(lead_id),
  CONSTRAINT chk_probability CHECK (probability BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE INDEX idx_opportunities_lead_id ON opportunities (lead_id);
CREATE INDEX idx_opportunities_stage   ON opportunities (stage);

-- ============================================================
-- 9. policies
-- ============================================================
CREATE TABLE IF NOT EXISTS policies (
  policy_id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_name         VARCHAR(200) NOT NULL,
  policy_number         VARCHAR(100) NOT NULL UNIQUE,
  lead_id               INT UNSIGNED,
  product_type_id       INT UNSIGNED NOT NULL,
  premium               DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  start_date            DATE NOT NULL,
  end_date              DATE NOT NULL,
  agent_id              INT UNSIGNED NOT NULL,
  renewal_notified_30   TINYINT(1) NOT NULL DEFAULT 0,
  renewal_notified_60   TINYINT(1) NOT NULL DEFAULT 0,
  renewal_notified_90   TINYINT(1) NOT NULL DEFAULT 0,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_policies_lead         FOREIGN KEY (lead_id)         REFERENCES leads(lead_id),
  CONSTRAINT fk_policies_product_type FOREIGN KEY (product_type_id) REFERENCES product_types(product_type_id),
  CONSTRAINT fk_policies_agent        FOREIGN KEY (agent_id)        REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_policies_agent_id        ON policies (agent_id);
CREATE INDEX idx_policies_end_date        ON policies (end_date);
CREATE INDEX idx_policies_product_type_id ON policies (product_type_id);

-- ============================================================
-- 10. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  message         TEXT NOT NULL,
  type            ENUM('reminder','missed_activity','renewal','general') NOT NULL DEFAULT 'general',
  status          ENUM('unread','read') NOT NULL DEFAULT 'unread',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_status  ON notifications (status);

-- ============================================================
-- 11. audit_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  audit_id   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED,
  action     ENUM('CREATE','UPDATE','DELETE') NOT NULL,
  entity     VARCHAR(100) NOT NULL,
  entity_id  VARCHAR(100),
  old_value  JSON,
  new_value  JSON,
  ip_address VARCHAR(45),
  timestamp  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_audit_logs_user_id   ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity    ON audit_logs (entity);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);

-- ============================================================
-- 12. documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  document_id  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entity_type  VARCHAR(50) NOT NULL,
  entity_id    INT UNSIGNED NOT NULL,
  filename     VARCHAR(255) NOT NULL,
  filepath     VARCHAR(500) NOT NULL,
  uploaded_by  INT UNSIGNED NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
) ENGINE=InnoDB;

CREATE INDEX idx_documents_entity ON documents (entity_type, entity_id);
