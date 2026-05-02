const pool = require('./db');

async function reseedOnboardingQuestions() {
  try {
    console.log('🔄 Reseeding onboarding questions...');

    // Clear existing questions
    await pool.query('DELETE FROM onboarding_templates');
    console.log('✅ Cleared existing onboarding questions');

    const onboarding = [
      // COMMON QUESTIONS
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

      // CRM-SPECIFIC
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

      // HR-SPECIFIC
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

      // PROJECT MANAGEMENT
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

      // ACCOUNTING
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

      // INVENTORY
      { service: 'inventory', key: 'inv_product_type', text: 'What do you sell/manage?', type: 'select', options: ['Physical products', 'Digital products', 'Both', 'Raw materials'], required: true, order: 1 },
      { service: 'inventory', key: 'inv_sku_count', text: 'How many products/SKUs?', type: 'select', options: ['1-100', '101-1000', '1001-10000', '10000+'], required: true, order: 2 },
      { service: 'inventory', key: 'inv_warehouse_count', text: 'How many storage locations/warehouses?', type: 'select', options: ['1', '2-5', '6-20', '20+'], required: false, order: 3 },
      { service: 'inventory', key: 'inv_need_barcode', text: 'Do you use barcode scanning?', type: 'boolean', required: false, order: 4 },
      { service: 'inventory', key: 'inv_need_auto_reorder', text: 'Need automatic reorder points?', type: 'boolean', required: false, order: 5 },
      { service: 'inventory', key: 'inv_track_stock_levels', text: 'Track real-time stock levels?', type: 'boolean', required: true, order: 6 },
      { service: 'inventory', key: 'inv_low_stock_alerts', text: 'Need low stock alerts?', type: 'boolean', required: true, order: 7 },

      // ERP
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
          [
            serviceRes.rows[0].id,
            o.key,
            o.text,
            o.type,
            o.options ? JSON.stringify(o.options) : null,
            o.required,
            o.order,
          ]
        );
      }
    }

    console.log(`✅ Seeded ${onboarding.length} onboarding questions`);
    console.log('\n🎉 Onboarding questions reseed complete!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error reseeding onboarding questions:', err.message);
    console.error(err.stack);
    await pool.end();
    process.exit(1);
  }
}

reseedOnboardingQuestions();
