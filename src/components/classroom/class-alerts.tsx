'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeftIcon, AlertCircleIcon, CheckCircle2Icon, XIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getClassById, getAlertsByClassId } from '@/lib/mock-data/classroom-data'
import { cn } from '@/lib/utils'
import type { AlertSeverity, AlertType } from '@/types/classroom'

interface ClassAlertsProps {
  classId: string
}

export function ClassAlerts({ classId }: ClassAlertsProps) {
  const classData = getClassById(classId)
  const allAlerts = getAlertsByClassId(classId)

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  if (!classData) {
    return <div>Class not found</div>
  }

  const activeAlerts = allAlerts.filter((alert) => !dismissedAlerts.includes(alert.alert_id))

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts((prev) => [...prev, alertId])
  }

  const handleAction = (actionUrl: string) => {
    // In production, this would navigate or perform the action
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Low':
        return 'bg-stone-100 text-stone-800 border-stone-300'
    }
  }

  const getSeverityIcon = (severity: AlertSeverity) => {
    const iconClass = severity === 'Urgent' || severity === 'High' ? 'h-5 w-5' : 'h-4 w-4'
    const colorClass = severity === 'Urgent' ? 'text-red-600' :
                      severity === 'High' ? 'text-amber-600' :
                      severity === 'Medium' ? 'text-blue-600' : 'text-stone-600'

    return <AlertCircleIcon className={cn(iconClass, colorClass)} />
  }

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'Academic':
        return '📚'
      case 'Attendance':
        return '📋'
      case 'Behavioral':
        return '⚠️'
      case 'Wellbeing':
        return '💙'
      case 'Administrative':
        return '📄'
    }
  }

  const alertsByType = {
    all: activeAlerts,
    urgent: activeAlerts.filter((a) => a.severity === 'Urgent'),
    academic: activeAlerts.filter((a) => a.type === 'Academic'),
    attendance: activeAlerts.filter((a) => a.type === 'Attendance'),
    behavioral: activeAlerts.filter((a) => a.type === 'Behavioral'),
    wellbeing: activeAlerts.filter((a) => a.type === 'Wellbeing'),
    administrative: activeAlerts.filter((a) => a.type === 'Administrative'),
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/classroom/${classId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Class Overview
          </Button>
        </Link>
      </div>

      {/* Title & Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Class Alerts</h1>
          <p className="text-sm text-stone-600 mt-1">
            Class {classData.class_name} · {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Alert Stats */}
        <div className="flex items-center gap-2">
          {alertsByType.urgent.length > 0 && (
            <Badge variant="destructive" className="h-7">
              {alertsByType.urgent.length} Urgent
            </Badge>
          )}
          {alertsByType.all.length > alertsByType.urgent.length && (
            <Badge variant="secondary" className="h-7 bg-amber-100 text-amber-800 border-amber-300">
              {alertsByType.all.length - alertsByType.urgent.length} Other
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">
            All ({alertsByType.all.length})
          </TabsTrigger>
          <TabsTrigger value="urgent">
            Urgent ({alertsByType.urgent.length})
          </TabsTrigger>
          <TabsTrigger value="academic">
            📚 ({alertsByType.academic.length})
          </TabsTrigger>
          <TabsTrigger value="attendance">
            📋 ({alertsByType.attendance.length})
          </TabsTrigger>
          <TabsTrigger value="behavioral">
            ⚠️ ({alertsByType.behavioral.length})
          </TabsTrigger>
          <TabsTrigger value="wellbeing">
            💙 ({alertsByType.wellbeing.length})
          </TabsTrigger>
          <TabsTrigger value="administrative">
            📄 ({alertsByType.administrative.length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(alertsByType).map(([key, alerts]) => (
          <TabsContent key={key} value={key} className="space-y-4">
            {alerts.length === 0 ? (
              <Card className="border-stone-200">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2Icon className="h-12 w-12 text-green-600 mb-3" />
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-sm text-stone-600 text-center max-w-sm">
                    No {key === 'all' ? '' : key} alerts at the moment. Great job staying on top of things!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card
                    key={alert.alert_id}
                    className={cn(
                      "border-l-4 transition-all hover:shadow-md",
                      alert.severity === 'Urgent' && "border-l-red-600 bg-red-50/30",
                      alert.severity === 'High' && "border-l-amber-600 bg-amber-50/30",
                      alert.severity === 'Medium' && "border-l-blue-600",
                      alert.severity === 'Low' && "border-l-stone-400"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-0.5">
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{getTypeIcon(alert.type)}</span>
                              <CardTitle className="text-base font-semibold text-stone-900">
                                {alert.title}
                              </CardTitle>
                              <Badge variant="outline" className={cn("border", getSeverityColor(alert.severity))}>
                                {alert.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-stone-600 mt-1">
                              {alert.description}
                            </p>
                            {alert.due_date && (
                              <p className="text-xs text-stone-500 mt-2">
                                Due: {new Date(alert.due_date).toLocaleString('en-SG', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(alert.alert_id)}
                          className="h-8 w-8 p-0 -mt-1"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    {alert.quick_actions && alert.quick_actions.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
                          {alert.quick_actions.map((action) => (
                            <Button
                              key={action.action_id}
                              variant={action.variant || 'default'}
                              size="sm"
                              onClick={() => handleAction(action.action)}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dismissed Alerts */}
      {dismissedAlerts.length > 0 && (
        <Card className="border-stone-200">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-stone-600">
              Dismissed Alerts ({dismissedAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDismissedAlerts([])}
            >
              Restore All
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
