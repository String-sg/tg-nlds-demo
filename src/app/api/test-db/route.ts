// Test API route to verify Supabase connection
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test query - count tables
    const tables = [
      'teachers',
      'classes',
      'students',
      'cases',
      'reports',
    ]

    const results = await Promise.all(
      tables.map(async (table) => {
        const { count, error } = await supabase
          .from(table as any)
          .select('*', { count: 'exact', head: true })

        return {
          table,
          count: count ?? 0,
          accessible: !error,
          error: error?.message,
        }
      })
    )

    const allAccessible = results.every((r) => r.accessible)

    return NextResponse.json({
      success: allAccessible,
      message: allAccessible
        ? '✅ Database connection successful!'
        : '⚠️ Some tables are not accessible',
      timestamp: new Date().toISOString(),
      results,
      totalTables: 19,
      testedTables: tables.length,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: '❌ Database connection failed',
        error: error.message,
      },
      { status: 500 }
    )
  }
}
