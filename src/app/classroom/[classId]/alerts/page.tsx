import { ClassAlerts } from '@/components/classroom/class-alerts'

interface ClassAlertsPageProps {
  params: Promise<{ classId: string }>
}

export default async function ClassAlertsPage({ params }: ClassAlertsPageProps) {
  const { classId } = await params

  return <ClassAlerts classId={classId} />
}
