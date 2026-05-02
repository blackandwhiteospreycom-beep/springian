/**
 * Contact Management Module — Database Schema
 * Run: node setup-contacts.js
 *
 * Creates: accounts, contacts, contact_tags, contact_custom_fields,
 *          contact_relationships, contact_activities
 */

const pool = require('./db');

async function setupContacts() {
  try {
    console.log('🔧 Setting up Contact Management tables...');

    // ─── Accounts (companies/organizations) ───
    await pool.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id INTEGER REFERENCES organizations(id),
        name VARCHAR(255) NOT NULL,
        industry VARCHAR(100),
        website VARCHAR(255),
        phone VARCHAR(50),
        billing_address TEXT,
        shipping_address TEXT,
        annual_revenue DECIMAL(15,2),
        employee_count INTEGER,
        owner_id INTEGER REFERENCES users(id),
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ accounts table created');

    // ─── Contacts (people) ───
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id INTEGER REFERENCES organizations(id),
        account_id UUID REFERENCES accounts(id),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        mobile VARCHAR(50),
        title VARCHAR(150),
        department VARCHAR(100),
        linkedin VARCHAR(255),
        twitter VARCHAR(255),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        owner_id INTEGER REFERENCES users(id),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'active',
        avatar_url TEXT,
        custom_fields JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        last_activity_at TIMESTAMPTZ
      );
    `);
    console.log('✅ contacts table created');

    // ─── Contact Tags ───
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_tags (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id INTEGER REFERENCES organizations(id),
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        tag VARCHAR(100) NOT NULL
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_tags_contact ON contact_tags(contact_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_tags_tag ON contact_tags(tag);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contact_tags_org ON contact_tags(org_id);`);
    console.log('✅ contact_tags table + indexes created');

    // ─── Contact Custom Fields Definition (per org) ───
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_custom_fields (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id INTEGER REFERENCES organizations(id),
        field_key VARCHAR(100) NOT NULL,
        field_label VARCHAR(200) NOT NULL,
        field_type VARCHAR(50) DEFAULT 'text',
        options JSONB,
        is_required BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        UNIQUE(org_id, field_key)
      );
    `);
    console.log('✅ contact_custom_fields table created');

    // ─── Contact Relationships (link contacts to each other) ───
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_relationships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id INTEGER REFERENCES organizations(id),
        from_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        to_contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        relationship_type VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(from_contact_id, to_contact_id, relationship_type)
      );
    `);
    console.log('✅ contact_relationships table created');

    // ─── Activity Timeline ───
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id INTEGER REFERENCES organizations(id),
        contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
        activity_type VARCHAR(100),
        subject VARCHAR(255),
        description TEXT,
        performed_by INTEGER REFERENCES users(id),
        performed_at TIMESTAMPTZ DEFAULT NOW(),
        metadata JSONB DEFAULT '{}'
      );
    `);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activities_contact ON contact_activities(contact_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_activities_org ON contact_activities(org_id);`);
    console.log('✅ contact_activities table + indexes created');

    // ─── Search indexes ───
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_org ON contacts(org_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_accounts_org ON accounts(org_id);`);
    console.log('✅ search indexes created');

    console.log('\n🎉 Contact Management schema setup complete!');
  } catch (err) {
    console.error('❌ Error setting up contact management:', err.message);
  } finally {
    pool.end();
  }
}

setupContacts();
