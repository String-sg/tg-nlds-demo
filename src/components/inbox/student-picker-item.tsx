'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { getInitials, getAvatarColor } from '@/lib/chat/utils'
import { cn } from '@/lib/utils'

interface StudentPickerItemProps {
  student: {
    id: string
    name: string
    class: string
    className: string
    guardianName: string
    guardianType: string
  }
  selected: boolean
  onToggle: (studentId: string) => void
}

export function StudentPickerItem({
  student,
  selected,
  onToggle,
}: StudentPickerItemProps) {
  return (
    <div
      onClick={() => onToggle(student.id)}
      className={cn(
        'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50',
        selected && 'bg-stone-50'
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle(student.id)}
        onClick={(e) => e.stopPropagation()}
        className="flex-shrink-0"
      />

      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback className={getAvatarColor(student.name)}>
          {getInitials(student.name)}
        </AvatarFallback>
      </Avatar>

      {/* Student Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-sm font-semibold text-stone-900 truncate">
            {student.name}
          </h4>
          <span className="text-xs text-stone-500 flex-shrink-0">
            {student.class}
          </span>
        </div>
        <p className="text-xs text-stone-600 truncate">
          {student.guardianName} • {student.guardianType}
        </p>
      </div>
    </div>
  )
}
