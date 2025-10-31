#!/usr/bin/env node

const { readFileSync } = require('fs');
require('dotenv').config();

const MIGRATION_FILES = [
  'supabase/migrations/20251031000001_remove_conduct_grade.sql',
  'supabase/migrations/20251031000002_remove_reports_system.sql',
];

async function runMigrations() {
  console.log('🗄️  Running Database Migrations');
  console.log('================================\n');

  const connectionString = process.env.POSTGRES_URL_NON_POOLING;
  if (!connectionString) {
    console.error('❌ Error: POSTGRES_URL_NON_POOLING not set in .env');
    process.exit(1);
  }

  console.log('📍 Connecting to Supabase database...\n');

  let postgres;
  try {
    postgres = require('postgres');
  } catch (err) {
    console.error('❌ Error: postgres package not installed');
    console.error('   Run: npm install postgres');
    process.exit(1);
  }

  const sql = postgres(connectionString, { ssl: 'require' });

  try {
    const result = await sql\`SELECT version()\`;
    console.log('✅ Connected to database successfully\n');

    for (const migrationFile of MIGRATION_FILES) {
      console.log(\`📄 Running migration: \${migrationFile}\`);

      try {
        const migrationSQL = readFileSync(migrationFile, 'utf8');
        await sql.unsafe(migrationSQL);
        console.log(\`✅ Migration applied successfully\n\`);
      } catch (error) {
        console.error(\`❌ Migration failed: \${migrationFile}\`);
        console.error(\`   Error: \${error.message}\n\`);

        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.log('⚠️  Column may have already been removed. Continuing...\n');
          continue;
        }

        if (error.message.includes('table') && error.message.includes('does not exist')) {
          console.log('⚠️  Table may have already been removed. Continuing...\n');
          continue;
        }

        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');

    console.log('\n📊 Verifying changes...\n');

    const conductCheck = await sql\`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'student_overview' AND column_name = 'conduct_grade'
    \`;

    if (conductCheck.length === 0) {
      console.log('✅ conduct_grade column removed from student_overview');
    } else {
      console.log('⚠️  conduct_grade column still exists');
    }

    const reportsCheck = await sql\`
      SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('reports', 'report_comments') AND table_schema = 'public'
    \`;

    if (reportsCheck.length === 0) {
      console.log('✅ reports and report_comments tables removed');
    } else {
      console.log(\`⚠️  Found \${reportsCheck.length} report table(s) still existing\`);
    }

    console.log('\n✅ Migration verification complete!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
