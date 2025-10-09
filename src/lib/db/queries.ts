/**
 * Database query functions for Next.js Server Components
 * These functions should only be called from Server Components or Server Actions
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// ============================================
// CLASSROOM QUERIES
// ============================================

export async function getClassById(classId: string) {
  return await prisma.class.findUnique({
    where: { id: classId },
    include: {
      teacher: true,
      formTeacher: true,
      schedules: true,
      enrollments: {
        include: {
          student: true,
        },
      },
    },
  })
}

export async function getAllClasses() {
  return await prisma.class.findMany({
    include: {
      teacher: true,
      formTeacher: true,
      schedules: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      className: 'asc',
    },
  })
}

// ============================================
// STUDENT QUERIES
// ============================================

export async function getStudentsByClassId(classId: string) {
  const enrollments = await prisma.classEnrollment.findMany({
    where: { classId },
    include: {
      student: {
        include: {
          parents: {
            include: {
              parent: true,
            },
          },
        },
      },
    },
    orderBy: {
      student: {
        name: 'asc',
      },
    },
  })

  return enrollments.map((e) => e.student)
}

export async function getStudentById(studentId: string) {
  return await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      parents: {
        include: {
          parent: true,
        },
      },
      enrollments: {
        include: {
          class: {
            include: {
              teacher: true,
              formTeacher: true,
            },
          },
        },
      },
      academicGrades: {
        orderBy: {
          gradedDate: 'desc',
        },
        take: 10,
      },
      attendanceRecords: {
        orderBy: {
          date: 'desc',
        },
        take: 20,
      },
      cases: {
        include: {
          linkedBackgroundRecordings: true,
          linkedPerformanceRecordings: true,
          linkedAttendanceRecordings: true,
          linkedSocialBehaviourRecordings: true,
        },
        orderBy: {
          openedDate: 'desc',
        },
      },
    },
  })
}

export async function getStudentByName(name: string) {
  return await prisma.student.findFirst({
    where: { name },
    include: {
      parents: {
        include: {
          parent: true,
        },
      },
      enrollments: {
        include: {
          class: true,
        },
      },
    },
  })
}

// ============================================
// RECORDING QUERIES
// ============================================

export async function getStudentRecordings(studentId: string) {
  const [attendance, performance, background, social] = await Promise.all([
    prisma.attendanceDataRecording.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.performanceDataRecording.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.backgroundDataRecording.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.socialBehaviourRecording.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return {
    attendance,
    performance,
    background,
    social,
  }
}

// ============================================
// CASE QUERIES
// ============================================

export async function getCaseById(caseId: string) {
  return await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      student: {
        include: {
          parents: {
            include: {
              parent: true,
            },
          },
        },
      },
      linkedAttendanceRecordings: {
        orderBy: { createdAt: 'desc' },
      },
      linkedPerformanceRecordings: {
        orderBy: { createdAt: 'desc' },
      },
      linkedBackgroundRecordings: {
        orderBy: { createdAt: 'desc' },
      },
      linkedSocialBehaviourRecordings: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })
}

export async function getActiveCases() {
  return await prisma.case.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      student: true,
    },
    orderBy: {
      severity: 'desc',
    },
  })
}

export async function getCasesByStudent(studentId: string) {
  return await prisma.case.findMany({
    where: { studentId },
    include: {
      linkedAttendanceRecordings: true,
      linkedPerformanceRecordings: true,
      linkedBackgroundRecordings: true,
      linkedSocialBehaviourRecordings: true,
    },
    orderBy: {
      openedDate: 'desc',
    },
  })
}

// ============================================
// TEACHER QUERIES
// ============================================

export async function getTeacherById(teacherId: string) {
  return await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      classes: {
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
      formClasses: {
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
      },
    },
  })
}

export async function getTeacherByEmail(email: string) {
  return await prisma.teacher.findUnique({
    where: { email },
  })
}

// ============================================
// DASHBOARD QUERIES
// ============================================

export async function getDashboardStats() {
  const [totalStudents, totalClasses, activeCases, totalTeachers] = await Promise.all([
    prisma.student.count({
      where: { isActive: true },
    }),
    prisma.class.count(),
    prisma.case.count({
      where: { status: 'ACTIVE' },
    }),
    prisma.teacher.count({
      where: { isActive: true },
    }),
  ])

  return {
    totalStudents,
    totalClasses,
    activeCases,
    totalTeachers,
  }
}

// ============================================
// TYPE EXPORTS
// ============================================

// Export complex types for use in components
export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: {
    parents: {
      include: {
        parent: true
      }
    }
    enrollments: {
      include: {
        class: {
          include: {
            teacher: true
            formTeacher: true
          }
        }
      }
    }
  }
}>

export type ClassWithDetails = Prisma.ClassGetPayload<{
  include: {
    teacher: true
    formTeacher: true
    schedules: true
    enrollments: {
      include: {
        student: true
      }
    }
  }
}>

export type CaseWithDetails = Prisma.CaseGetPayload<{
  include: {
    student: {
      include: {
        parents: {
          include: {
            parent: true
          }
        }
      }
    }
    linkedAttendanceRecordings: true
    linkedPerformanceRecordings: true
    linkedBackgroundRecordings: true
    linkedSocialBehaviourRecordings: true
  }
}>
