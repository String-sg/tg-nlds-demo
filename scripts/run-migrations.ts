/**
 * Run Supabase migrations directly via PostgreSQL
 * This script reads all migration files and executes them in order
 */

import { config } from 'dotenv'
import { Client } from 'pg'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

const connectionString = process.env.POSTGRES_URL_NON_POOLING!

if (!connectionString) {
  console.error('❌ Missing POSTGRES_URL_NON_POOLING environment variable!')
  process.exit(1)
}

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n')
  console.log('📡 Connecting to database...')

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    await client.connect()
    console.log('✅ Connected successfully\n')

    const migrationsDir = join(process.cwd(), 'supabase', 'migrations')
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`Found ${files.length} migration files:\n`)
    files.forEach((file, i) => console.log(`  ${i + 1}. ${file}`))
    console.log('')

    for (const file of files) {
      const filePath = join(migrationsDir, file)
      const sql = readFileSync(filePath, 'utf-8')

      console.log(`📝 Running: ${file}`)

      try {
        await client.query(sql)
        console.log(`  ✅ Success\n`)
      } catch (err: any) {
        console.error(`  ❌ Error: ${err.message}\n`)

        // Don't exit on "already exists" errors
        if (!err.message?.includes('already exists') && !err.message?.includes('duplicate')) {
          console.error('Migration failed. Stopping...')
          await client.end()
          process.exit(1)
        } else {
          console.log(`  ⚠️  Object already exists, continuing...\n`)
        }
      }
    }

    console.log('✅ All migrations completed successfully!\n')
    console.log('📊 Verifying tables...')

    // Verify tables exist
    const tables = [
      'teachers', 'classes', 'teacher_classes',
      'parents_guardians', 'students', 'student_guardians', 'student_classes',
      'student_overview', 'student_private_notes', 'attendance',
      'academic_results', 'physical_fitness', 'cce_results',
      'friend_relationships', 'behaviour_observations',
      'cases', 'case_issues', 'reports', 'report_comments'
    ]

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    const existingTables = result.rows.map(row => row.table_name)
    const foundTables = tables.filter(t => existingTables.includes(t))

    console.log(`\n✅ Verified ${foundTables.length}/${tables.length} tables exist`)

    if (foundTables.length === tables.length) {
      console.log('\n🎉 Database setup complete! All 19 tables are ready.')
      console.log('\nCreated tables:')
      foundTables.forEach(t => console.log(`  ✓ ${t}`))
    } else {
      console.log(`\n⚠️  Some tables may not have been created.`)
      const missing = tables.filter(t => !existingTables.includes(t))
      if (missing.length > 0) {
        console.log('\nMissing tables:')
        missing.forEach(t => console.log(`  ✗ ${t}`))
      }
    }

    await client.end()
  } catch (err: any) {
    console.error('\n❌ Fatal error:', err.message)
    await client.end()
    process.exit(1)
  }
}

runMigrations()
