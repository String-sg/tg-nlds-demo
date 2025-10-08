'use client'

import React, { createContext, useContext } from 'react'
import type { User } from '@/types/classroom'
import { currentUser } from '@/lib/mock-data/classroom-data'

interface UserContextType {
  user: User
  isFormTeacher: boolean
  isFormTeacherFor: (classId: string) => boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const isFormTeacher = currentUser.role === 'FormTeacher'

  const isFormTeacherFor = (classId: string) => {
    return isFormTeacher && currentUser.form_class_id === classId
  }

  const value: UserContextType = {
    user: currentUser,
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
