#!/usr/bin/env node
/**
 * Migration Verification
 * Verifies that migrations were applied successfully
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read connection string from .env
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const postgresUrlMatch = envContent.match(/POSTGRES_URL_NON_POOLING="([^"]+)"/);

if (!postgresUrlMatch) {
  console.error('❌ Could not find POSTGRES_URL_NON_POOLING in .env');
  process.exit(1);
}

const connectionString = postgresUrlMatch[1];

async function verifyMigrations() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined
    }
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Check 1: Verify conduct_grade column is removed
    console.log('📋 Check 1: Verifying conduct_grade column removed...');
    const columnCheck = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'student_overview'
        AND column_name = 'conduct_grade';
    `);

    if (columnCheck.rows.length === 0) {
      console.log('✅ PASS: conduct_grade column successfully removed from student_overview\n');
    } else {
      console.log('❌ FAIL: conduct_grade column still exists in student_overview\n');
    }

    // Check 2: Verify reports tables are removed
    console.log('📋 Check 2: Verifying reports tables removed...');
    const tablesCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name IN ('reports', 'report_comments')
        AND table_schema = 'public';
    `);

    if (tablesCheck.rows.length === 0) {
      console.log('✅ PASS: reports and report_comments tables successfully removed\n');
    } else {
      console.log('❌ FAIL: Some report tables still exist:');
      tablesCheck.rows.forEach(row => console.log(`   - ${row.table_name}`));
      console.log();
    }

    // Check 3: Show remaining student_overview columns
    console.log('📋 Check 3: Current student_overview schema...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'student_overview'
      ORDER BY ordinal_position;
    `);

    console.log('Current columns in student_overview:');
    schemaCheck.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    console.log();

    console.log('✨ Verification complete!\n');

  } catch (error) {
    console.error('❌ Error during verification:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifyMigrations();
