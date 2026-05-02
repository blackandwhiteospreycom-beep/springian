/**
 * Phase 0 — Infrastructure Database Schema
 * Run: node setup-infrastructure.js
 *
 * Creates:
 *   - org_service_modules  (SuperAdmin toggle: which modules are enabled per org)
 *   - module_permissions   (CRUD permissions per role per module)
 *   - audit_logs           (Who changed what, when, and from which IP)
 *   - global_search_index  (Cross-module search index for unified search)
 *   - event_subscriptions   (Module-to-module event hooks)
 */

const pool = require('./db');

async function setupInfrastructure() {
  try {
    console.log('🔧 Setting up Infrastructure tables...');

    // ─── 1. Module Registration (SuperAdmin Toggle) ───
    await pool.query('DROP TABLE IF EXISTS org_service_modules CASCADE');
    await pool.query(`
      CREATE TABLE org_service_modules (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        service_id INTEGER REFERENCES service_catalog(id),
        module_key VARCHAR(100) NOT NULL,
        is_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(org_id, service_id, module_key)
      );
    `);
    await pool.query(`CREATE INDEX idx_org_modules_org ON org_service_modules(org_id);`);
    await pool.query(`CREATE INDEX idx_org_modules_key ON org_service_modules(module_key);`);
    console.log('✅ org_service_modules table + indexes created');

    // ─── 2. Module Permissions Matrix ───
    await pool.query('DROP TABLE IF EXISTS module_permissions CASCADE');
    await pool.query(`
      CREATE TABLE module_permissions (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        module_key VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        can_read BOOLEAN DEFAULT true,
        can_create BOOLEAN DEFAULT false,
        can_update BOOLEAN DEFAULT false,
        can_delete BOOLEAN DEFAULT false,
        can_export BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(org_id, module_key, role)
      );
    `);
    await pool.query(`CREATE INDEX idx_module_perms_org ON module_permissions(org_id);`);
    await pool.query(`CREATE INDEX idx_module_perms_module ON module_permissions(module_key);`);
    console.log('✅ module_permissions table + indexes created');

    // ─── 3. Audit Log ───
    await pool.query('DROP TABLE IF EXISTS audit_logs CASCADE');
    await pool.query(`
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id),
        user_id INTEGER REFERENCES users(id),
        module_key VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100),
        entity_id VARCHAR(100),
        changes JSONB,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX idx_audit_org ON audit_logs(org_id);`);
    await pool.query(`CREATE INDEX idx_audit_module ON audit_logs(module_key);`);
    await pool.query(`CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);`);
    await pool.query(`CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);`);
    console.log('✅ audit_logs table + indexes created');

    // ─── 4. Global Search Index ───
    await pool.query('DROP TABLE IF EXISTS global_search_index CASCADE');
    await pool.query(`
      CREATE TABLE global_search_index (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        module_key VARCHAR(100) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id VARCHAR(100) NOT NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        searchable_text TSVECTOR,
        tags TEXT[],
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(module_key, entity_type, entity_id)
      );
    `);
    await pool.query(`CREATE INDEX idx_search_org ON global_search_index(org_id);`);
    await pool.query(`CREATE INDEX idx_search_module ON global_search_index(module_key);`);
    await pool.query(`CREATE INDEX idx_search_text ON global_search_index USING GIN(searchable_text);`);
    await pool.query(`CREATE INDEX idx_search_tags ON global_search_index USING GIN(tags);`);
    console.log('✅ global_search_index table + indexes created');

    // ─── 5. Event Subscriptions ───
    await pool.query('DROP TABLE IF EXISTS event_subscriptions CASCADE');
    await pool.query(`
      CREATE TABLE event_subscriptions (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        module_key VARCHAR(100) NOT NULL,
        event_name VARCHAR(100) NOT NULL,
        handler_url VARCHAR(500),
        handler_type VARCHAR(50) DEFAULT 'webhook',
        is_active BOOLEAN DEFAULT true,
        config JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX idx_events_module ON event_subscriptions(module_key);`);
    await pool.query(`CREATE INDEX idx_events_name ON event_subscriptions(event_name);`);
    console.log('✅ event_subscriptions table + indexes created');

    // ─── 6. Module Usage Analytics ───
    await pool.query('DROP TABLE IF EXISTS module_usage CASCADE');
    await pool.query(`
      CREATE TABLE module_usage (
        id SERIAL PRIMARY KEY,
        org_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        module_key VARCHAR(100) NOT NULL,
        action VARCHAR(50),
        user_id INTEGER REFERENCES users(id),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`CREATE INDEX idx_usage_org ON module_usage(org_id);`);
    await pool.query(`CREATE INDEX idx_usage_module ON module_usage(module_key);`);
    console.log('✅ module_usage table + indexes created');

    // ─── 7. Seed default permissions ───
    console.log('📦 Seeding default module permissions...');
    await pool.query(`
      INSERT INTO module_permissions (org_id, module_key, role, can_read, can_create, can_update, can_delete, can_export)
      SELECT o.id, 'contact_management', r.role, r.can_read, r.can_create, r.can_update, r.can_delete, r.can_export
      FROM organizations o
      CROSS JOIN (VALUES
        ('super_admin', true, true, true, true, true),
        ('org_admin', true, true, true, true, true),
        ('manager', true, true, true, false, false),
        ('user', true, false, false, false, false)
      ) AS r(role, can_read, can_create, can_update, can_delete, can_export)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Default permissions seeded for all orgs');
  } catch (err) {
    console.error('❌ Error setting up infrastructure:', err.message);
  } finally {
    pool.end();
  }
}

setupInfrastructure();
