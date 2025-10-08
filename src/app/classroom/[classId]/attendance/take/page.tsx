import { TakeAttendance } from '@/components/classroom/take-attendance'

interface TakeAttendancePageProps {
  params: Promise<{ classId: string }>
}

export default async function TakeAttendancePage({ params }: TakeAttendancePageProps) {
  const { classId } = await params

  return <TakeAttendance classId={classId} />
}
