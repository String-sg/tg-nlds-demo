import { ClassOverview } from '@/components/classroom/class-overview'

interface ClassPageProps {
  params: Promise<{ classId: string }>
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { classId } = await params

  return <ClassOverview classId={classId} />
}
