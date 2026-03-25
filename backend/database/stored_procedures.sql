-- ============================================================
-- Insurance Sales Activity Tracker - Stored Procedures
-- Replaces all inline SQL queries with reusable stored procedures
-- ============================================================

USE activity_tracker;

DELIMITER $$

-- ============================================================
-- UTILITY
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetBranchUserIds$$
CREATE PROCEDURE sp_GetBranchUserIds(IN p_branch_id INT UNSIGNED)
BEGIN
  SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1;
END$$

-- ============================================================
-- USERS
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetUserById$$
CREATE PROCEDURE sp_GetUserById(IN p_user_id INT UNSIGNED)
BEGIN
  SELECT u.user_id, u.name, u.email, u.role_id, u.branch_id, u.is_active, u.created_at,
         r.name AS role_name, r.permissions,
         b.name AS branch_name
  FROM users u
  JOIN roles r ON u.role_id = r.role_id
  LEFT JOIN branches b ON u.branch_id = b.branch_id
  WHERE u.user_id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetUserByEmail$$
CREATE PROCEDURE sp_GetUserByEmail(IN p_email VARCHAR(255))
BEGIN
  SELECT u.*, r.name AS role_name, r.permissions, b.name AS branch_name
  FROM users u
  JOIN roles r ON u.role_id = r.role_id
  LEFT JOIN branches b ON u.branch_id = b.branch_id
  WHERE u.email = p_email;
END$$

DROP PROCEDURE IF EXISTS sp_GetUserPasswordById$$
CREATE PROCEDURE sp_GetUserPasswordById(IN p_user_id INT UNSIGNED)
BEGIN
  SELECT password FROM users WHERE user_id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetAllUsers$$
CREATE PROCEDURE sp_GetAllUsers(
  IN p_role_id     INT UNSIGNED,
  IN p_branch_id   INT UNSIGNED,
  IN p_is_active   TINYINT(1),
  IN p_search      VARCHAR(255),
  IN p_limit       INT,
  IN p_offset      INT
)
BEGIN
  -- Count result set
  SELECT COUNT(*) AS total
  FROM users u
  WHERE (p_role_id   IS NULL OR u.role_id   = p_role_id)
    AND (p_branch_id IS NULL OR u.branch_id = p_branch_id)
    AND (p_is_active IS NULL OR u.is_active = p_is_active)
    AND (p_search    IS NULL OR u.name  LIKE CONCAT('%', p_search, '%')
                             OR u.email LIKE CONCAT('%', p_search, '%'));

  -- Data result set
  SELECT u.user_id, u.name, u.email, u.role_id, u.branch_id, u.is_active, u.created_at,
         r.name AS role_name, b.name AS branch_name
  FROM users u
  JOIN roles r ON u.role_id = r.role_id
  LEFT JOIN branches b ON u.branch_id = b.branch_id
  WHERE (p_role_id   IS NULL OR u.role_id   = p_role_id)
    AND (p_branch_id IS NULL OR u.branch_id = p_branch_id)
    AND (p_is_active IS NULL OR u.is_active = p_is_active)
    AND (p_search    IS NULL OR u.name  LIKE CONCAT('%', p_search, '%')
                             OR u.email LIKE CONCAT('%', p_search, '%'))
  ORDER BY u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

DROP PROCEDURE IF EXISTS sp_CreateUser$$
CREATE PROCEDURE sp_CreateUser(
  IN p_name      VARCHAR(150),
  IN p_email     VARCHAR(255),
  IN p_password  VARCHAR(255),
  IN p_role_id   INT UNSIGNED,
  IN p_branch_id INT UNSIGNED,
  IN p_is_active TINYINT(1)
)
BEGIN
  INSERT INTO users (name, email, password, role_id, branch_id, is_active)
  VALUES (p_name, p_email, p_password, p_role_id, p_branch_id, p_is_active);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateUser$$
CREATE PROCEDURE sp_UpdateUser(
  IN p_user_id   INT UNSIGNED,
  IN p_name      VARCHAR(150),
  IN p_email     VARCHAR(255),
  IN p_role_id   INT UNSIGNED,
  IN p_branch_id INT UNSIGNED,
  IN p_is_active TINYINT(1),
  IN p_password  VARCHAR(255)
)
BEGIN
  UPDATE users
  SET
    name      = COALESCE(p_name,      name),
    email     = COALESCE(p_email,     email),
    role_id   = COALESCE(p_role_id,   role_id),
    branch_id = COALESCE(p_branch_id, branch_id),
    is_active = COALESCE(p_is_active, is_active),
    password  = COALESCE(p_password,  password)
  WHERE user_id = p_user_id;
END$$

-- ============================================================
-- LEADS
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetLeadById$$
CREATE PROCEDURE sp_GetLeadById(IN p_lead_id INT UNSIGNED)
BEGIN
  SELECT l.*, u.name AS assigned_agent_name, pt.name AS product_type_name
  FROM leads l
  LEFT JOIN users u ON l.assigned_to = u.user_id
  LEFT JOIN product_types pt ON l.product_type_id = pt.product_type_id
  WHERE l.lead_id = p_lead_id AND l.is_deleted = 0;
END$$

DROP PROCEDURE IF EXISTS sp_GetLeadWithActivities$$
CREATE PROCEDURE sp_GetLeadWithActivities(IN p_lead_id INT UNSIGNED)
BEGIN
  -- Lead data
  SELECT l.*, u.name AS assigned_agent_name, pt.name AS product_type_name
  FROM leads l
  LEFT JOIN users u ON l.assigned_to = u.user_id
  LEFT JOIN product_types pt ON l.product_type_id = pt.product_type_id
  WHERE l.lead_id = p_lead_id AND l.is_deleted = 0;

  -- Activities for this lead
  SELECT a.*, u.name AS agent_name
  FROM activities a
  JOIN users u ON a.user_id = u.user_id
  WHERE a.lead_id = p_lead_id
  ORDER BY a.activity_date DESC;
END$$

DROP PROCEDURE IF EXISTS sp_GetAllLeads$$
CREATE PROCEDURE sp_GetAllLeads(
  IN p_status          VARCHAR(50),
  IN p_product_type_id INT UNSIGNED,
  IN p_assigned_to     INT UNSIGNED,
  IN p_source          VARCHAR(50),
  IN p_created_by      INT UNSIGNED,
  IN p_branch_id       INT UNSIGNED,
  IN p_date_from       DATE,
  IN p_date_to         DATE,
  IN p_search          VARCHAR(255),
  IN p_limit           INT,
  IN p_offset          INT
)
BEGIN
  -- Count result set
  SELECT COUNT(*) AS total
  FROM leads l
  WHERE l.is_deleted = 0
    AND (p_status          IS NULL OR l.status          = p_status)
    AND (p_product_type_id IS NULL OR l.product_type_id = p_product_type_id)
    AND (p_assigned_to     IS NULL OR l.assigned_to     = p_assigned_to)
    AND (p_source          IS NULL OR l.source          = p_source)
    AND (p_created_by      IS NULL OR l.created_by      = p_created_by)
    AND (p_branch_id       IS NULL OR l.assigned_to IN (
          SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1
        ))
    AND (p_date_from IS NULL OR DATE(l.created_at) >= p_date_from)
    AND (p_date_to   IS NULL OR DATE(l.created_at) <= p_date_to)
    AND (p_search    IS NULL OR l.customer_name LIKE CONCAT('%', p_search, '%')
                             OR l.phone         LIKE CONCAT('%', p_search, '%')
                             OR l.email         LIKE CONCAT('%', p_search, '%'));

  -- Data result set
  SELECT l.*, u.name AS assigned_agent_name, pt.name AS product_type_name
  FROM leads l
  LEFT JOIN users u ON l.assigned_to = u.user_id
  LEFT JOIN product_types pt ON l.product_type_id = pt.product_type_id
  WHERE l.is_deleted = 0
    AND (p_status          IS NULL OR l.status          = p_status)
    AND (p_product_type_id IS NULL OR l.product_type_id = p_product_type_id)
    AND (p_assigned_to     IS NULL OR l.assigned_to     = p_assigned_to)
    AND (p_source          IS NULL OR l.source          = p_source)
    AND (p_created_by      IS NULL OR l.created_by      = p_created_by)
    AND (p_branch_id       IS NULL OR l.assigned_to IN (
          SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1
        ))
    AND (p_date_from IS NULL OR DATE(l.created_at) >= p_date_from)
    AND (p_date_to   IS NULL OR DATE(l.created_at) <= p_date_to)
    AND (p_search    IS NULL OR l.customer_name LIKE CONCAT('%', p_search, '%')
                             OR l.phone         LIKE CONCAT('%', p_search, '%')
                             OR l.email         LIKE CONCAT('%', p_search, '%'))
  ORDER BY l.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

DROP PROCEDURE IF EXISTS sp_CreateLead$$
CREATE PROCEDURE sp_CreateLead(
  IN p_customer_name    VARCHAR(200),
  IN p_phone            VARCHAR(30),
  IN p_email            VARCHAR(255),
  IN p_product_type_id  INT UNSIGNED,
  IN p_source           VARCHAR(50),
  IN p_status           VARCHAR(50),
  IN p_sub_status       VARCHAR(100),
  IN p_assigned_to      INT UNSIGNED,
  IN p_created_by       INT UNSIGNED,
  IN p_notes            TEXT,
  IN p_expected_premium DECIMAL(15,2)
)
BEGIN
  INSERT INTO leads (customer_name, phone, email, product_type_id, source, status, sub_status, assigned_to, created_by, notes, expected_premium)
  VALUES (p_customer_name, p_phone, p_email, p_product_type_id, p_source, p_status, p_sub_status, p_assigned_to, p_created_by, p_notes, COALESCE(p_expected_premium, 0.00));
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateLead$$
CREATE PROCEDURE sp_UpdateLead(
  IN p_lead_id          INT UNSIGNED,
  IN p_customer_name    VARCHAR(200),
  IN p_phone            VARCHAR(30),
  IN p_email            VARCHAR(255),
  IN p_product_type_id  INT UNSIGNED,
  IN p_source           VARCHAR(50),
  IN p_status           VARCHAR(50),
  IN p_sub_status       VARCHAR(100),
  IN p_assigned_to      INT UNSIGNED,
  IN p_notes            TEXT,
  IN p_expected_premium DECIMAL(15,2)
)
BEGIN
  UPDATE leads
  SET
    customer_name    = COALESCE(p_customer_name,    customer_name),
    phone            = COALESCE(p_phone,            phone),
    email            = COALESCE(p_email,            email),
    product_type_id  = COALESCE(p_product_type_id,  product_type_id),
    source           = COALESCE(p_source,           source),
    status           = COALESCE(p_status,           status),
    sub_status       = COALESCE(p_sub_status,       sub_status),
    assigned_to      = COALESCE(p_assigned_to,      assigned_to),
    notes            = COALESCE(p_notes,            notes),
    expected_premium = COALESCE(p_expected_premium, expected_premium)
  WHERE lead_id = p_lead_id;
END$$

DROP PROCEDURE IF EXISTS sp_SoftDeleteLead$$
CREATE PROCEDURE sp_SoftDeleteLead(IN p_lead_id INT UNSIGNED)
BEGIN
  UPDATE leads SET is_deleted = 1 WHERE lead_id = p_lead_id;
END$$

DROP PROCEDURE IF EXISTS sp_AssignLead$$
CREATE PROCEDURE sp_AssignLead(
  IN p_lead_id     INT UNSIGNED,
  IN p_assigned_to INT UNSIGNED
)
BEGIN
  UPDATE leads SET assigned_to = p_assigned_to WHERE lead_id = p_lead_id;
END$$

-- ============================================================
-- ACTIVITIES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetActivityById$$
CREATE PROCEDURE sp_GetActivityById(IN p_activity_id INT UNSIGNED)
BEGIN
  SELECT a.*, l.customer_name, u.name AS agent_name
  FROM activities a
  JOIN leads l ON a.lead_id = l.lead_id
  JOIN users u ON a.user_id = u.user_id
  WHERE a.activity_id = p_activity_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetAllActivities$$
CREATE PROCEDURE sp_GetAllActivities(
  IN p_lead_id       INT UNSIGNED,
  IN p_user_id       INT UNSIGNED,
  IN p_activity_type VARCHAR(50),
  IN p_date_from     DATE,
  IN p_date_to       DATE,
  IN p_branch_id     INT UNSIGNED,
  IN p_limit         INT,
  IN p_offset        INT
)
BEGIN
  -- Count result set
  SELECT COUNT(*) AS total
  FROM activities a
  WHERE (p_lead_id       IS NULL OR a.lead_id       = p_lead_id)
    AND (p_user_id       IS NULL OR a.user_id        = p_user_id)
    AND (p_activity_type IS NULL OR a.activity_type  = p_activity_type)
    AND (p_date_from     IS NULL OR DATE(a.activity_date) >= p_date_from)
    AND (p_date_to       IS NULL OR DATE(a.activity_date) <= p_date_to)
    AND (p_branch_id     IS NULL OR a.user_id IN (
          SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1
        ));

  -- Data result set
  SELECT a.*, l.customer_name, u.name AS agent_name
  FROM activities a
  JOIN leads l ON a.lead_id = l.lead_id
  JOIN users u ON a.user_id = u.user_id
  WHERE (p_lead_id       IS NULL OR a.lead_id       = p_lead_id)
    AND (p_user_id       IS NULL OR a.user_id        = p_user_id)
    AND (p_activity_type IS NULL OR a.activity_type  = p_activity_type)
    AND (p_date_from     IS NULL OR DATE(a.activity_date) >= p_date_from)
    AND (p_date_to       IS NULL OR DATE(a.activity_date) <= p_date_to)
    AND (p_branch_id     IS NULL OR a.user_id IN (
          SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1
        ))
  ORDER BY a.activity_date DESC
  LIMIT p_limit OFFSET p_offset;
END$$

DROP PROCEDURE IF EXISTS sp_GetUpcomingActivities$$
CREATE PROCEDURE sp_GetUpcomingActivities(
  IN p_user_id   INT UNSIGNED,
  IN p_branch_id INT UNSIGNED
)
BEGIN
  SELECT a.*, l.customer_name, u.name AS agent_name
  FROM activities a
  JOIN leads l ON a.lead_id = l.lead_id
  JOIN users u ON a.user_id = u.user_id
  WHERE a.is_scheduled = 1
    AND a.reminder_at > NOW()
    AND (p_user_id   IS NULL OR a.user_id = p_user_id)
    AND (p_branch_id IS NULL OR a.user_id IN (
          SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1
        ))
  ORDER BY a.reminder_at ASC
  LIMIT 50;
END$$

DROP PROCEDURE IF EXISTS sp_CreateActivity$$
CREATE PROCEDURE sp_CreateActivity(
  IN p_lead_id          INT UNSIGNED,
  IN p_user_id          INT UNSIGNED,
  IN p_activity_type    VARCHAR(50),
  IN p_activity_date    DATETIME,
  IN p_duration_minutes INT UNSIGNED,
  IN p_outcome          VARCHAR(255),
  IN p_notes            TEXT,
  IN p_location_lat     DECIMAL(10,8),
  IN p_location_long    DECIMAL(11,8),
  IN p_is_scheduled     TINYINT(1),
  IN p_reminder_at      DATETIME
)
BEGIN
  INSERT INTO activities (lead_id, user_id, activity_type, activity_date, duration_minutes, outcome, notes, location_lat, location_long, is_scheduled, reminder_at)
  VALUES (p_lead_id, p_user_id, p_activity_type, p_activity_date, p_duration_minutes, p_outcome, p_notes, p_location_lat, p_location_long, p_is_scheduled, p_reminder_at);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateActivity$$
CREATE PROCEDURE sp_UpdateActivity(
  IN p_activity_id      INT UNSIGNED,
  IN p_activity_type    VARCHAR(50),
  IN p_activity_date    DATETIME,
  IN p_duration_minutes INT UNSIGNED,
  IN p_outcome          VARCHAR(255),
  IN p_notes            TEXT,
  IN p_location_lat     DECIMAL(10,8),
  IN p_location_long    DECIMAL(11,8),
  IN p_is_scheduled     TINYINT(1),
  IN p_reminder_at      DATETIME
)
BEGIN
  UPDATE activities
  SET
    activity_type    = COALESCE(p_activity_type,    activity_type),
    activity_date    = COALESCE(p_activity_date,    activity_date),
    duration_minutes = COALESCE(p_duration_minutes, duration_minutes),
    outcome          = COALESCE(p_outcome,          outcome),
    notes            = COALESCE(p_notes,            notes),
    location_lat     = COALESCE(p_location_lat,     location_lat),
    location_long    = COALESCE(p_location_long,    location_long),
    is_scheduled     = COALESCE(p_is_scheduled,     is_scheduled),
    reminder_at      = COALESCE(p_reminder_at,      reminder_at)
  WHERE activity_id = p_activity_id;
END$$

DROP PROCEDURE IF EXISTS sp_DeleteActivity$$
CREATE PROCEDURE sp_DeleteActivity(IN p_activity_id INT UNSIGNED)
BEGIN
  DELETE FROM activities WHERE activity_id = p_activity_id;
END$$

-- ============================================================
-- OPPORTUNITIES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetOpportunityById$$
CREATE PROCEDURE sp_GetOpportunityById(IN p_opportunity_id INT UNSIGNED)
BEGIN
  SELECT o.*, l.customer_name, l.assigned_to AS agent_id, u.name AS agent_name
  FROM opportunities o
  JOIN leads l ON o.lead_id = l.lead_id
  LEFT JOIN users u ON l.assigned_to = u.user_id
  WHERE o.opportunity_id = p_opportunity_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetAllOpportunities$$
CREATE PROCEDURE sp_GetAllOpportunities(
  IN p_lead_id  INT UNSIGNED,
  IN p_stage    VARCHAR(100),
  IN p_agent_id INT UNSIGNED,
  IN p_limit    INT,
  IN p_offset   INT
)
BEGIN
  -- Count result set
  SELECT COUNT(*) AS total
  FROM opportunities o
  JOIN leads l ON o.lead_id = l.lead_id
  WHERE (p_lead_id  IS NULL OR o.lead_id      = p_lead_id)
    AND (p_stage    IS NULL OR o.stage        = p_stage)
    AND (p_agent_id IS NULL OR l.assigned_to  = p_agent_id);

  -- Data result set
  SELECT o.*, l.customer_name, l.assigned_to AS agent_id, u.name AS agent_name
  FROM opportunities o
  JOIN leads l ON o.lead_id = l.lead_id
  LEFT JOIN users u ON l.assigned_to = u.user_id
  WHERE (p_lead_id  IS NULL OR o.lead_id      = p_lead_id)
    AND (p_stage    IS NULL OR o.stage        = p_stage)
    AND (p_agent_id IS NULL OR l.assigned_to  = p_agent_id)
  ORDER BY o.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

DROP PROCEDURE IF EXISTS sp_CreateOpportunity$$
CREATE PROCEDURE sp_CreateOpportunity(
  IN p_lead_id        INT UNSIGNED,
  IN p_stage          VARCHAR(100),
  IN p_premium_amount DECIMAL(15,2),
  IN p_probability    TINYINT UNSIGNED,
  IN p_notes          TEXT
)
BEGIN
  INSERT INTO opportunities (lead_id, stage, premium_amount, probability, notes)
  VALUES (p_lead_id, p_stage, p_premium_amount, p_probability, p_notes);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateOpportunity$$
CREATE PROCEDURE sp_UpdateOpportunity(
  IN p_opportunity_id INT UNSIGNED,
  IN p_stage          VARCHAR(100),
  IN p_premium_amount DECIMAL(15,2),
  IN p_probability    TINYINT UNSIGNED,
  IN p_notes          TEXT
)
BEGIN
  UPDATE opportunities
  SET
    stage          = COALESCE(p_stage,          stage),
    premium_amount = COALESCE(p_premium_amount, premium_amount),
    probability    = COALESCE(p_probability,    probability),
    notes          = COALESCE(p_notes,          notes)
  WHERE opportunity_id = p_opportunity_id;
END$$

DROP PROCEDURE IF EXISTS sp_DeleteOpportunity$$
CREATE PROCEDURE sp_DeleteOpportunity(IN p_opportunity_id INT UNSIGNED)
BEGIN
  DELETE FROM opportunities WHERE opportunity_id = p_opportunity_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetOpportunityPipeline$$
CREATE PROCEDURE sp_GetOpportunityPipeline(IN p_agent_id INT UNSIGNED)
BEGIN
  SELECT o.stage,
         COUNT(*) AS count,
         SUM(o.premium_amount) AS total_premium,
         AVG(o.probability) AS avg_probability
  FROM opportunities o
  JOIN leads l ON o.lead_id = l.lead_id
  WHERE (p_agent_id IS NULL OR l.assigned_to = p_agent_id)
  GROUP BY o.stage
  ORDER BY o.stage;
END$$

-- ============================================================
-- POLICIES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetPolicyById$$
CREATE PROCEDURE sp_GetPolicyById(IN p_policy_id INT UNSIGNED)
BEGIN
  SELECT p.*, pt.name AS product_type_name, u.name AS agent_name
  FROM policies p
  JOIN product_types pt ON p.product_type_id = pt.product_type_id
  JOIN users u ON p.agent_id = u.user_id
  WHERE p.policy_id = p_policy_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetAllPolicies$$
CREATE PROCEDURE sp_GetAllPolicies(
  IN p_product_type_id INT UNSIGNED,
  IN p_agent_id        INT UNSIGNED,
  IN p_date_from       DATE,
  IN p_date_to         DATE,
  IN p_search          VARCHAR(255),
  IN p_limit           INT,
  IN p_offset          INT
)
BEGIN
  -- Count result set
  SELECT COUNT(*) AS total
  FROM policies p
  WHERE (p_product_type_id IS NULL OR p.product_type_id = p_product_type_id)
    AND (p_agent_id        IS NULL OR p.agent_id        = p_agent_id)
    AND (p_date_from       IS NULL OR p.start_date      >= p_date_from)
    AND (p_date_to         IS NULL OR p.start_date      <= p_date_to)
    AND (p_search          IS NULL OR p.customer_name LIKE CONCAT('%', p_search, '%')
                                   OR p.policy_number  LIKE CONCAT('%', p_search, '%'));

  -- Data result set
  SELECT p.*, pt.name AS product_type_name, u.name AS agent_name
  FROM policies p
  JOIN product_types pt ON p.product_type_id = pt.product_type_id
  JOIN users u ON p.agent_id = u.user_id
  WHERE (p_product_type_id IS NULL OR p.product_type_id = p_product_type_id)
    AND (p_agent_id        IS NULL OR p.agent_id        = p_agent_id)
    AND (p_date_from       IS NULL OR p.start_date      >= p_date_from)
    AND (p_date_to         IS NULL OR p.start_date      <= p_date_to)
    AND (p_search          IS NULL OR p.customer_name LIKE CONCAT('%', p_search, '%')
                                   OR p.policy_number  LIKE CONCAT('%', p_search, '%'))
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

DROP PROCEDURE IF EXISTS sp_CreatePolicy$$
CREATE PROCEDURE sp_CreatePolicy(
  IN p_customer_name   VARCHAR(200),
  IN p_policy_number   VARCHAR(100),
  IN p_lead_id         INT UNSIGNED,
  IN p_product_type_id INT UNSIGNED,
  IN p_premium         DECIMAL(15,2),
  IN p_start_date      DATE,
  IN p_end_date        DATE,
  IN p_agent_id        INT UNSIGNED
)
BEGIN
  INSERT INTO policies (customer_name, policy_number, lead_id, product_type_id, premium, start_date, end_date, agent_id)
  VALUES (p_customer_name, p_policy_number, p_lead_id, p_product_type_id, p_premium, p_start_date, p_end_date, p_agent_id);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdatePolicy$$
CREATE PROCEDURE sp_UpdatePolicy(
  IN p_policy_id             INT UNSIGNED,
  IN p_customer_name         VARCHAR(200),
  IN p_policy_number         VARCHAR(100),
  IN p_lead_id               INT UNSIGNED,
  IN p_product_type_id       INT UNSIGNED,
  IN p_premium               DECIMAL(15,2),
  IN p_start_date            DATE,
  IN p_end_date              DATE,
  IN p_agent_id              INT UNSIGNED,
  IN p_renewal_notified_30   TINYINT(1),
  IN p_renewal_notified_60   TINYINT(1),
  IN p_renewal_notified_90   TINYINT(1)
)
BEGIN
  UPDATE policies
  SET
    customer_name         = COALESCE(p_customer_name,         customer_name),
    policy_number         = COALESCE(p_policy_number,         policy_number),
    lead_id               = COALESCE(p_lead_id,               lead_id),
    product_type_id       = COALESCE(p_product_type_id,       product_type_id),
    premium               = COALESCE(p_premium,               premium),
    start_date            = COALESCE(p_start_date,            start_date),
    end_date              = COALESCE(p_end_date,              end_date),
    agent_id              = COALESCE(p_agent_id,              agent_id),
    renewal_notified_30   = COALESCE(p_renewal_notified_30,   renewal_notified_30),
    renewal_notified_60   = COALESCE(p_renewal_notified_60,   renewal_notified_60),
    renewal_notified_90   = COALESCE(p_renewal_notified_90,   renewal_notified_90)
  WHERE policy_id = p_policy_id;
END$$

DROP PROCEDURE IF EXISTS sp_DeletePolicy$$
CREATE PROCEDURE sp_DeletePolicy(IN p_policy_id INT UNSIGNED)
BEGIN
  DELETE FROM policies WHERE policy_id = p_policy_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetPolicyRenewals$$
CREATE PROCEDURE sp_GetPolicyRenewals(IN p_agent_id INT UNSIGNED)
BEGIN
  SELECT p.*, pt.name AS product_type_name, u.name AS agent_name,
         DATEDIFF(p.end_date, CURDATE()) AS days_to_expiry
  FROM policies p
  JOIN product_types pt ON p.product_type_id = pt.product_type_id
  JOIN users u ON p.agent_id = u.user_id
  WHERE p.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
    AND (p_agent_id IS NULL OR p.agent_id = p_agent_id)
  ORDER BY p.end_date ASC;
END$$

DROP PROCEDURE IF EXISTS sp_MarkRenewalNotified$$
CREATE PROCEDURE sp_MarkRenewalNotified(
  IN p_policy_id INT UNSIGNED,
  IN p_days      TINYINT
)
BEGIN
  IF p_days = 30 THEN
    UPDATE policies SET renewal_notified_30 = 1 WHERE policy_id = p_policy_id;
  ELSEIF p_days = 60 THEN
    UPDATE policies SET renewal_notified_60 = 1 WHERE policy_id = p_policy_id;
  ELSEIF p_days = 90 THEN
    UPDATE policies SET renewal_notified_90 = 1 WHERE policy_id = p_policy_id;
  END IF;
END$$

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetNotificationsByUser$$
CREATE PROCEDURE sp_GetNotificationsByUser(
  IN p_user_id INT UNSIGNED,
  IN p_limit   INT,
  IN p_offset  INT
)
BEGIN
  -- Total count
  SELECT COUNT(*) AS total FROM notifications WHERE user_id = p_user_id;

  -- Unread count
  SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = p_user_id AND status = 'unread';

  -- Paginated data
  SELECT * FROM notifications
  WHERE user_id = p_user_id
  ORDER BY CASE WHEN status = 'unread' THEN 0 ELSE 1 END, created_at DESC
  LIMIT p_limit OFFSET p_offset;
END$$

DROP PROCEDURE IF EXISTS sp_CreateNotification$$
CREATE PROCEDURE sp_CreateNotification(
  IN p_user_id INT UNSIGNED,
  IN p_message TEXT,
  IN p_type    VARCHAR(50)
)
BEGIN
  INSERT INTO notifications (user_id, message, type, status)
  VALUES (p_user_id, p_message, p_type, 'unread');
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetNotificationById$$
CREATE PROCEDURE sp_GetNotificationById(IN p_notification_id INT UNSIGNED)
BEGIN
  SELECT * FROM notifications WHERE notification_id = p_notification_id;
END$$

DROP PROCEDURE IF EXISTS sp_MarkNotificationRead$$
CREATE PROCEDURE sp_MarkNotificationRead(
  IN p_notification_id INT UNSIGNED,
  IN p_user_id         INT UNSIGNED
)
BEGIN
  UPDATE notifications SET status = 'read'
  WHERE notification_id = p_notification_id AND user_id = p_user_id;

  SELECT * FROM notifications WHERE notification_id = p_notification_id;
END$$

DROP PROCEDURE IF EXISTS sp_MarkAllNotificationsRead$$
CREATE PROCEDURE sp_MarkAllNotificationsRead(IN p_user_id INT UNSIGNED)
BEGIN
  UPDATE notifications SET status = 'read'
  WHERE user_id = p_user_id AND status = 'unread';

  SELECT ROW_COUNT() AS affected_rows;
END$$

DROP PROCEDURE IF EXISTS sp_DeleteNotification$$
CREATE PROCEDURE sp_DeleteNotification(
  IN p_notification_id INT UNSIGNED,
  IN p_user_id         INT UNSIGNED
)
BEGIN
  DELETE FROM notifications WHERE notification_id = p_notification_id AND user_id = p_user_id;
END$$

-- ============================================================
-- DASHBOARD
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetDashboardKPIs$$
CREATE PROCEDURE sp_GetDashboardKPIs(
  IN p_user_id   INT UNSIGNED,
  IN p_role_name VARCHAR(100),
  IN p_branch_id INT UNSIGNED,
  IN p_date_from DATE,
  IN p_date_to   DATE
)
BEGIN
  -- Total leads in scope
  SELECT COUNT(*) AS total_leads
  FROM leads l
  WHERE l.is_deleted = 0
    AND (p_role_name = 'Sales Agent'   AND l.assigned_to = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND l.assigned_to IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- New leads in period
  SELECT COUNT(*) AS new_leads
  FROM leads l
  WHERE l.is_deleted = 0
    AND DATE(l.created_at) BETWEEN p_date_from AND p_date_to
    AND (p_role_name = 'Sales Agent'   AND l.assigned_to = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND l.assigned_to IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- Closed leads
  SELECT COUNT(*) AS closed_leads
  FROM leads l
  WHERE l.is_deleted = 0 AND l.status = 'Closed'
    AND (p_role_name = 'Sales Agent'   AND l.assigned_to = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND l.assigned_to IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- Calls in period
  SELECT COUNT(*) AS calls
  FROM activities a
  WHERE a.activity_type = 'call'
    AND DATE(a.activity_date) BETWEEN p_date_from AND p_date_to
    AND (p_role_name = 'Sales Agent'   AND a.user_id = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND a.user_id IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- Meetings in period
  SELECT COUNT(*) AS meetings
  FROM activities a
  WHERE a.activity_type = 'meeting'
    AND DATE(a.activity_date) BETWEEN p_date_from AND p_date_to
    AND (p_role_name = 'Sales Agent'   AND a.user_id = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND a.user_id IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- Premium generated from policies in period
  SELECT COALESCE(SUM(p.premium), 0) AS premium_generated
  FROM policies p
  WHERE p.start_date BETWEEN p_date_from AND p_date_to
    AND (p_role_name = 'Sales Agent'   AND p.agent_id = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND p.agent_id IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- Activities today
  SELECT COUNT(*) AS activities_today
  FROM activities a
  WHERE DATE(a.activity_date) = CURDATE()
    AND (p_role_name = 'Sales Agent'   AND a.user_id = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND a.user_id IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));
END$$

DROP PROCEDURE IF EXISTS sp_GetDashboardPipeline$$
CREATE PROCEDURE sp_GetDashboardPipeline(
  IN p_user_id   INT UNSIGNED,
  IN p_role_name VARCHAR(100),
  IN p_branch_id INT UNSIGNED
)
BEGIN
  SELECT l.status, COUNT(*) AS count
  FROM leads l
  WHERE l.is_deleted = 0
    AND (p_role_name = 'Sales Agent'   AND l.assigned_to = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND l.assigned_to IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'))
  GROUP BY l.status
  ORDER BY FIELD(l.status, 'New', 'Contacted', 'Qualified', 'Proposal', 'Closed');
END$$

DROP PROCEDURE IF EXISTS sp_GetAgentPerformance$$
CREATE PROCEDURE sp_GetAgentPerformance(
  IN p_current_role_name VARCHAR(100),
  IN p_current_branch_id INT UNSIGNED,
  IN p_filter_agent_id   INT UNSIGNED,
  IN p_filter_branch_id  INT UNSIGNED,
  IN p_date_from         DATE,
  IN p_date_to           DATE
)
BEGIN
  SELECT
    u.user_id,
    u.name AS agent_name,
    COUNT(DISTINCT l.lead_id) AS total_leads,
    COUNT(DISTINCT a.activity_id) AS activities_count,
    SUM(CASE WHEN a.activity_type = 'call'       THEN 1 ELSE 0 END) AS calls,
    SUM(CASE WHEN a.activity_type = 'meeting'    THEN 1 ELSE 0 END) AS meetings,
    SUM(CASE WHEN a.activity_type = 'follow-up'  THEN 1 ELSE 0 END) AS follow_ups,
    COUNT(DISTINCT CASE WHEN l.status = 'Closed' THEN l.lead_id END) AS closed_deals,
    COALESCE(SUM(DISTINCT p.premium), 0) AS premium_generated
  FROM users u
  LEFT JOIN leads l
    ON l.assigned_to = u.user_id AND l.is_deleted = 0
    AND DATE(l.created_at) BETWEEN p_date_from AND p_date_to
  LEFT JOIN activities a
    ON a.user_id = u.user_id
    AND DATE(a.activity_date) BETWEEN p_date_from AND p_date_to
  LEFT JOIN policies p
    ON p.agent_id = u.user_id
    AND p.start_date BETWEEN p_date_from AND p_date_to
  WHERE
    (p_filter_agent_id  IS NOT NULL AND u.user_id   = p_filter_agent_id)
    OR (p_filter_branch_id IS NOT NULL AND p_filter_agent_id IS NULL AND u.branch_id = p_filter_branch_id)
    OR (p_filter_agent_id IS NULL AND p_filter_branch_id IS NULL
        AND p_current_role_name IN ('Branch Manager','Team Leader')
        AND u.branch_id = p_current_branch_id)
    OR (p_filter_agent_id IS NULL AND p_filter_branch_id IS NULL
        AND p_current_role_name NOT IN ('Branch Manager','Team Leader'))
  GROUP BY u.user_id, u.name
  ORDER BY total_leads DESC;
END$$

DROP PROCEDURE IF EXISTS sp_GetActivitiesSummary$$
CREATE PROCEDURE sp_GetActivitiesSummary(
  IN p_user_id   INT UNSIGNED,
  IN p_role_name VARCHAR(100),
  IN p_branch_id INT UNSIGNED,
  IN p_date_from DATE,
  IN p_date_to   DATE
)
BEGIN
  -- Summary totals
  SELECT
    SUM(CASE WHEN a.activity_type = 'call'      THEN 1 ELSE 0 END) AS calls,
    SUM(CASE WHEN a.activity_type = 'meeting'   THEN 1 ELSE 0 END) AS meetings,
    SUM(CASE WHEN a.activity_type = 'follow-up' THEN 1 ELSE 0 END) AS follow_ups
  FROM activities a
  WHERE DATE(a.activity_date) BETWEEN p_date_from AND p_date_to
    AND (p_role_name = 'Sales Agent'   AND a.user_id = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND a.user_id IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'));

  -- By day breakdown
  SELECT DATE(a.activity_date) AS date, a.activity_type, COUNT(*) AS count
  FROM activities a
  WHERE DATE(a.activity_date) BETWEEN p_date_from AND p_date_to
    AND (p_role_name = 'Sales Agent'   AND a.user_id = p_user_id
      OR p_role_name IN ('Branch Manager','Team Leader') AND a.user_id IN (
           SELECT user_id FROM users WHERE branch_id = p_branch_id AND is_active = 1)
      OR p_role_name NOT IN ('Sales Agent','Branch Manager','Team Leader'))
  GROUP BY DATE(a.activity_date), a.activity_type
  ORDER BY date ASC;
END$$

-- ============================================================
-- CONFIG - ROLES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetRoles$$
CREATE PROCEDURE sp_GetRoles()
BEGIN
  SELECT * FROM roles ORDER BY role_id ASC;
END$$

DROP PROCEDURE IF EXISTS sp_GetRoleById$$
CREATE PROCEDURE sp_GetRoleById(IN p_role_id INT UNSIGNED)
BEGIN
  SELECT * FROM roles WHERE role_id = p_role_id;
END$$

DROP PROCEDURE IF EXISTS sp_CreateRole$$
CREATE PROCEDURE sp_CreateRole(
  IN p_name        VARCHAR(100),
  IN p_permissions JSON
)
BEGIN
  INSERT INTO roles (name, permissions) VALUES (p_name, p_permissions);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateRole$$
CREATE PROCEDURE sp_UpdateRole(
  IN p_role_id     INT UNSIGNED,
  IN p_name        VARCHAR(100),
  IN p_permissions JSON
)
BEGIN
  UPDATE roles
  SET
    name        = COALESCE(p_name,        name),
    permissions = COALESCE(p_permissions, permissions)
  WHERE role_id = p_role_id;
END$$

DROP PROCEDURE IF EXISTS sp_DeleteRole$$
CREATE PROCEDURE sp_DeleteRole(IN p_role_id INT UNSIGNED)
BEGIN
  -- Check if any users have this role
  SELECT COUNT(*) AS user_count FROM users WHERE role_id = p_role_id;

  -- Delete if no users (caller checks the count)
  DELETE FROM roles WHERE role_id = p_role_id;
END$$

-- ============================================================
-- CONFIG - PRODUCT TYPES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetProductTypes$$
CREATE PROCEDURE sp_GetProductTypes()
BEGIN
  SELECT * FROM product_types ORDER BY product_type_id ASC;
END$$

DROP PROCEDURE IF EXISTS sp_GetProductTypeById$$
CREATE PROCEDURE sp_GetProductTypeById(IN p_product_type_id INT UNSIGNED)
BEGIN
  SELECT * FROM product_types WHERE product_type_id = p_product_type_id;
END$$

DROP PROCEDURE IF EXISTS sp_CreateProductType$$
CREATE PROCEDURE sp_CreateProductType(
  IN p_name        VARCHAR(150),
  IN p_description TEXT
)
BEGIN
  INSERT INTO product_types (name, description) VALUES (p_name, p_description);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateProductType$$
CREATE PROCEDURE sp_UpdateProductType(
  IN p_product_type_id INT UNSIGNED,
  IN p_name            VARCHAR(150),
  IN p_description     TEXT,
  IN p_is_active       TINYINT(1)
)
BEGIN
  UPDATE product_types
  SET
    name        = COALESCE(p_name,        name),
    description = COALESCE(p_description, description),
    is_active   = COALESCE(p_is_active,   is_active)
  WHERE product_type_id = p_product_type_id;
END$$

DROP PROCEDURE IF EXISTS sp_DeactivateProductType$$
CREATE PROCEDURE sp_DeactivateProductType(IN p_product_type_id INT UNSIGNED)
BEGIN
  UPDATE product_types SET is_active = 0 WHERE product_type_id = p_product_type_id;
END$$

-- ============================================================
-- CONFIG - LEAD SUB-STATUSES
-- ============================================================

DROP PROCEDURE IF EXISTS sp_GetLeadSubStatuses$$
CREATE PROCEDURE sp_GetLeadSubStatuses(IN p_lead_status VARCHAR(50))
BEGIN
  SELECT * FROM lead_sub_statuses
  WHERE (p_lead_status IS NULL OR lead_status = p_lead_status)
  ORDER BY id ASC;
END$$

DROP PROCEDURE IF EXISTS sp_GetLeadSubStatusById$$
CREATE PROCEDURE sp_GetLeadSubStatusById(IN p_id INT UNSIGNED)
BEGIN
  SELECT * FROM lead_sub_statuses WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_CreateLeadSubStatus$$
CREATE PROCEDURE sp_CreateLeadSubStatus(
  IN p_lead_status     VARCHAR(50),
  IN p_sub_status_name VARCHAR(100)
)
BEGIN
  INSERT INTO lead_sub_statuses (lead_status, sub_status_name)
  VALUES (p_lead_status, p_sub_status_name);
  SELECT LAST_INSERT_ID() AS insert_id;
END$$

DROP PROCEDURE IF EXISTS sp_UpdateLeadSubStatus$$
CREATE PROCEDURE sp_UpdateLeadSubStatus(
  IN p_id              INT UNSIGNED,
  IN p_lead_status     VARCHAR(50),
  IN p_sub_status_name VARCHAR(100),
  IN p_is_active       TINYINT(1)
)
BEGIN
  UPDATE lead_sub_statuses
  SET
    lead_status     = COALESCE(p_lead_status,     lead_status),
    sub_status_name = COALESCE(p_sub_status_name, sub_status_name),
    is_active       = COALESCE(p_is_active,       is_active)
  WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_DeactivateLeadSubStatus$$
CREATE PROCEDURE sp_DeactivateLeadSubStatus(IN p_id INT UNSIGNED)
BEGIN
  UPDATE lead_sub_statuses SET is_active = 0 WHERE id = p_id;
END$$

-- ============================================================
-- AUTH
-- ============================================================

DROP PROCEDURE IF EXISTS sp_UpdateUserPassword$$
CREATE PROCEDURE sp_UpdateUserPassword(
  IN p_user_id  INT UNSIGNED,
  IN p_password VARCHAR(255)
)
BEGIN
  UPDATE users SET password = p_password WHERE user_id = p_user_id;
END$$

DROP PROCEDURE IF EXISTS sp_GetRenewalPolicies$$
CREATE PROCEDURE sp_GetRenewalPolicies(
  IN p_is_admin TINYINT(1),
  IN p_user_id  INT UNSIGNED
)
BEGIN
  SELECT p.policy_id, p.customer_name, p.policy_number, p.end_date, p.agent_id,
         p.renewal_notified_30, p.renewal_notified_60, p.renewal_notified_90,
         DATEDIFF(p.end_date, CURDATE()) AS days_to_expiry
  FROM policies p
  WHERE p.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
    AND (p_is_admin = 1 OR p.agent_id = p_user_id);
END$$

DELIMITER ;
