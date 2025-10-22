#!/usr/bin/env node
/**
 * Migration Executor
 * Executes pending SQL migrations on Supabase database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read connection string from .env.local
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const postgresUrlMatch = envContent.match(/POSTGRES_URL_NON_POOLING="([^"]+)"/);

if (!postgresUrlMatch) {
  console.error('❌ Could not find POSTGRES_URL_NON_POOLING in .env.local');
  process.exit(1);
}

const connectionString = postgresUrlMatch[1];

async function runMigrations() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined
    }
  });

  try {
    console.log('🔗 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Read the migration SQL file
    const sqlFile = path.join(__dirname, 'execute_migrations.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📝 Executing migrations...\n');
    console.log('=' .repeat(60));

    // Execute the migration
    const result = await client.query(sql);

    console.log('=' .repeat(60));
    console.log('\n✅ Migrations executed successfully!');

    // Show verification results if available
    if (result.rows && result.rows.length > 0) {
      console.log('\n📊 Verification Results:');
      console.log(JSON.stringify(result.rows, null, 2));
    }

    // Run verification query
    console.log('\n🔍 Running verification check...\n');
    const verifyResult = await client.query(`
      SELECT
        s.student_id,
        s.name,
        so.conduct_grade,
        COUNT(DISTINCT ar.id) as academic_results_count,
        COUNT(DISTINCT a.id) as attendance_count,
        ROUND(
          (COUNT(CASE WHEN a.status = 'present' THEN 1 END)::numeric /
           NULLIF(COUNT(a.id), 0)) * 100,
          1
        ) as attendance_rate
      FROM students s
      LEFT JOIN student_overview so ON s.id = so.student_id
      LEFT JOIN academic_results ar ON s.id = ar.student_id
      LEFT JOIN attendance a ON s.id = a.student_id
      WHERE s.student_id BETWEEN 'S050101' AND 'S050112'
      GROUP BY s.student_id, s.name, so.conduct_grade
      ORDER BY s.student_id;
    `);

    if (verifyResult.rows.length > 0) {
      console.log('\n📋 Student Data Summary:');
      console.log('=' .repeat(100));
      console.log('Student ID | Name              | Conduct | Academic | Attendance | Attendance %');
      console.log('=' .repeat(100));

      verifyResult.rows.forEach(row => {
        const studentId = row.student_id.padEnd(10);
        const name = row.name.padEnd(17);
        const conduct = (row.conduct_grade || 'N/A').padEnd(7);
        const academic = String(row.academic_results_count || 0).padStart(8);
        const attendance = String(row.attendance_count || 0).padStart(10);
        const rate = row.attendance_rate ? `${row.attendance_rate}%`.padStart(12) : 'N/A'.padStart(12);

        console.log(`${studentId} | ${name} | ${conduct} | ${academic} | ${attendance} | ${rate}`);
      });
      console.log('=' .repeat(100));

      // Highlight Ryan Tan
      const ryanTan = verifyResult.rows.find(r => r.student_id === 'S050112');
      if (ryanTan) {
        console.log('\n🎯 Ryan Tan (S050112) Status:');
        console.log(`   Academic Results: ${ryanTan.academic_results_count || 0} records`);
        console.log(`   Attendance: ${ryanTan.attendance_count || 0} records (${ryanTan.attendance_rate || 0}% present)`);
        console.log(`   Conduct Grade: ${ryanTan.conduct_grade || 'N/A'}`);

        if (ryanTan.academic_results_count >= 4 && ryanTan.attendance_count > 0) {
          console.log('\n   ✅ Ryan Tan data is complete!');
        } else {
          console.log('\n   ⚠️  Ryan Tan may have missing data');
        }
      }
    }

    console.log('\n✨ Migration execution complete!\n');

  } catch (error) {
    console.error('\n❌ Error executing migrations:');
    console.error(error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed.\n');
  }
}

// Run the migrations
runMigrations();
