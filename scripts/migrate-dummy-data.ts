/**
 * Data Migration Script: Mock Data → Supabase
 *
 * This script migrates the existing mock data from src/lib/mock-data
 * to the Supabase database.
 *
 * Usage:
 *   1. Set up environment variables in .env.local
 *   2. Run: npx tsx scripts/migrate-dummy-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Import mock data
// import { mockClasses, currentUser } from '@/lib/mock-data/classroom-data'
// import { ericStudentRecords } from '@/lib/mock-data/eric-records'

// Initialize Supabase client with service role key (admin access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function migrateTeachers() {
  console.log('📝 Migrating teachers...')

  // TODO: Extract teachers from mock data
  const teachers = [
    {
      id: 'teacher-001',
      name: 'Daniel Tan',
      email: 'daniel.tan@school.edu.sg',
      department: 'Mathematics',
      avatar: 'DT',
    },
    // Add more teachers...
  ]

  const { data, error } = await supabase.from('teachers').upsert(teachers, {
    onConflict: 'id',
    ignoreDuplicates: false,
  })

  if (error) {
    console.error('❌ Error migrating teachers:', error)
  } else {
    console.log(`✅ Migrated ${teachers.length} teachers`)
  }
}

async function migrateClasses() {
  console.log('📝 Migrating classes...')

  // TODO: Extract classes from mock data
  const classes = [
    {
      id: 'class-5a',
      name: '5A',
      type: 'form' as const,
      year_level: '5',
      academic_year: '2025',
      subject_name: null,
    },
    // Add more classes...
  ]

  const { data, error } = await supabase.from('classes').upsert(classes, {
    onConflict: 'id',
  })

  if (error) {
    console.error('❌ Error migrating classes:', error)
  } else {
    console.log(`✅ Migrated ${classes.length} classes`)
  }
}

async function migrateTeacherClasses() {
  console.log('📝 Migrating teacher-class relationships...')

  // TODO: Extract teacher-class assignments from mock data
  const assignments = [
    {
      teacher_id: 'teacher-001',
      class_id: 'class-5a',
      role: 'form_teacher' as const,
    },
    // Add more assignments...
  ]

  const { data, error } = await supabase
    .from('teacher_classes')
    .upsert(assignments)

  if (error) {
    console.error('❌ Error migrating teacher-class assignments:', error)
  } else {
    console.log(`✅ Migrated ${assignments.length} teacher-class assignments`)
  }
}

async function migrateGuardians() {
  console.log('📝 Migrating guardians...')

  // TODO: Extract guardians from mock student data
  const guardians = [
    // {
    //   id: 'guardian-001',
    //   name: 'Dr. Lim Wei Ming',
    //   relationship: 'father',
    //   phone: '+65 9123 4567',
    //   email: 'lim.weiming@email.com',
    //   occupation: 'Doctor',
    // },
  ]

  if (guardians.length > 0) {
    const { data, error } = await supabase
      .from('parents_guardians')
      .upsert(guardians, {
        onConflict: 'id',
      })

    if (error) {
      console.error('❌ Error migrating guardians:', error)
    } else {
      console.log(`✅ Migrated ${guardians.length} guardians`)
    }
  } else {
    console.log('⚠️  No guardians to migrate (add guardian data first)')
  }
}

async function migrateStudents() {
  console.log('📝 Migrating students...')

  // TODO: Extract students from mock data
  const students = [
    // {
    //   id: 'student-031',
    //   student_id: 'S12345',
    //   name: 'Eric Lim',
    //   form_teacher_id: 'teacher-001',
    //   primary_guardian_id: 'guardian-001',
    //   academic_year: '2025',
    //   year_level: '5',
    // },
  ]

  if (students.length > 0) {
    const { data, error } = await supabase.from('students').upsert(students, {
      onConflict: 'id',
    })

    if (error) {
      console.error('❌ Error migrating students:', error)
    } else {
      console.log(`✅ Migrated ${students.length} students`)
    }
  } else {
    console.log('⚠️  No students to migrate (add student data first)')
  }
}

async function migrateStudentClasses() {
  console.log('📝 Migrating student-class enrollments...')

  // TODO: Extract student enrollments from mock data
  const enrollments = [
    // {
    //   student_id: 'student-031',
    //   class_id: 'class-5a',
    //   status: 'active' as const,
    // },
  ]

  if (enrollments.length > 0) {
    const { data, error } = await supabase
      .from('student_classes')
      .upsert(enrollments)

    if (error) {
      console.error('❌ Error migrating student enrollments:', error)
    } else {
      console.log(`✅ Migrated ${enrollments.length} student enrollments`)
    }
  } else {
    console.log('⚠️  No enrollments to migrate')
  }
}

async function migrateStudentData() {
  console.log('📝 Migrating student overview data...')

  // TODO: Extract student overview/background data
  // This includes: overview, private notes, attendance, etc.

  console.log('⚠️  Student data migration not yet implemented')
  console.log(
    '   Add logic to extract from eric-records.ts and other mock files'
  )
}

// =====================================================
// MAIN MIGRATION RUNNER
// =====================================================

async function runMigration() {
  console.log('🚀 Starting data migration...\n')

  try {
    // Run migrations in order (respecting foreign key constraints)
    await migrateTeachers()
    await migrateClasses()
    await migrateTeacherClasses()
    await migrateGuardians()
    await migrateStudents()
    await migrateStudentClasses()
    await migrateStudentData()

    console.log('\n✅ Migration completed successfully!')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  runMigration()
}

export { runMigration }
