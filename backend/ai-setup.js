const pool = require('./db');

async function setupAITables() {
  try {
    console.log('🔧 Setting up AI tables...');

    // Try to enable pgvector extension (may not be installed)
    let hasPgvector = false;
    try {
      await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
      console.log('✅ pgvector extension enabled');
      hasPgvector = true;
    } catch (e) {
      console.log('⚠️  pgvector not available — skipping vector tables (core AI still works fine)');
    }

    // AI Sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_sessions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200),
        context JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT true
      );
    `);
    console.log('✅ ai_sessions table created');

    // AI Conversations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id SERIAL PRIMARY KEY,
        session_id INT REFERENCES ai_sessions(id) ON DELETE CASCADE,
        role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ ai_conversations table created');

    // AI Memory table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_memory (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        memory_type VARCHAR(50) CHECK (memory_type IN ('preference', 'fact', 'pattern', 'insight')),
        key VARCHAR(200),
        value TEXT,
        confidence FLOAT DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
        usage_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ ai_memory table created');

    // AI Rate Limits table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_rate_limits (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        date DATE DEFAULT CURRENT_DATE,
        requests_count INT DEFAULT 0,
        tokens_used INT DEFAULT 0,
        cost_usd DECIMAL(10, 4) DEFAULT 0,
        UNIQUE(user_id, date)
      );
    `);
    console.log('✅ ai_rate_limits table created');

    // AI Usage Log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_usage_log (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        feature VARCHAR(100),
        prompt TEXT,
        response TEXT,
        tokens_in INT,
        tokens_out INT,
        model VARCHAR(50),
        latency_ms INT,
        cost_usd DECIMAL(10, 4),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ ai_usage_log table created');

    // AI Prompts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_prompts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        category VARCHAR(50),
        system_prompt TEXT,
        user_prompt_template TEXT,
        model VARCHAR(50),
        max_tokens INT,
        temperature FLOAT DEFAULT 0.3,
        output_schema JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ ai_prompts table created');

    // AI Agents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        description TEXT,
        capabilities TEXT[],
        system_prompt TEXT,
        tools JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ ai_agents table created');

    // AI Query Vectors table (pgvector) — only if extension available
    if (hasPgvector) {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS ai_query_vectors (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE SET NULL,
          query_text TEXT,
          embedding vector(1536),
          result_summary TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      console.log('✅ ai_query_vectors table created');

      // Index for vector similarity search
      await pool.query(`
        CREATE INDEX IF NOT EXISTS ai_query_vectors_embedding_idx
        ON ai_query_vectors
        USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);
      `);
      console.log('✅ Vector index created');
    } else {
      console.log('⏭️  Skipped ai_query_vectors (pgvector not installed)');
    }

    // Seed AI prompt templates
    const { rows: existingPrompts } = await pool.query("SELECT COUNT(*) FROM ai_prompts");
    if (parseInt(existingPrompts[0].count) === 0) {
      console.log('🌱 Seeding AI prompt templates...');

      await pool.query(`
        INSERT INTO ai_prompts (name, category, system_prompt, user_prompt_template, model, max_tokens, temperature)
        VALUES 
        (
          'general_chat',
          'general',
          'You are a helpful AI assistant for the Master App SaaS platform. You have access to the user''s account data and can provide insights about their services, users, and analytics. Always be concise, accurate, and helpful. If you don''t know something, say so honestly.',
          '{{userInput}}',
          'gpt-4o-mini',
          2000,
          0.3
        ),
        (
          'data_query',
          'analytics',
          'You are a data analyst AI for the Master App SaaS platform. The user will ask questions about their data in natural language. Analyze the available data and provide clear, actionable insights. If you reference numbers or metrics, always be precise. The available tables are: services, users, analytics_metrics, revenue_data, user_activity, service_performance, top_features.',
          'Question: {{userInput}}

Available data context: {{context}}

Provide a structured answer with the key findings.',
          'gpt-4o-mini',
          2000,
          0.2
        ),
        (
          'insight_generator',
          'analytics',
          'You are a proactive business intelligence AI. Analyze the provided data and surface the most important insights, trends, and potential areas of concern. Lead with the most impactful finding. Use specific numbers and percentages.',
          'Here is the current business data: {{context}}

What are the key insights and recommendations?',
          'gpt-4o-mini',
          1500,
          0.3
        );
      `);
      console.log('✅ AI prompt templates seeded');
    } else {
      console.log('⏭️  AI prompt templates already exist, skipping seed');
    }

    console.log('\n🎉 AI database setup complete!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error setting up AI tables:', err.message);
    await pool.end();
    process.exit(1);
  }
}

setupAITables();
