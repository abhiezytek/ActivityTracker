const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Insurance Sales Activity Tracker API',
      version: '1.0.0',
      description: 'Backend API for the Insurance Sales Activity Tracking System',
    },
    servers: [
      { url: '/api', description: 'API base path' }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            user_id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role_id: { type: 'integer' },
            role_name: { type: 'string' },
            branch_id: { type: 'integer' },
            branch_name: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Lead: {
          type: 'object',
          properties: {
            lead_id: { type: 'integer' },
            customer_name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string', format: 'email' },
            product_type_id: { type: 'integer' },
            product_type_name: { type: 'string' },
            source: { type: 'string', enum: ['online', 'referral', 'walk-in'] },
            status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'] },
            sub_status: { type: 'string' },
            assigned_to: { type: 'integer' },
            assigned_agent_name: { type: 'string' },
            created_by: { type: 'integer' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            activity_id: { type: 'integer' },
            lead_id: { type: 'integer' },
            customer_name: { type: 'string' },
            user_id: { type: 'integer' },
            agent_name: { type: 'string' },
            activity_type: { type: 'string', enum: ['call', 'meeting', 'follow-up'] },
            activity_date: { type: 'string', format: 'date-time' },
            duration_minutes: { type: 'integer' },
            outcome: { type: 'string' },
            notes: { type: 'string' },
            location_lat: { type: 'number' },
            location_long: { type: 'number' },
            is_scheduled: { type: 'boolean' },
            reminder_at: { type: 'string', format: 'date-time' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Policy: {
          type: 'object',
          properties: {
            policy_id: { type: 'integer' },
            customer_name: { type: 'string' },
            policy_number: { type: 'string' },
            lead_id: { type: 'integer' },
            product_type_id: { type: 'integer' },
            product_type_name: { type: 'string' },
            premium: { type: 'number', format: 'float' },
            start_date: { type: 'string', format: 'date' },
            end_date: { type: 'string', format: 'date' },
            agent_id: { type: 'integer' },
            agent_name: { type: 'string' },
            renewal_notified_30: { type: 'boolean' },
            renewal_notified_60: { type: 'boolean' },
            renewal_notified_90: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Opportunity: {
          type: 'object',
          properties: {
            opportunity_id: { type: 'integer' },
            lead_id: { type: 'integer' },
            customer_name: { type: 'string' },
            stage: { type: 'string' },
            premium_amount: { type: 'number', format: 'float' },
            probability: { type: 'integer', minimum: 0, maximum: 100 },
            notes: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            notification_id: { type: 'integer' },
            user_id: { type: 'integer' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['reminder', 'missed_activity', 'renewal', 'general'] },
            status: { type: 'string', enum: ['unread', 'read'] },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Role: {
          type: 'object',
          properties: {
            role_id: { type: 'integer' },
            name: { type: 'string' },
            permissions: { type: 'object' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ProductType: {
          type: 'object',
          properties: {
            product_type_id: { type: 'integer' },
            name: { type: 'string' },
            description: { type: 'string' },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        }
      }
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Leads', description: 'Lead management' },
      { name: 'Activities', description: 'Activity tracking' },
      { name: 'Dashboard', description: 'Dashboard KPIs and analytics' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Policies', description: 'Policy management' },
      { name: 'Opportunities', description: 'Opportunity pipeline' },
      { name: 'Config', description: 'System configuration' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
