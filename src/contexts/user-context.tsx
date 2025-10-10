'use client'

import React, { createContext, useContext } from 'react'
import type { User } from '@/types/classroom'
import { useTeacherData } from '@/hooks/use-teacher-data'

interface UserContextType {
  user: User | null
  loading: boolean
  isFormTeacher: boolean
  isFormTeacherFor: (classId: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { teacher, loading } = useTeacherData()

  const isFormTeacher = teacher?.role === 'FormTeacher'

  const isFormTeacherFor = (classId: string) => {
    return isFormTeacher && teacher?.form_class_id === classId
  }

  const value: UserContextType = {
    user: teacher,
    loading,
    isFormTeacher,
    isFormTeacherFor,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
