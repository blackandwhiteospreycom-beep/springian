const pool = require('./db');

async function setupAuthTables() {
  try {
    console.log('🔧 Setting up authentication & multi-tenant tables...');

    // ─── 1. Organizations ───────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        domain VARCHAR(200) UNIQUE,
        plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
        logo_url TEXT,
        settings JSONB DEFAULT '{}',
        created_by INT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ organizations table created');

    // ─── 2. Users (replace existing users table, or add auth columns) ───
    // We keep existing users table and add auth fields
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS avatar TEXT,
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
      ADD COLUMN IF NOT EXISTS role VARCHAR(30) DEFAULT 'user' CHECK (role IN ('super_admin', 'org_admin', 'manager', 'user')),
      ADD COLUMN IF NOT EXISTS org_id INT REFERENCES organizations(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited'));
    `);
    console.log('✅ users table updated with auth columns');

    // ─── 3. Service Catalog ─────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_catalog (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        category VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ service_catalog table created');

    // ─── 4. Organization Services (which org has what + tier) ────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS org_services (
        id SERIAL PRIMARY KEY,
        org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        tier VARCHAR(20) DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
        subscribed_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        UNIQUE(org_id, service_id)
      );
    `);
    console.log('✅ org_services table created');

    // ─── 5. Service Tiers (limits per service per tier) ─────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_tiers (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
        limits JSONB NOT NULL,
        features TEXT[],
        price_monthly DECIMAL(10, 2) DEFAULT 0,
        price_yearly DECIMAL(10, 2) DEFAULT 0,
        UNIQUE(service_id, tier)
      );
    `);
    console.log('✅ service_tiers table created');

    // ─── 6. Service Modules (UI modules per service) ────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_modules (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL,
        description TEXT,
        tier_required VARCHAR(20) DEFAULT 'free' CHECK (tier_required IN ('free', 'pro', 'enterprise')),
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        UNIQUE(service_id, slug)
      );
    `);
    console.log('✅ service_modules table created');

    // ─── 7. User Organizations (many-to-many with role) ────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_organizations (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
        role VARCHAR(30) DEFAULT 'user' CHECK (role IN ('org_admin', 'manager', 'user')),
        invited_at TIMESTAMP DEFAULT NOW(),
        joined_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
        UNIQUE(user_id, org_id)
      );
    `);
    console.log('✅ user_organizations table created');

    // ─── 8. Onboarding Templates (questions per service) ────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS onboarding_templates (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        question_key VARCHAR(100) NOT NULL,
        question_text TEXT NOT NULL,
        question_type VARCHAR(30) DEFAULT 'text' CHECK (question_type IN ('text', 'select', 'multiselect', 'number', 'boolean')),
        options JSONB,
        is_required BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        UNIQUE(service_id, question_key)
      );
    `);
    console.log('✅ onboarding_templates table created');

    // ─── 9. Onboarding Responses (user answers) ────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS onboarding_responses (
        id SERIAL PRIMARY KEY,
        org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        question_key VARCHAR(100) NOT NULL,
        answer TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ onboarding_responses table created');

    // ─── 10. Feature Flags (super admin controls) ──────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id SERIAL PRIMARY KEY,
        flag_key VARCHAR(100) UNIQUE NOT NULL,
        flag_name VARCHAR(200),
        description TEXT,
        enabled_for_free BOOLEAN DEFAULT true,
        enabled_for_pro BOOLEAN DEFAULT true,
        enabled_for_enterprise BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ feature_flags table created');

    // ─── 11. AI Usage Tiers ────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_usage_tiers (
        id SERIAL PRIMARY KEY,
        tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
        daily_limit INT,
        monthly_limit INT,
        models_allowed TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tier)
      );
    `);
    console.log('✅ ai_usage_tiers table created');

    // ─── 12. Audit Logs ────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        org_id INT REFERENCES organizations(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        details JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ audit_logs table created');

    // ─── 13. Sessions (JWT management) ─────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_valid BOOLEAN DEFAULT true
      );
    `);
    console.log('✅ sessions table created');

    // ═══════════════════════════════════════════════════════════════════
    // SEED DATA
    // ═══════════════════════════════════════════════════════════════════

    // Check if data already seeded
    const { rows: existingServices } = await pool.query('SELECT COUNT(*) FROM service_catalog');
    if (parseInt(existingServices[0].count) > 0) {
      console.log('⏭️  Service catalog already seeded, skipping...');
    } else {
      console.log('🌱 Seeding service catalog...');

      // Seed 7 services
      const services = [
        { name: 'CRM', slug: 'crm', description: 'Customer Relationship Management', icon: 'users', color: '#296374', category: 'Sales' },
        { name: 'Finance', slug: 'finance', description: 'Invoicing, Budgets & Financial Reports', icon: 'dollar', color: '#16A34A', category: 'Finance' },
        { name: 'HR Management', slug: 'hr', description: 'Employee Management, Payroll & Recruitment', icon: 'team', color: '#25A8E1', category: 'People' },
        { name: 'Sales', slug: 'sales', description: 'Deals, Pipeline & Revenue Tracking', icon: 'chart', color: '#714B67', category: 'Sales' },
        { name: 'Inventory', slug: 'inventory', description: 'Stock Tracking & Warehouse Management', icon: 'box', color: '#DC2626', category: 'Operations' },
        { name: 'Projects', slug: 'projects', description: 'Task Management & Team Collaboration', icon: 'project', color: '#00AEEF', category: 'Operations' },
        { name: 'Accounting', slug: 'accounting', description: 'Bookkeeping, Tax & Multi-Currency', icon: 'calculator', color: '#EA580C', category: 'Finance' },
      ];

      for (const s of services) {
        await pool.query(
          `INSERT INTO service_catalog (name, slug, description, icon, color, category, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [s.name, s.slug, s.description, s.icon, s.color, s.category, services.indexOf(s) + 1]
        );
      }
      console.log('✅ Seeded 7 services');

      // Seed service tiers
      const tiers = [
        // CRM
        { service: 'crm', tier: 'free', limits: { leads: 100, users: 1, storage_mb: 100 }, features: ['Basic CRM', 'Lead Management', 'Contact List'], price_monthly: 0, price_yearly: 0 },
        { service: 'crm', tier: 'pro', limits: { leads: 5000, users: 10, storage_mb: 5000 }, features: ['Full CRM', 'Sales Pipeline', 'Email Integration', 'Reports', 'API Access'], price_monthly: 29, price_yearly: 290 },
        { service: 'crm', tier: 'enterprise', limits: { leads: -1, users: -1, storage_mb: -1 }, features: ['Everything in Pro', 'Unlimited Leads', 'Unlimited Users', 'Custom Integrations', 'Priority Support'], price_monthly: 99, price_yearly: 990 },
        // Finance
        { service: 'finance', tier: 'free', limits: { invoices: 50, users: 1, storage_mb: 100 }, features: ['Basic Invoicing', 'Payment Tracking'], price_monthly: 0, price_yearly: 0 },
        { service: 'finance', tier: 'pro', limits: { invoices: -1, users: 10, storage_mb: 5000 }, features: ['Full Finance', 'Budgets', 'Reports', 'Multi-Currency'], price_monthly: 39, price_yearly: 390 },
        { service: 'finance', tier: 'enterprise', limits: { invoices: -1, users: -1, storage_mb: -1 }, features: ['Everything in Pro', 'Custom Workflows', 'API Access', 'Dedicated Support'], price_monthly: 129, price_yearly: 1290 },
        // HR
        { service: 'hr', tier: 'free', limits: { employees: 10, users: 1, storage_mb: 100 }, features: ['Employee Directory', 'Basic Profiles'], price_monthly: 0, price_yearly: 0 },
        { service: 'hr', tier: 'pro', limits: { employees: 200, users: 5, storage_mb: 5000 }, features: ['Full HR', 'Payroll', 'Recruitment', 'Performance Reviews'], price_monthly: 49, price_yearly: 490 },
        { service: 'hr', tier: 'enterprise', limits: { employees: -1, users: -1, storage_mb: -1 }, features: ['Everything in Pro', 'Custom Modules', 'SSO', 'Analytics'], price_monthly: 149, price_yearly: 1490 },
        // Sales
        { service: 'sales', tier: 'free', limits: { deals: 10, users: 1, storage_mb: 100 }, features: ['Basic Pipeline', 'Deal Tracking'], price_monthly: 0, price_yearly: 0 },
        { service: 'sales', tier: 'pro', limits: { deals: 500, users: 10, storage_mb: 5000 }, features: ['Full Sales', 'Forecasts', 'Team Management', 'Reports'], price_monthly: 34, price_yearly: 340 },
        { service: 'sales', tier: 'enterprise', limits: { deals: -1, users: -1, storage_mb: -1 }, features: ['Everything in Pro', 'AI Predictions', 'Custom Dashboards', 'API'], price_monthly: 109, price_yearly: 1090 },
        // Inventory
        { service: 'inventory', tier: 'free', limits: { items: 50, warehouses: 1, users: 1 }, features: ['Basic Stock Tracking', '1 Warehouse'], price_monthly: 0, price_yearly: 0 },
        { service: 'inventory', tier: 'pro', limits: { items: 10000, warehouses: 5, users: 10 }, features: ['Full Inventory', 'Multi-Warehouse', 'Barcode Scanning', 'Reordering'], price_monthly: 44, price_yearly: 440 },
        { service: 'inventory', tier: 'enterprise', limits: { items: -1, warehouses: -1, users: -1 }, features: ['Everything in Pro', 'IoT Integration', 'Custom Reports', 'API'], price_monthly: 139, price_yearly: 1390 },
        // Projects
        { service: 'projects', tier: 'free', limits: { projects: 3, tasks_per_project: 5, users: 3 }, features: ['Basic Projects', 'Task Lists'], price_monthly: 0, price_yearly: 0 },
        { service: 'projects', tier: 'pro', limits: { projects: 50, tasks_per_project: -1, users: 20 }, features: ['Full Projects', 'Gantt Charts', 'Time Tracking', 'Reports'], price_monthly: 24, price_yearly: 240 },
        { service: 'projects', tier: 'enterprise', limits: { projects: -1, tasks_per_project: -1, users: -1 }, features: ['Everything in Pro', 'Portfolio View', 'Custom Fields', 'API'], price_monthly: 79, price_yearly: 790 },
        // Accounting
        { service: 'accounting', tier: 'free', limits: { transactions: 100, users: 1, storage_mb: 100 }, features: ['Basic Bookkeeping', 'Transaction Log'], price_monthly: 0, price_yearly: 0 },
        { service: 'accounting', tier: 'pro', limits: { transactions: 10000, users: 5, storage_mb: 5000 }, features: ['Full Accounting', 'Tax Reports', 'Multi-Currency', 'Bank Sync'], price_monthly: 54, price_yearly: 540 },
        { service: 'accounting', tier: 'enterprise', limits: { transactions: -1, users: -1, storage_mb: -1 }, features: ['Everything in Pro', 'Audit Trail', 'Custom Workflows', 'API'], price_monthly: 169, price_yearly: 1690 },
      ];

      for (const t of tiers) {
        const serviceRes = await pool.query('SELECT id FROM service_catalog WHERE slug = $1', [t.service]);
        if (serviceRes.rows.length > 0) {
          await pool.query(
            `INSERT INTO service_tiers (service_id, tier, limits, features, price_monthly, price_yearly)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [serviceRes.rows[0].id, t.tier, JSON.stringify(t.limits), t.features, t.price_monthly, t.price_yearly]
          );
        }
      }
      console.log('✅ Seeded 21 service tiers (7 services × 3 tiers)');

      // Seed service modules
      const modules = [
        { service: 'crm', name: 'Leads', slug: 'leads', tier_required: 'free' },
        { service: 'crm', name: 'Contacts', slug: 'contacts', tier_required: 'free' },
        { service: 'crm', name: 'Deals', slug: 'deals', tier_required: 'pro' },
        { service: 'crm', name: 'Reports', slug: 'reports', tier_required: 'pro' },
        { service: 'finance', name: 'Invoices', slug: 'invoices', tier_required: 'free' },
        { service: 'finance', name: 'Payments', slug: 'payments', tier_required: 'free' },
        { service: 'finance', name: 'Budgets', slug: 'budgets', tier_required: 'pro' },
        { service: 'finance', name: 'Forecasts', slug: 'forecasts', tier_required: 'pro' },
        { service: 'hr', name: 'Employees', slug: 'employees', tier_required: 'free' },
        { service: 'hr', name: 'Attendance', slug: 'attendance', tier_required: 'free' },
        { service: 'hr', name: 'Payroll', slug: 'payroll', tier_required: 'pro' },
        { service: 'hr', name: 'Recruitment', slug: 'recruitment', tier_required: 'pro' },
        { service: 'sales', name: 'Pipeline', slug: 'pipeline', tier_required: 'free' },
        { service: 'sales', name: 'Activities', slug: 'activities', tier_required: 'free' },
        { service: 'sales', name: 'Forecasts', slug: 'forecasts', tier_required: 'pro' },
        { service: 'sales', name: 'Teams', slug: 'teams', tier_required: 'pro' },
        { service: 'inventory', name: 'Products', slug: 'products', tier_required: 'free' },
        { service: 'inventory', name: 'Movements', slug: 'movements', tier_required: 'free' },
        { service: 'inventory', name: 'Warehouses', slug: 'warehouses', tier_required: 'pro' },
        { service: 'inventory', name: 'Reordering', slug: 'reordering', tier_required: 'pro' },
        { service: 'projects', name: 'Projects', slug: 'projects', tier_required: 'free' },
        { service: 'projects', name: 'Tasks', slug: 'tasks', tier_required: 'free' },
        { service: 'projects', name: 'Gantt', slug: 'gantt', tier_required: 'pro' },
        { service: 'projects', name: 'Time Tracking', slug: 'time-tracking', tier_required: 'pro' },
        { service: 'accounting', name: 'Journal', slug: 'journal', tier_required: 'free' },
        { service: 'accounting', name: 'Accounts', slug: 'accounts', tier_required: 'free' },
        { service: 'accounting', name: 'Tax Reports', slug: 'tax-reports', tier_required: 'pro' },
        { service: 'accounting', name: 'Bank Sync', slug: 'bank-sync', tier_required: 'pro' },
      ];

      for (const m of modules) {
        const serviceRes = await pool.query('SELECT id FROM service_catalog WHERE slug = $1', [m.service]);
        if (serviceRes.rows.length > 0) {
          await pool.query(
            `INSERT INTO service_modules (service_id, name, slug, tier_required, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [serviceRes.rows[0].id, m.name, m.slug, m.tier_required, modules.indexOf(m) + 1]
          );
        }
      }
      console.log('✅ Seeded 28 service modules');

      // Seed onboarding templates
      const onboarding = [
        // ═══════════════════════════════════════════════════════════
        // COMMON QUESTIONS (for all users, service_id = NULL concept)
        // We use the first service (crm) as the anchor for common questions
        // ═══════════════════════════════════════════════════════════
        { service: 'crm', key: 'org_name', text: 'What is your organization name?', type: 'text', required: true, order: 1 },
        { service: 'crm', key: 'industry', text: 'What industry are you in?', type: 'select', options: ['E-commerce', 'Education', 'Healthcare', 'IT/Technology', 'Finance', 'Manufacturing', 'Retail', 'Real Estate', 'Marketing', 'Other'], required: true, order: 2 },
        { service: 'crm', key: 'company_size', text: 'How large is your company?', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'], required: true, order: 3 },
        { service: 'crm', key: 'business_location', text: 'Where is your business located?', type: 'text', required: false, order: 4 },
        { service: 'crm', key: 'primary_goals', text: 'What are your primary goals?', type: 'select', options: ['Increase sales', 'Automation', 'Employee management', 'Better reporting', 'Customer support', 'All of the above'], required: true, order: 5 },
        { service: 'crm', key: 'current_challenges', text: 'What are your biggest challenges?', type: 'text', required: false, order: 6 },
        { service: 'crm', key: 'current_tools', text: 'What tools/software are you currently using?', type: 'text', required: false, order: 7 },
        { service: 'crm', key: 'team_size', text: 'How many team members will use this platform?', type: 'select', options: ['1-5', '6-20', '21-50', '50+'], required: true, order: 8 },
        { service: 'crm', key: 'user_role', text: 'What is your primary role?', type: 'select', options: ['Admin', 'Manager', 'Employee', 'Sales Agent', 'Owner/CEO'], required: true, order: 9 },
        { service: 'crm', key: 'need_role_based_access', text: 'Do you need role-based access control?', type: 'boolean', required: true, order: 10 },
        { service: 'crm', key: 'dashboard_preference', text: 'What type of dashboard do you prefer?', type: 'select', options: ['Simple (key metrics only)', 'Detailed (comprehensive view)', 'Analytics-heavy (charts & trends)'], required: true, order: 11 },
        { service: 'crm', key: 'enable_ai_assistant', text: 'Enable AI assistance for insights and recommendations?', type: 'boolean', required: true, order: 12 },

        // ═══════════════════════════════════════════════════════════
        // CRM-SPECIFIC QUESTIONS
        // ═══════════════════════════════════════════════════════════
        { service: 'crm', key: 'crm_has_customer_data', text: 'Do you already have customer/lead data to import?', type: 'boolean', required: false, order: 13 },
        { service: 'crm', key: 'crm_lead_management', text: 'How do you currently manage leads?', type: 'select', options: ['Excel/Spreadsheets', 'Manual/Paper', 'Another CRM', 'Not tracking yet'], required: true, order: 14 },
        { service: 'crm', key: 'crm_monthly_leads', text: 'Approximately how many leads do you get per month?', type: 'select', options: ['Under 50', '50-200', '200-1000', '1000+'], required: true, order: 15 },
        { service: 'crm', key: 'crm_sales_team_size', text: 'How large is your sales team?', type: 'select', options: ['Just me', '2-5', '6-20', '20+'], required: false, order: 16 },
        { service: 'crm', key: 'crm_need_pipeline', text: 'Do you need a visual sales pipeline?', type: 'boolean', required: true, order: 17 },
        { service: 'crm', key: 'crm_pipeline_stages', text: 'How many pipeline stages do you need?', type: 'select', options: ['1-3 (Simple)', '4-6 (Standard)', '7+ (Complex)'], required: false, order: 18 },
        { service: 'crm', key: 'crm_track_deals', text: 'Track deal progress and values?', type: 'boolean', required: true, order: 19 },
        { service: 'crm', key: 'crm_communication_channels', text: 'Which communication channels do you use?', type: 'select', options: ['Email', 'WhatsApp', 'Phone Calls', 'SMS', 'All of the above'], required: false, order: 20 },
        { service: 'crm', key: 'crm_need_communication_tracking', text: 'Need to track all communications with contacts?', type: 'boolean', required: true, order: 21 },
        { service: 'crm', key: 'crm_need_automation', text: 'Need automation (auto-followups, lead scoring)?', type: 'boolean', required: true, order: 22 },

        // ═══════════════════════════════════════════════════════════
        // HR-SPECIFIC QUESTIONS
        // ═══════════════════════════════════════════════════════════
        { service: 'hr', key: 'hr_employee_count', text: 'How many employees do you have?', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'], required: true, order: 1 },
        { service: 'hr', key: 'hr_multiple_departments', text: 'Do you manage multiple departments?', type: 'boolean', required: true, order: 2 },
        { service: 'hr', key: 'hr_track_attendance', text: 'Do you need to track attendance?', type: 'boolean', required: true, order: 3 },
        { service: 'hr', key: 'hr_attendance_type', text: 'What type of attendance tracking?', type: 'select', options: ['Manual', 'Biometric', 'Online/Self-service', 'Mobile App'], required: false, order: 4 },
        { service: 'hr', key: 'hr_need_payroll', text: 'Do you need a payroll system?', type: 'boolean', required: true, order: 5 },
        { service: 'hr', key: 'hr_salary_structure', text: 'What is your salary structure?', type: 'select', options: ['Fixed', 'Hourly', 'Mixed (Fixed + Hourly)', 'Commission-based'], required: false, order: 6 },
        { service: 'hr', key: 'hr_track_leaves', text: 'Do you need leave tracking?', type: 'boolean', required: true, order: 7 },
        { service: 'hr', key: 'hr_leave_approval_flow', text: 'Need a leave approval workflow?', type: 'boolean', required: true, order: 8 },
        { service: 'hr', key: 'hr_track_performance', text: 'Track employee performance reviews?', type: 'boolean', required: true, order: 9 },
        { service: 'hr', key: 'hr_need_recruitment', text: 'Need recruitment/job posting features?', type: 'boolean', required: false, order: 10 },

        // ═══════════════════════════════════════════════════════════
        // PROJECT MANAGEMENT QUESTIONS
        // ═══════════════════════════════════════════════════════════
        { service: 'projects', key: 'proj_active_projects', text: 'How many active projects do you typically run?', type: 'select', options: ['1-5', '6-20', '21-50', '50+'], required: true, order: 1 },
        { service: 'projects', key: 'proj_project_types', text: 'What types of projects?', type: 'select', options: ['Internal', 'Client-based', 'Both', 'Research/Experimental'], required: true, order: 2 },
        { service: 'projects', key: 'proj_need_task_tracking', text: 'Do you need task tracking?', type: 'boolean', required: true, order: 3 },
        { service: 'projects', key: 'proj_need_task_assignment', text: 'Need a task assignment system?', type: 'boolean', required: true, order: 4 },
        { service: 'projects', key: 'proj_need_collaboration', text: 'Need team collaboration tools?', type: 'boolean', required: true, order: 5 },
        { service: 'projects', key: 'proj_need_file_sharing', text: 'Need file/document sharing?', type: 'boolean', required: true, order: 6 },
        { service: 'projects', key: 'proj_track_deadlines', text: 'Track project deadlines?', type: 'boolean', required: true, order: 7 },
        { service: 'projects', key: 'proj_need_reminders', text: 'Need reminders and alerts?', type: 'boolean', required: true, order: 8 },
        { service: 'projects', key: 'proj_methodology', text: 'What methodology do you use?', type: 'select', options: ['Agile/Scrum', 'Waterfall', 'Kanban', 'Hybrid', 'No formal method'], required: false, order: 9 },
        { service: 'projects', key: 'proj_need_gantt', text: 'Need Gantt chart visualization?', type: 'boolean', required: false, order: 10 },
        { service: 'projects', key: 'proj_need_time_tracking', text: 'Need time tracking for tasks?', type: 'boolean', required: false, order: 11 },

        // ═══════════════════════════════════════════════════════════
        // FINANCE/ACCOUNTING QUESTIONS
        // ═══════════════════════════════════════════════════════════
        { service: 'accounting', key: 'acc_track_income_expenses', text: 'Do you need to track income and expenses?', type: 'boolean', required: true, order: 1 },
        { service: 'accounting', key: 'acc_monthly_transactions', text: 'Approximate monthly transactions?', type: 'select', options: ['Under 50', '50-500', '500-5000', '5000+'], required: true, order: 2 },
        { service: 'accounting', key: 'acc_generate_invoices', text: 'Do you generate invoices?', type: 'boolean', required: true, order: 3 },
        { service: 'accounting', key: 'acc_need_automated_invoicing', text: 'Need automated/recurring invoicing?', type: 'boolean', required: true, order: 4 },
        { service: 'accounting', key: 'acc_payment_methods', text: 'Which payment methods do you accept?', type: 'select', options: ['Cash', 'Bank Transfer', 'Online/Card', 'All of the above'], required: false, order: 5 },
        { service: 'accounting', key: 'acc_need_financial_reports', text: 'Need detailed financial reports?', type: 'boolean', required: true, order: 6 },
        { service: 'accounting', key: 'acc_need_tax_calculations', text: 'Need automated tax calculations?', type: 'boolean', required: true, order: 7 },
        { service: 'accounting', key: 'acc_multi_currency', text: 'Do you deal with multiple currencies?', type: 'boolean', required: false, order: 8 },
        { service: 'accounting', key: 'acc_tax_region', text: 'What is your primary tax region?', type: 'select', options: ['US', 'EU', 'UK', 'Asia', 'Other'], required: false, order: 9 },
        { service: 'accounting', key: 'acc_has_accountant', text: 'Do you have a dedicated accountant?', type: 'boolean', required: false, order: 10 },

        // ═══════════════════════════════════════════════════════════
        // INVENTORY QUESTIONS
        // ═══════════════════════════════════════════════════════════
        { service: 'inventory', key: 'inv_product_type', text: 'What do you sell/manage?', type: 'select', options: ['Physical products', 'Digital products', 'Both', 'Raw materials'], required: true, order: 1 },
        { service: 'inventory', key: 'inv_sku_count', text: 'How many products/SKUs?', type: 'select', options: ['1-100', '101-1000', '1001-10000', '10000+'], required: true, order: 2 },
        { service: 'inventory', key: 'inv_warehouse_count', text: 'How many storage locations/warehouses?', type: 'select', options: ['1', '2-5', '6-20', '20+'], required: false, order: 3 },
        { service: 'inventory', key: 'inv_need_barcode', text: 'Do you use barcode scanning?', type: 'boolean', required: false, order: 4 },
        { service: 'inventory', key: 'inv_need_auto_reorder', text: 'Need automatic reorder points?', type: 'boolean', required: false, order: 5 },
        { service: 'inventory', key: 'inv_track_stock_levels', text: 'Track real-time stock levels?', type: 'boolean', required: true, order: 6 },
        { service: 'inventory', key: 'inv_low_stock_alerts', text: 'Need low stock alerts?', type: 'boolean', required: true, order: 7 },

        // ═══════════════════════════════════════════════════════════
        // ERP QUESTIONS
        // ═══════════════════════════════════════════════════════════
        { service: 'erp', key: 'erp_industry', text: 'What industry are you in?', type: 'select', options: ['Manufacturing', 'Distribution', 'Retail', 'Construction', 'Technology', 'Other'], required: true, order: 1 },
        { service: 'erp', key: 'erp_company_size', text: 'Company size?', type: 'select', options: ['1-10', '11-50', '51-200', '201-1000', '1000+'], required: true, order: 2 },
        { service: 'erp', key: 'erp_modules_needed', text: 'Which ERP modules do you need?', type: 'select', options: ['Finance', 'Supply Chain', 'Manufacturing', 'HR', 'All modules'], required: true, order: 3 },
        { service: 'erp', key: 'erp_locations', text: 'How many business locations?', type: 'select', options: ['Single', '2-5', '6-20', '20+'], required: false, order: 4 },
        { service: 'erp', key: 'erp_need_integrations', text: 'Need third-party integrations?', type: 'boolean', required: false, order: 5 },
      ];

      for (const o of onboarding) {
        const serviceRes = await pool.query('SELECT id FROM service_catalog WHERE slug = $1', [o.service]);
        if (serviceRes.rows.length > 0) {
          await pool.query(
            `INSERT INTO onboarding_templates (service_id, question_key, question_text, question_type, options, is_required, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [serviceRes.rows[0].id, o.key, o.text, o.type, o.options ? JSON.stringify(o.options) : null, o.required, onboarding.indexOf(o) + 1]
          );
        }
      }
      console.log('✅ Seeded 16 onboarding questions');

      // Seed feature flags
      const flags = [
        { key: 'ai_chat', name: 'AI Chat', description: 'Access to AI chat assistant', free: true, pro: true, enterprise: true },
        { key: 'ai_query', name: 'AI Data Query', description: 'Natural language database queries', free: false, pro: true, enterprise: true },
        { key: 'ai_insights', name: 'AI Insights', description: 'Proactive AI-generated insights', free: false, pro: true, enterprise: true },
        { key: 'api_access', name: 'API Access', description: 'REST API access', free: false, pro: true, enterprise: true },
        { key: 'custom_reports', name: 'Custom Reports', description: 'Build and save custom reports', free: false, pro: true, enterprise: true },
        { key: 'sso', name: 'Single Sign-On', description: 'SSO / SAML authentication', free: false, pro: false, enterprise: true },
        { key: 'priority_support', name: 'Priority Support', description: '24/7 priority customer support', free: false, pro: false, enterprise: true },
      ];

      for (const f of flags) {
        await pool.query(
          `INSERT INTO feature_flags (flag_key, flag_name, description, enabled_for_free, enabled_for_pro, enabled_for_enterprise)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [f.key, f.name, f.description, f.free, f.pro, f.enterprise]
        );
      }
      console.log('✅ Seeded 7 feature flags');

      // Seed AI usage tiers
      await pool.query(`
        INSERT INTO ai_usage_tiers (tier, daily_limit, monthly_limit, models_allowed)
        VALUES
          ('free', 10, 200, ARRAY['llama3.2']),
          ('pro', 100, 2000, ARRAY['llama3.2', 'llama3.3']),
          ('enterprise', NULL, NULL, ARRAY['llama3.2', 'llama3.3', 'deepseek-r1'])
      `);
      console.log('✅ Seeded 3 AI usage tiers');

      // ─── Seed Super Admin ──────────────────────────────────────────────
      const { rows: existingAdmin } = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'super_admin'");
      if (parseInt(existingAdmin[0].count) === 0) {
        console.log('🌱 Seeding Super Admin account...');
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash('SuperAdmin123!', 12);

        await pool.query(
          `INSERT INTO users (name, email, company, role, status, password_hash, email_verified, last_login)
           VALUES ($1, $2, $3, $4, $5, $6, true, NOW())`,
          ['Super Admin', 'superadmin@masterapp.com', 'Master App', 'super_admin', 'active', hash]
        );
        console.log('✅ Super Admin created');
        console.log('   Email: superadmin@masterapp.com');
        console.log('   Password: SuperAdmin123!');
        console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY');
      } else {
        console.log('⏭️  Super Admin already exists, skipping');
      }
    }

    console.log('\n🎉 Authentication & multi-tenant setup complete!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error setting up auth tables:', err.message);
    console.error(err.stack);
    await pool.end();
    process.exit(1);
  }
}

setupAuthTables();
