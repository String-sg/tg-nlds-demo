'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  PlayCircle,
  CheckCircle,
  Download,
  ChevronRight,
  Users,
} from 'lucide-react'
import {
  getEnrolledCourses,
  getInProgressCourses,
  getCompletedCourses,
  getAvailableCourses,
  getUserCertificates,
  getTotalLearningHours,
} from '@/lib/mock-data/learning-data'
import type { Course, Certificate } from '@/types/learning'
import { cn } from '@/lib/utils'

interface LearningContentProps {
  defaultTab?: string
}

export function LearningContent({ defaultTab = 'my-courses' }: LearningContentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)

  const enrolledCourses = getEnrolledCourses()
  const inProgressCourses = getInProgressCourses()
  const completedCourses = getCompletedCourses()
  const availableCourses = getAvailableCourses()
  const certificates = getUserCertificates()
  const totalHours = getTotalLearningHours()

  return (
    <ScrollArea className="h-full w-full">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Professional Development</h1>
            <p className="mt-1 text-sm text-stone-600">
              Enhance your teaching practice with expert-led courses
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <div className="text-2xl font-semibold text-stone-900">{enrolledCourses.length}</div>
              <div className="text-xs text-stone-500">Enrolled</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-stone-900">{completedCourses.length}</div>
              <div className="text-xs text-stone-500">Completed</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-stone-900">{totalHours}</div>
              <div className="text-xs text-stone-500">Hours</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="my-courses" className="gap-2">
              <BookOpen className="size-4" />
              My Courses
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <GraduationCap className="size-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2">
              <Award className="size-4" />
              Certificates
            </TabsTrigger>
          </TabsList>

          {/* My Courses Tab */}
          <TabsContent value="my-courses" className="space-y-8">
            {/* In Progress Section */}
            {inProgressCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-stone-900">Continue Learning</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {inProgressCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelect={setSelectedCourse}
                      showProgress
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedCourses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-stone-900">Completed Courses</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {completedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onSelect={setSelectedCourse}
                      showProgress
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {enrolledCourses.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="mb-4 size-12 text-stone-400" />
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">No Courses Yet</h3>
                  <p className="mb-4 text-center text-sm text-stone-600">
                    Browse available courses to start your professional development journey
                  </p>
                  <Button onClick={() => setActiveTab('browse')}>
                    Browse Courses
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course) => (
                <CourseCard key={course.id} course={course} onSelect={setSelectedCourse} />
              ))}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="space-y-6">
            {certificates.length > 0 ? (
              <>
                <div className="rounded-lg bg-stone-50 border border-stone-200 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-full bg-stone-900">
                      <Award className="size-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-stone-900">Your Achievements</h2>
                      <p className="text-sm text-stone-600">
                        {certificates.length} certificate{certificates.length !== 1 ? 's' : ''} earned
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {certificates.map((cert) => (
                    <CertificateCard key={cert.id} certificate={cert} />
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Award className="mb-4 size-12 text-stone-400" />
                  <h3 className="mb-2 text-lg font-semibold text-stone-900">No Certificates Yet</h3>
                  <p className="mb-4 text-center text-sm text-stone-600">
                    Complete courses to earn professional development certificates
                  </p>
                  <Button onClick={() => setActiveTab('my-courses')}>
                    View My Courses
                    <ChevronRight className="ml-2 size-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  )
}

// Course Card Component
interface CourseCardProps {
  course: Course
  onSelect: (course: Course) => void
  showProgress?: boolean
}

function CourseCard({ course, onSelect, showProgress = false }: CourseCardProps) {
  const categoryColors: Record<string, string> = {
    pedagogy: 'bg-blue-50 text-blue-700 border-blue-200',
    'subject-knowledge': 'bg-green-50 text-green-700 border-green-200',
    assessment: 'bg-purple-50 text-purple-700 border-purple-200',
    technology: 'bg-orange-50 text-orange-700 border-orange-200',
    'classroom-management': 'bg-pink-50 text-pink-700 border-pink-200',
    'special-education': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }

  return (
    <Card className="group cursor-pointer transition-shadow hover:shadow-md border-stone-200">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={cn('text-xs font-medium', categoryColors[course.category])}
          >
            {course.category.replace('-', ' ')}
          </Badge>
          {course.completed && <CheckCircle className="size-5 text-green-600 shrink-0" />}
        </div>
        <CardTitle className="line-clamp-2 text-base leading-tight group-hover:text-blue-600">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-xs leading-relaxed">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            <span className="truncate">{course.instructor}</span>
          </div>
        </div>

        {showProgress && course.enrolledDate && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-500">Progress</span>
              <span className="font-semibold text-stone-900">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-2" />
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <Button
          variant={course.enrolledDate ? 'default' : 'outline'}
          className="w-full"
          size="sm"
          onClick={() => onSelect(course)}
        >
          {course.completed ? (
            <>
              <Award className="mr-2 size-4" />
              View Certificate
            </>
          ) : course.enrolledDate ? (
            <>
              <PlayCircle className="mr-2 size-4" />
              Continue
            </>
          ) : (
            <>
              <BookOpen className="mr-2 size-4" />
              Enroll Now
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Certificate Card Component
interface CertificateCardProps {
  certificate: Certificate
}

function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <Card className="border-stone-200">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex size-12 items-center justify-center rounded-full bg-stone-900">
            <Award className="size-6 text-white" />
          </div>
          <Badge variant="outline" className="text-xs">
            {new Date(certificate.issuedDate).toLocaleDateString('en-GB', {
              month: 'short',
              year: 'numeric',
            })}
          </Badge>
        </div>
        <CardTitle className="text-base leading-tight">{certificate.courseName}</CardTitle>
        <CardDescription className="text-xs">
          Credential ID: {certificate.credentialId}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" className="w-full">
          <Download className="mr-2 size-4" />
          Download Certificate
        </Button>
      </CardContent>
    </Card>
  )
}
