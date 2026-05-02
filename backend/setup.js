const pool = require('./db');

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database tables...');

    // Services table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(20),
        status VARCHAR(20) DEFAULT 'active',
        customers INTEGER DEFAULT 0,
        revenue VARCHAR(20),
        uptime VARCHAR(10),
        last_update VARCHAR(50),
        features TEXT[],
        pricing VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Services table created');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        company VARCHAR(150),
        role VARCHAR(50) DEFAULT 'User',
        service VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        joined DATE DEFAULT CURRENT_DATE,
        last_active VARCHAR(50),
        avatar VARCHAR(300),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    // Analytics metrics table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_metrics (
        id SERIAL PRIMARY KEY,
        metric_key VARCHAR(100) UNIQUE NOT NULL,
        metric_value VARCHAR(50),
        metric_change VARCHAR(20),
        is_positive BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Analytics metrics table created');

    // Revenue data table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS revenue_data (
        id SERIAL PRIMARY KEY,
        month VARCHAR(10) NOT NULL,
        revenue INTEGER,
        users_count INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Revenue data table created');

    // User activity table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id SERIAL PRIMARY KEY,
        day VARCHAR(10) NOT NULL,
        active_users INTEGER,
        new_signups INTEGER,
        churned INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ User activity table created');

    // Service performance table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_performance (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        color VARCHAR(20),
        revenue VARCHAR(20),
        customers INTEGER,
        growth VARCHAR(20),
        satisfaction VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Service performance table created');

    // Top features table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS top_features (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        usage INTEGER,
        trend VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Top features table created');

    // Settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        category VARCHAR(50),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Settings table created');

    // Check if data already seeded
    const { rows } = await pool.query('SELECT COUNT(*) FROM services');
    if (parseInt(rows[0].count) > 0) {
      console.log('⏭️  Data already seeded, skipping...');
      await pool.end();
      return;
    }

    console.log('🌱 Seeding data...');

    // Seed services
    const services = [
      { name: 'CRM', description: 'Customer Relationship Management', color: '#296374', status: 'active', customers: 1250, revenue: '$18,500', uptime: '99.9%', last_update: '2 hours ago', features: ['Lead Management', 'Sales Pipeline', 'Contact Management', 'Email Integration', 'Reports'], pricing: '$14.99/user/mo' },
      { name: 'ERP', description: 'Enterprise Resource Planning', color: '#714B67', status: 'active', customers: 890, revenue: '$15,200', uptime: '99.8%', last_update: '5 hours ago', features: ['Finance', 'Procurement', 'Manufacturing', 'Supply Chain', 'Analytics'], pricing: '$19.99/user/mo' },
      { name: 'HR Management', description: 'Human Resources & Payroll', color: '#25A8E1', status: 'active', customers: 654, revenue: '$11,580', uptime: '99.7%', last_update: '1 day ago', features: ['Recruitment', 'Payroll', 'Attendance', 'Performance', 'Training'], pricing: '$12.99/user/mo' },
      { name: 'Project Management', description: 'Tasks, Projects & Collaboration', color: '#00AEEF', status: 'active', customers: 523, revenue: '$9,840', uptime: '99.9%', last_update: '3 hours ago', features: ['Task Tracking', 'Gantt Charts', 'Time Tracking', 'Team Collaboration', 'Reports'], pricing: '$11.99/user/mo' },
      { name: 'Accounting', description: 'Financial Management & Invoicing', color: '#16A34A', status: 'active', customers: 445, revenue: '$8,920', uptime: '99.8%', last_update: '6 hours ago', features: ['Invoicing', 'Expenses', 'Bank Reconciliation', 'Tax Management', 'Financial Reports'], pricing: '$15.99/user/mo' },
      { name: 'Inventory', description: 'Stock & Warehouse Management', color: '#DC2626', status: 'active', customers: 378, revenue: '$7,560', uptime: '99.7%', last_update: '1 day ago', features: ['Stock Tracking', 'Warehouse Management', 'Barcode Scanning', 'Reordering', 'Reports'], pricing: '$13.99/user/mo' },
      { name: 'E-Commerce', description: 'Online Store & Sales', color: '#9333EA', status: 'beta', customers: 215, revenue: '$4,300', uptime: '99.5%', last_update: '12 hours ago', features: ['Online Store', 'Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management'], pricing: '$24.99/user/mo' },
      { name: 'Help Desk', description: 'Customer Support & Ticketing', color: '#EA580C', status: 'active', customers: 312, revenue: '$6,240', uptime: '99.8%', last_update: '4 hours ago', features: ['Ticketing System', 'Live Chat', 'Knowledge Base', 'SLA Management', 'Reports'], pricing: '$10.99/user/mo' },
    ];

    for (const s of services) {
      await pool.query(
        `INSERT INTO services (name, description, color, status, customers, revenue, uptime, last_update, features, pricing)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [s.name, s.description, s.color, s.status, s.customers, s.revenue, s.uptime, s.last_update, s.features, s.pricing]
      );
    }
    console.log('✅ Seeded services');

    // Seed users
    const users = [
      { name: 'John Doe', email: 'john.doe@acme.com', company: 'Acme Corporation', role: 'Admin', service: 'Odoo', status: 'active', joined: '2024-01-15', last_active: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=1' },
      { name: 'Sarah Smith', email: 'sarah@techstart.com', company: 'TechStart Inc', role: 'Manager', service: 'Bitrix24', status: 'active', joined: '2024-02-20', last_active: '5 min ago', avatar: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Mike Johnson', email: 'mike@globalsolutions.com', company: 'Global Solutions', role: 'User', service: 'Zoho', status: 'active', joined: '2024-03-10', last_active: '1 day ago', avatar: 'https://i.pravatar.cc/150?img=8' },
      { name: 'Emily Brown', email: 'emily@innovationlabs.com', company: 'Innovation Labs', role: 'User', service: 'Odoo', status: 'inactive', joined: '2024-01-25', last_active: '2 weeks ago', avatar: 'https://i.pravatar.cc/150?img=9' },
      { name: 'David Wilson', email: 'david@digitaldynamics.com', company: 'Digital Dynamics', role: 'Manager', service: 'Bitrix24', status: 'active', joined: '2024-04-05', last_active: '3 hours ago', avatar: 'https://i.pravatar.cc/150?img=12' },
      { name: 'Lisa Anderson', email: 'lisa@cloudtech.com', company: 'CloudTech', role: 'Admin', service: 'Zoho', status: 'active', joined: '2024-02-14', last_active: '30 min ago', avatar: 'https://i.pravatar.cc/150?img=10' },
      { name: 'Robert Taylor', email: 'robert@startup.io', company: 'Startup IO', role: 'User', service: 'Odoo', status: 'active', joined: '2024-03-22', last_active: '1 hour ago', avatar: 'https://i.pravatar.cc/150?img=13' },
      { name: 'Jennifer Martinez', email: 'jennifer@enterprise.com', company: 'Enterprise Co', role: 'Manager', service: 'Bitrix24', status: 'suspended', joined: '2024-01-08', last_active: '1 month ago', avatar: 'https://i.pravatar.cc/150?img=15' },
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (name, email, company, role, service, status, joined, last_active, avatar)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [u.name, u.email, u.company, u.role, u.service, u.status, u.joined, u.last_active, u.avatar]
      );
    }
    console.log('✅ Seeded users');

    // Seed analytics metrics
    const metrics = [
      { key: 'total_revenue', value: '$542,847', change: '+12.5%', positive: true },
      { key: 'active_users', value: '14,230', change: '+8.2%', positive: true },
      { key: 'new_signups', value: '1,847', change: '+18.4%', positive: true },
      { key: 'churn_rate', value: '2.3%', change: '-0.5%', positive: true },
    ];

    for (const m of metrics) {
      await pool.query(
        `INSERT INTO analytics_metrics (metric_key, metric_value, metric_change, is_positive) VALUES ($1, $2, $3, $4)`,
        [m.key, m.value, m.change, m.positive]
      );
    }
    console.log('✅ Seeded analytics metrics');

    // Seed revenue data
    const revenueData = [
      { month: 'Jan', revenue: 38000, users_count: 1200 },
      { month: 'Feb', revenue: 42000, users_count: 1350 },
      { month: 'Mar', revenue: 45000, users_count: 1450 },
      { month: 'Apr', revenue: 48000, users_count: 1580 },
      { month: 'May', revenue: 52000, users_count: 1720 },
      { month: 'Jun', revenue: 55000, users_count: 1850 },
      { month: 'Jul', revenue: 58000, users_count: 1950 },
      { month: 'Aug', revenue: 62000, users_count: 2100 },
      { month: 'Sep', revenue: 54280, users_count: 2794 },
    ];

    for (const r of revenueData) {
      await pool.query(
        `INSERT INTO revenue_data (month, revenue, users_count) VALUES ($1, $2, $3)`,
        [r.month, r.revenue, r.users_count]
      );
    }
    console.log('✅ Seeded revenue data');

    // Seed user activity
    const activityData = [
      { day: 'Mon', active_users: 4500, new_signups: 120, churned: 15 },
      { day: 'Tue', active_users: 4800, new_signups: 150, churned: 20 },
      { day: 'Wed', active_users: 5200, new_signups: 180, churned: 25 },
      { day: 'Thu', active_users: 5100, new_signups: 140, churned: 18 },
      { day: 'Fri', active_users: 5500, new_signups: 200, churned: 22 },
      { day: 'Sat', active_users: 4200, new_signups: 90, churned: 12 },
      { day: 'Sun', active_users: 3800, new_signups: 75, churned: 10 },
    ];

    for (const a of activityData) {
      await pool.query(
        `INSERT INTO user_activity (day, active_users, new_signups, churned) VALUES ($1, $2, $3, $4)`,
        [a.day, a.active_users, a.new_signups, a.churned]
      );
    }
    console.log('✅ Seeded user activity');

    // Seed service performance
    const servicePerf = [
      { name: 'CRM', description: 'Customer Relationship Management', color: '#296374', revenue: '$245,800', customers: 5240, growth: '+15.2%', satisfaction: '94%' },
      { name: 'ERP', description: 'Enterprise Resource Planning', color: '#714B67', revenue: '$189,500', customers: 4120, growth: '+12.8%', satisfaction: '92%' },
      { name: 'HR Management', description: 'Human Resources & Payroll', color: '#25A8E1', revenue: '$107,547', customers: 2890, growth: '+8.5%', satisfaction: '89%' },
      { name: 'Project Management', description: 'Tasks & Collaboration', color: '#00AEEF', revenue: '$85,200', customers: 2150, growth: '+10.2%', satisfaction: '91%' },
    ];

    for (const sp of servicePerf) {
      await pool.query(
        `INSERT INTO service_performance (name, description, color, revenue, customers, growth, satisfaction) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sp.name, sp.description, sp.color, sp.revenue, sp.customers, sp.growth, sp.satisfaction]
      );
    }
    console.log('✅ Seeded service performance');

    // Seed top features
    const features = [
      { name: 'CRM Module', usage: 89, trend: '+5%' },
      { name: 'Project Management', usage: 76, trend: '+12%' },
      { name: 'Accounting', usage: 68, trend: '+3%' },
      { name: 'HR Management', usage: 54, trend: '+8%' },
      { name: 'Inventory', usage: 45, trend: '-2%' },
    ];

    for (const f of features) {
      await pool.query(
        `INSERT INTO top_features (name, usage, trend) VALUES ($1, $2, $3)`,
        [f.name, f.usage, f.trend]
      );
    }
    console.log('✅ Seeded top features');

    // Seed settings
    const settings = [
      { key: 'company_name', value: 'Master App', category: 'general' },
      { key: 'language', value: 'English', category: 'general' },
      { key: 'timezone', value: 'UTC+5', category: 'general' },
      { key: 'date_format', value: 'MM/DD/YYYY', category: 'general' },
      { key: 'site_name', value: 'Master App', category: 'profile' },
      { key: 'admin_email', value: 'admin@masterapp.com', category: 'profile' },
      { key: 'two_factor', value: 'true', category: 'security' },
      { key: 'session_timeout', value: '30', category: 'security' },
      { key: 'email_notifications', value: 'true', category: 'notifications' },
      { key: 'push_notifications', value: 'false', category: 'notifications' },
      { key: 'billing_plan', value: 'Pro', category: 'billing' },
      { key: 'billing_email', value: 'billing@masterapp.com', category: 'billing' },
    ];

    for (const s of settings) {
      await pool.query(
        `INSERT INTO settings (setting_key, setting_value, category) VALUES ($1, $2, $3)`,
        [s.key, s.value, s.category]
      );
    }
    console.log('✅ Seeded settings');

    console.log('\n🎉 Database setup complete! All tables created and data seeded.');
    await pool.end();
  } catch (err) {
    console.error('❌ Error setting up database:', err.message);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
