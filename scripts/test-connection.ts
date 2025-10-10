/**
 * Test Supabase connection and query a table
 */

import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

// Load environment variables
config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('🧪 Testing Supabase connection...\n')
console.log(`📡 URL: ${supabaseUrl}`)
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
console.log('')

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  // Test 1: Check teachers table
  console.log('1️⃣  Testing teachers table...')
  const { data: teachers, error: teachersError } = await supabase
    .from('teachers')
    .select('count')
    .limit(1)

  if (teachersError) {
    console.log(`   ❌ Error: ${teachersError.message}\n`)
  } else {
    console.log(`   ✅ Connected! Teachers table accessible\n`)
  }

  // Test 2: Check students table
  console.log('2️⃣  Testing students table...')
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('count')
    .limit(1)

  if (studentsError) {
    console.log(`   ❌ Error: ${studentsError.message}\n`)
  } else {
    console.log(`   ✅ Students table accessible\n`)
  }

  // Test 3: Check cases table
  console.log('3️⃣  Testing cases table...')
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('count')
    .limit(1)

  if (casesError) {
    console.log(`   ❌ Error: ${casesError.message}\n`)
  } else {
    console.log(`   ✅ Cases table accessible\n`)
  }

  // Test 4: Check reports table
  console.log('4️⃣  Testing reports table...')
  const { data: reports, error: reportsError } = await supabase
    .from('reports')
    .select('count')
    .limit(1)

  if (reportsError) {
    console.log(`   ❌ Error: ${reportsError.message}\n`)
  } else {
    console.log(`   ✅ Reports table accessible\n`)
  }

  // Test 5: List all tables
  console.log('5️⃣  Listing all accessible tables...')
  const tables = [
    'teachers', 'classes', 'teacher_classes',
    'parents_guardians', 'students', 'student_guardians', 'student_classes',
    'student_overview', 'student_private_notes', 'attendance',
    'academic_results', 'physical_fitness', 'cce_results',
    'friend_relationships', 'behaviour_observations',
    'cases', 'case_issues', 'reports', 'report_comments'
  ]

  let accessible = 0
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count').limit(1)
    if (!error) accessible++
  }

  console.log(`   ✅ ${accessible}/${tables.length} tables accessible via Supabase client\n`)

  if (accessible === tables.length) {
    console.log('🎉 All tests passed! Supabase is ready to use.')
    console.log('\n📝 Next steps:')
    console.log('   1. Your database is set up with all 19 tables')
    console.log('   2. Verify in Supabase dashboard: https://supabase.com/dashboard/project/uzrzyapgxseqqisapmzb/editor')
    console.log('   3. Check that Vercel environment variables are set')
    console.log('   4. Deploy to Vercel: git push')
  } else {
    console.log(`⚠️  Only ${accessible} tables are accessible. Some RLS policies may need adjustment.`)
  }
}

testConnection()
