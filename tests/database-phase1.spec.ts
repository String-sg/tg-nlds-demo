import { test, expect } from '@playwright/test'
import { prisma } from '../src/lib/prisma'

test.describe.configure({ mode: 'serial' })

test.describe('Phase 1: Core Database Setup', () => {
  test.beforeAll(async () => {
    // Clean database before tests
    await prisma.classEnrollment.deleteMany()
    await prisma.studentParent.deleteMany()
    await prisma.student.deleteMany()
    await prisma.parent.deleteMany()
    await prisma.classSchedule.deleteMany()
    await prisma.class.deleteMany()
    await prisma.teacher.deleteMany()
  })

  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('should connect to database', async () => {
    await expect(prisma.$connect()).resolves.not.toThrow()
    const result = await prisma.$queryRaw`SELECT 1 as connected`
    expect(result).toBeTruthy()
  })

  test('should create teacher', async () => {
    const teacher = await prisma.teacher.create({
      data: {
        name: 'Daniel Tan',
        email: 'daniel.tan@school.edu.sg',
        role: 'FORM_TEACHER',
        department: 'Mathematics',
        classesAssigned: 'class-5a,class-6b,class-7a',
        formClassId: 'class-5a',
        ccaClassIds: 'cca-math-club,cca-robotics'
      }
    })

    expect(teacher.id).toBeTruthy()
    expect(teacher.name).toBe('Daniel Tan')
    expect(teacher.email).toBe('daniel.tan@school.edu.sg')
    expect(teacher.role).toBe('FORM_TEACHER')
  })

  test('should create class with relationships', async () => {
    const teacher = await prisma.teacher.findFirst({
      where: { email: 'daniel.tan@school.edu.sg' }
    })

    expect(teacher).toBeTruthy()

    const classData = await prisma.class.create({
      data: {
        className: '5A',
        subject: 'Mathematics',
        yearLevel: 5,
        academicYear: '2025',
        isFormClass: true,
        teacherId: teacher!.id,
        formTeacherId: teacher!.id
      },
      include: {
        teacher: true,
        formTeacher: true
      }
    })

    expect(classData.className).toBe('5A')
    expect(classData.teacher.id).toBe(teacher!.id)
    expect(classData.formTeacher?.id).toBe(teacher!.id)
  })

  test('should create student with enrollment', async () => {
    const classData = await prisma.class.findFirst({
      where: { className: '5A' }
    })

    expect(classData).toBeTruthy()

    const student = await prisma.student.create({
      data: {
        name: 'Alice Wong',
        yearLevel: 5,
        className: '5A',
        status: 'NONE',
        conductGrade: 'EXCELLENT',
        friends: 'Emily Tan,Sarah Lee,Priya Krishnan',
        attendanceRate: 98.0,
        enrollments: {
          create: {
            classId: classData!.id
          }
        }
      },
      include: {
        enrollments: {
          include: {
            class: true
          }
        }
      }
    })

    expect(student.name).toBe('Alice Wong')
    expect(student.enrollments).toHaveLength(1)
    expect(student.enrollments[0].class.className).toBe('5A')
  })

  test('should query students by class', async () => {
    const classData = await prisma.class.findFirst({
      where: { className: '5A' }
    })

    const students = await prisma.student.findMany({
      where: {
        enrollments: {
          some: { classId: classData!.id }
        }
      },
      include: {
        enrollments: {
          include: {
            class: true
          }
        }
      }
    })

    expect(students.length).toBeGreaterThan(0)
    expect(students[0].name).toBe('Alice Wong')
  })

  test('should create multiple students in same class', async () => {
    const classData = await prisma.class.findFirst({
      where: { className: '5A' }
    })

    const student2 = await prisma.student.create({
      data: {
        name: 'David Chen',
        yearLevel: 5,
        className: '5A',
        status: 'NONE',
        conductGrade: 'AVERAGE',
        friends: 'Michael Wong',
        attendanceRate: 85.0,
        needsCounselling: true,
        enrollments: {
          create: {
            classId: classData!.id
          }
        }
      }
    })

    expect(student2.name).toBe('David Chen')
    expect(student2.needsCounselling).toBe(true)

    // Verify class now has 2 students
    const studentsInClass = await prisma.student.count({
      where: {
        enrollments: {
          some: { classId: classData!.id }
        }
      }
    })

    expect(studentsInClass).toBe(2)
  })

  test('should enforce unique constraints', async () => {
    const classData = await prisma.class.findFirst()

    // First create a student with email
    const studentWithEmail = await prisma.student.create({
      data: {
        name: 'Student With Email',
        email: 'unique@email.com',
        yearLevel: 5,
        className: '5A',
        friends: '',
        enrollments: {
          create: {
            classId: classData!.id
          }
        }
      }
    })

    expect(studentWithEmail.email).toBe('unique@email.com')

    // Try to create duplicate email
    await expect(
      prisma.student.create({
        data: {
          name: 'Test Student',
          email: 'unique@email.com', // Duplicate
          yearLevel: 5,
          className: '5A',
          friends: '',
          enrollments: {
            create: {
              classId: classData!.id
            }
          }
        }
      })
    ).rejects.toThrow()
  })

  test('should handle optional fields correctly', async () => {
    const classData = await prisma.class.findFirst()

    const student = await prisma.student.create({
      data: {
        name: 'Eric Lim',
        yearLevel: 8,
        className: 'S2-A',
        status: 'SWAN',
        conductGrade: 'AVERAGE',
        friends: 'Daniel Koh',
        attendanceRate: 89.0,
        // Optional fields
        familyBackground: 'High-achieving professional family',
        healthDeclaration: 'Stress-related health issues',
        mentalWellnessNotes: 'Under SEC monitoring for anxiety',
        hasMedicalConditions: false,
        needsCounselling: true,
        hasSEN: true,
        overallAverage: 64.0,
        enrollments: {
          create: {
            classId: classData!.id
          }
        }
      }
    })

    expect(student.status).toBe('SWAN')
    expect(student.needsCounselling).toBe(true)
    expect(student.hasSEN).toBe(true)
    expect(student.familyBackground).toBeTruthy()
    expect(student.overallAverage).toBe(64.0)
  })
})
