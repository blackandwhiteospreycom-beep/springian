const pool = require('./db');

async function seedOnboardingQuestions() {
  try {
    console.log('🔧 Seeding onboarding questions...');

    // Check if questions already exist
    const { rows: existing } = await pool.query('SELECT COUNT(*) as count FROM onboarding_templates');
    if (parseInt(existing[0].count) > 0) {
      console.log('⏭️  Onboarding questions already exist, skipping...');
      await pool.end();
      return;
    }

    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_catalog (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(20),
        icon VARCHAR(50),
        category VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS onboarding_templates (
        id SERIAL PRIMARY KEY,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        question_key VARCHAR(200) NOT NULL,
        question_text TEXT NOT NULL,
        question_type VARCHAR(50) NOT NULL,
        options JSONB,
        is_required BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS onboarding_responses (
        id SERIAL PRIMARY KEY,
        org_id INT REFERENCES organizations(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        service_id INT REFERENCES service_catalog(id) ON DELETE CASCADE,
        question_key VARCHAR(200) NOT NULL,
        answer TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed service catalog if empty
    const { rows: svcCount } = await pool.query('SELECT COUNT(*) as count FROM service_catalog');
    if (parseInt(svcCount[0].count) === 0) {
      const services = [
        { name: 'CRM', slug: 'crm', description: 'Customer Relationship Management', color: '#296374', icon: 'AiOutlineTeam', category: 'sales' },
        { name: 'ERP', slug: 'erp', description: 'Enterprise Resource Planning', color: '#714B67', icon: 'AiOutlineAppstore', category: 'operations' },
        { name: 'HR Management', slug: 'hr', description: 'Human Resources & Payroll', color: '#25A8E1', icon: 'AiOutlineUser', category: 'hr' },
        { name: 'Project Management', slug: 'projects', description: 'Tasks & Collaboration', color: '#00AEEF', icon: 'AiOutlineLayout', category: 'productivity' },
        { name: 'Accounting', slug: 'accounting', description: 'Financial Management', color: '#16A34A', icon: 'AiOutlineDollar', category: 'finance' },
        { name: 'Inventory', slug: 'inventory', description: 'Stock & Warehouse', color: '#DC2626', icon: 'AiOutlineShop', category: 'operations' },
      ];
      for (const s of services) {
        await pool.query(
          `INSERT INTO service_catalog (name, slug, description, color, icon, category) VALUES ($1, $2, $3, $4, $5, $6)`,
          [s.name, s.slug, s.description, s.color, s.icon, s.category]
        );
      }
      console.log('✅ Service catalog seeded');
    }

    // Seed onboarding questions
    const questions = [
      // ─── CRM Questions ───
      { slug: 'crm', key: 'business_type', text: 'What type of business are you?', type: 'select', options: ['Retail', 'B2B Services', 'SaaS', 'Manufacturing', 'Healthcare', 'Education', 'Real Estate', 'Other'], required: true, order: 1 },
      { slug: 'crm', key: 'company_size', text: 'How many employees?', type: 'select', options: ['1-10', '11-50', '51-200', '201-1000', '1000+'], required: true, order: 2 },
      { slug: 'crm', key: 'sales_volume', text: 'Approximate monthly deals?', type: 'select', options: ['1-10', '11-50', '51-200', '200+'], required: true, order: 3 },
      { slug: 'crm', key: 'crm_goals', text: 'What do you need CRM for?', type: 'select', options: ['Lead tracking', 'Sales pipeline', 'Customer support', 'All of the above'], required: true, order: 4 },
      { slug: 'crm', key: 'team_size', text: 'How many people will use CRM?', type: 'select', options: ['Just me', '2-5', '6-20', '20+'], required: false, order: 5 },
      { slug: 'crm', key: 'existing_data', text: 'Do you have existing customer data to import?', type: 'boolean', required: false, order: 6 },

      // ─── ERP Questions ───
      { slug: 'erp', key: 'business_type', text: 'What industry are you in?', type: 'select', options: ['Manufacturing', 'Distribution', 'Retail', 'Construction', 'Technology', 'Other'], required: true, order: 1 },
      { slug: 'erp', key: 'company_size', text: 'Company size?', type: 'select', options: ['1-10', '11-50', '51-200', '201-1000', '1000+'], required: true, order: 2 },
      { slug: 'erp', key: 'erp_modules', text: 'Which modules do you need?', type: 'select', options: ['Finance', 'Supply Chain', 'Manufacturing', 'All modules'], required: true, order: 3 },
      { slug: 'erp', key: 'locations', text: 'How many locations?', type: 'select', options: ['Single', '2-5', '6-20', '20+'], required: false, order: 4 },
      { slug: 'erp', key: 'integration', text: 'Do you need third-party integrations?', type: 'boolean', required: false, order: 5 },

      // ─── HR Questions ───
      { slug: 'hr', key: 'business_type', text: 'What type of organization?', type: 'select', options: ['Startup', 'SMB', 'Enterprise', 'Non-profit', 'Government'], required: true, order: 1 },
      { slug: 'hr', key: 'company_size', text: 'How many employees?', type: 'select', options: ['1-10', '11-50', '51-200', '201-1000', '1000+'], required: true, order: 2 },
      { slug: 'hr', key: 'hr_needs', text: 'What HR features do you need?', type: 'select', options: ['Payroll only', 'Recruitment + Payroll', 'Full HR suite', 'Time tracking'], required: true, order: 3 },
      { slug: 'hr', key: 'payroll_freq', text: 'How often do you run payroll?', type: 'select', options: ['Weekly', 'Bi-weekly', 'Monthly'], required: false, order: 4 },
      { slug: 'hr', key: 'remote_team', text: 'Do you have remote employees?', type: 'boolean', required: false, order: 5 },

      // ─── Project Management Questions ───
      { slug: 'projects', key: 'business_type', text: 'What kind of projects?', type: 'select', options: ['Software development', 'Marketing campaigns', 'Construction', 'Consulting', 'Research', 'Other'], required: true, order: 1 },
      { slug: 'projects', key: 'company_size', text: 'Team size?', type: 'select', options: ['1-5', '6-20', '21-50', '50+'], required: true, order: 2 },
      { slug: 'projects', key: 'methodology', text: 'What methodology do you use?', type: 'select', options: ['Agile/Scrum', 'Waterfall', 'Kanban', 'Hybrid', 'No formal method'], required: true, order: 3 },
      { slug: 'projects', key: 'client_facing', text: 'Do clients need access to project boards?', type: 'boolean', required: false, order: 4 },
      { slug: 'projects', key: 'time_tracking', text: 'Do you need time tracking?', type: 'boolean', required: false, order: 5 },

      // ─── Accounting Questions ───
      { slug: 'accounting', key: 'business_type', text: 'What type of business?', type: 'select', options: ['Freelancer', 'Retail', 'Service-based', 'E-commerce', 'Manufacturing', 'Other'], required: true, order: 1 },
      { slug: 'accounting', key: 'company_size', text: 'Company size?', type: 'select', options: ['Just me', '2-10', '11-50', '50+'], required: true, order: 2 },
      { slug: 'accounting', key: 'accounting_needs', text: 'What do you need?', type: 'select', options: ['Invoicing only', 'Full accounting', 'Tax management', 'All features'], required: true, order: 3 },
      { slug: 'accounting', key: 'multi_currency', text: 'Do you deal with multiple currencies?', type: 'boolean', required: false, order: 4 },
      { slug: 'accounting', key: 'tax_region', text: 'What is your tax region?', type: 'select', options: ['US', 'EU', 'UK', 'Asia', 'Other'], required: false, order: 5 },

      // ─── Inventory Questions ───
      { slug: 'inventory', key: 'business_type', text: 'What do you sell?', type: 'select', options: ['Physical products', 'Digital products', 'Both', 'Raw materials'], required: true, order: 1 },
      { slug: 'inventory', key: 'company_size', text: 'How many SKUs?', type: 'select', options: ['1-100', '101-1000', '1001-10000', '10000+'], required: true, order: 2 },
      { slug: 'inventory', key: 'warehouses', text: 'How many storage locations?', type: 'select', options: ['1', '2-5', '6-20', '20+'], required: false, order: 3 },
      { slug: 'inventory', key: 'barcode', text: 'Do you use barcode scanning?', type: 'boolean', required: false, order: 4 },
      { slug: 'inventory', key: 'auto_reorder', text: 'Do you need automatic reorder points?', type: 'boolean', required: false, order: 5 },
    ];

    for (const q of questions) {
      const serviceRes = await pool.query('SELECT id FROM service_catalog WHERE slug = $1', [q.slug]);
      if (serviceRes.rows.length > 0) {
        await pool.query(
          `INSERT INTO onboarding_templates (service_id, question_key, question_text, question_type, options, is_required, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            serviceRes.rows[0].id,
            q.key,
            q.text,
            q.type,
            q.options ? JSON.stringify(q.options) : null,
            q.required,
            q.order,
          ]
        );
      }
    }

    console.log(`✅ Seeded ${questions.length} onboarding questions`);
    console.log('\n🎉 Onboarding questions setup complete!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error seeding onboarding questions:', err.message);
    await pool.end();
    process.exit(1);
  }
}

seedOnboardingQuestions();
