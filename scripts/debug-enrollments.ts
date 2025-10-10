import { config } from 'dotenv'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

config({ path: join(process.cwd(), '.env.local') })

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugEnrollments() {
  console.log('\n🔍 Debugging Student Enrollments\n')

  // Get all classes
  const { data: classes } = await supabase.from('classes').select('*')
  console.log('Classes:', classes?.map(c => ({ id: c.id.slice(0, 8), name: c.name, type: c.type })))

  // Get all student_classes enrollments
  const { data: enrollments } = await supabase.from('student_classes').select('*')
  console.log('\nEnrollments:', enrollments?.length)
  console.log('Sample enrollments:', enrollments?.slice(0, 3).map(e => ({
    student_id: e.student_id.slice(0, 8),
    class_id: e.class_id.slice(0, 8),
    status: e.status
  })))

  // Try the exact query from useStudents hook
  const class5A = classes?.find(c => c.name === '5A' && c.type === 'form')
  if (class5A) {
    console.log('\n📚 Class 5A ID:', class5A.id)

    const { data: students, error } = await supabase
      .from('student_classes')
      .select(`
        student:students(
          *,
          primary_guardian:parents_guardians!primary_guardian_id(*),
          form_teacher:teachers!form_teacher_id(*)
        ),
        class:classes(*)
      `)
      .eq('class_id', class5A.id)
      .eq('status', 'active')

    console.log('\n✅ Query result:', {
      count: students?.length,
      error: error?.message
    })

    if (students && students.length > 0) {
      console.log('First student:', students[0].student?.name)
    }
  }
}

debugEnrollments()
