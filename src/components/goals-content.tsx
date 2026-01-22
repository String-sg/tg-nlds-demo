'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Calendar, Award, BookOpen, Target } from 'lucide-react'

export function GoalsContent() {
  const dummyLearningRecords = [
    {
      id: 1,
      title: 'Differentiated Instruction Strategies',
      type: 'Course',
      provider: 'MOE Academy',
      completionDate: '2024-12-15',
      status: 'completed' as const,
      certificateUrl: '#',
      duration: '20 hours',
      category: 'Teaching Strategies'
    },
    {
      id: 2,
      title: 'AI in Education: Assessment Tools',
      type: 'Microlearning',
      provider: 'EdTech Institute',
      completionDate: '2024-11-28',
      status: 'completed' as const,
      certificateUrl: '#',
      duration: '3 hours',
      category: 'Technology'
    },
    {
      id: 3,
      title: 'Outdoor Education Leadership',
      type: 'Workshop',
      provider: 'Singapore Sports Council',
      completionDate: '2024-10-22',
      status: 'completed' as const,
      certificateUrl: '#',
      duration: '12 hours',
      category: 'Leadership'
    },
    {
      id: 4,
      title: 'Economics Education Pedagogy',
      type: 'Course',
      provider: 'NIE Singapore',
      completionDate: '2024-09-14',
      status: 'completed' as const,
      certificateUrl: '#',
      duration: '25 hours',
      category: 'Subject Mastery'
    },
    {
      id: 5,
      title: 'Adaptive Learning Analytics',
      type: 'Microlearning',
      provider: 'Learning Sciences Lab',
      completionDate: null,
      status: 'in-progress' as const,
      certificateUrl: null,
      duration: '8 hours',
      category: 'Technology'
    },
    {
      id: 6,
      title: 'Questioning Techniques Workshop',
      type: 'Workshop',
      provider: 'Academy of Singapore Teachers',
      completionDate: null,
      status: 'in-progress' as const,
      certificateUrl: null,
      duration: '6 hours',
      category: 'Teaching Strategies'
    }
  ]

  const developmentPlan = "To improve on questioning techniques and differentiated instruction in the practice of Economics education. To improve planning and reflection design for outdoor education as CCA teacher. To leverage AI in adaptive assessment and metrics collection to gauge learning progress and shareback my prototype with my department by T3"

  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-3">
          <Target className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goal / Journey</h1>
            <p className="text-muted-foreground">Track your professional development progress and goals</p>
          </div>
        </div>

        {/* e-EPMS Callout */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">My goals / development plan</h3>
                  <p className="text-sm text-blue-700">(last retrieved from e-EPMS)</p>
                </div>
              </div>
              <a
                href="https://docs.google.com/document/d/1W15ZEdASgF6MyMB61RLceJ098GF97t6GCUvn6zFTJ-c/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
              >
                View in e-EPMS →
              </a>
            </div>
            <p className="text-sm leading-relaxed text-blue-800">
              {developmentPlan}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0">
        {/* Learning Records */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Records
                <Badge variant="secondary" className="ml-auto">
                  {dummyLearningRecords.filter(record => record.status === 'completed').length} completed
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dummyLearningRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-medium">{record.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {record.type}
                          </Badge>
                          <span>•</span>
                          <span>{record.provider}</span>
                          <span>•</span>
                          <span>{record.duration}</span>
                        </div>
                      </div>
                      <Badge
                        variant={record.status === 'completed' ? "default" : "secondary"}
                        className="shrink-0"
                      >
                        {record.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={record.status === 'completed' ? 'default' : 'outline'}>
                        {record.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                    </div>

                    {record.completionDate && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Completed: {new Date(record.completionDate).toLocaleDateString()}</span>
                        </div>
                        {record.certificateUrl && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Award className="h-4 w-4" />
                            <span className="cursor-pointer hover:underline">Certificate</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}