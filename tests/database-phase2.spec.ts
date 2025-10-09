import { test, expect } from '@playwright/test'
import { prisma } from '../src/lib/prisma'

test.describe.configure({ mode: 'serial' })

test.describe('Phase 2: Data Migration', () => {
  test.afterAll(async () => {
    await prisma.$disconnect()
  })

  test('should have seeded teacher', async () => {
    const teacher = await prisma.teacher.findUnique({
      where: { email: 'daniel.tan@school.edu.sg' },
    })

    expect(teacher).toBeTruthy()
    expect(teacher?.name).toBe('Daniel Tan')
    expect(teacher?.role).toBe('FORM_TEACHER')
    expect(teacher?.department).toBe('Mathematics')
  })

  test('should have seeded class 5A with schedule', async () => {
    const class5A = await prisma.class.findFirst({
      where: { className: '5A' },
      include: {
        schedules: true,
        teacher: true,
        formTeacher: true,
      },
    })

    expect(class5A).toBeTruthy()
    expect(class5A?.isFormClass).toBe(true)
    expect(class5A?.yearLevel).toBe(5)
    expect(class5A?.teacher.name).toBe('Daniel Tan')
    expect(class5A?.formTeacher?.name).toBe('Daniel Tan')
    expect(class5A?.schedules).toHaveLength(3) // Mon, Wed, Fri
  })

  test('should have seeded students with enrollments', async () => {
    const students = await prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            class: true,
          },
        },
      },
    })

    expect(students.length).toBeGreaterThan(0)

    // Check Alice Wong
    const alice = students.find((s) => s.name === 'Alice Wong')
    expect(alice).toBeTruthy()
    expect(alice?.status).toBe('NONE')
    expect(alice?.conductGrade).toBe('EXCELLENT')
    expect(alice?.attendanceRate).toBe(98)
    expect(alice?.enrollments).toHaveLength(1)
    expect(alice?.enrollments[0].class.className).toBe('5A')
  })

  test('should have created parent relationships', async () => {
    const alice = await prisma.student.findFirst({
      where: { name: 'Alice Wong' },
      include: {
        parents: {
          include: {
            parent: true,
          },
        },
      },
    })

    expect(alice?.parents).toHaveLength(1)
    expect(alice?.parents[0].parent.name).toBe('Mr. & Mrs. Wong')
    expect(alice?.parents[0].parent.email).toBe('wong.family@email.com')
    expect(alice?.parents[0].isPrimary).toBe(true)
    expect(alice?.parents[0].relationship).toBe('Parent')
  })

  test('should have seeded Eric Lim as SWAN student', async () => {
    const eric = await prisma.student.findFirst({
      where: { name: 'Eric Lim' },
      include: {
        parents: {
          include: {
            parent: true,
          },
        },
      },
    })

    expect(eric).toBeTruthy()
    expect(eric?.status).toBe('SWAN')
    expect(eric?.needsCounselling).toBe(true)
    expect(eric?.hasSEN).toBe(true)
    expect(eric?.familyBackground).toContain('High-achieving professional family')
    expect(eric?.mentalWellnessNotes).toContain('SEC monitoring')
    expect(eric?.parents[0].parent.name).toBe('Dr. & Mrs. Lim')
  })

  test('should have created Eric\'s background recordings', async () => {
    const backgroundRecordings = await prisma.backgroundDataRecording.findMany({
      where: { studentId: 'student-031' },
    })

    expect(backgroundRecordings.length).toBeGreaterThan(0)

    // Family situation recording
    const familyRecording = backgroundRecordings.find((r) => r.backgroundArea === 'family')
    expect(familyRecording).toBeTruthy()
    expect(familyRecording?.title).toContain('Family Situation')
    expect(familyRecording?.severity).toBe('high')
    expect(familyRecording?.actionRequired).toBe(true)
    expect(familyRecording?.referredTo).toBe('School Counselor')

    // Mental wellness recording
    const mentalWellnessRecording = backgroundRecordings.find(
      (r) => r.backgroundArea === 'mental_wellness'
    )
    expect(mentalWellnessRecording).toBeTruthy()
    expect(mentalWellnessRecording?.title).toContain('Mental Wellness')
  })

  test('should have created Eric\'s social behaviour recordings', async () => {
    const socialRecordings = await prisma.socialBehaviourRecording.findMany({
      where: { studentId: 'student-031' },
    })

    expect(socialRecordings.length).toBeGreaterThan(0)

    const friendshipRecording = socialRecordings.find((r) => r.behaviourArea === 'friendship')
    expect(friendshipRecording).toBeTruthy()
    expect(friendshipRecording?.title).toContain('Friendship Difficulties')
    expect(friendshipRecording?.isPositive).toBe(false)
    expect(friendshipRecording?.concernLevel).toBe('medium')
    expect(friendshipRecording?.description).toContain('isolated')
  })

  test('should have created Eric\'s performance recordings', async () => {
    const performanceRecordings = await prisma.performanceDataRecording.findMany({
      where: { studentId: 'student-031' },
    })

    expect(performanceRecordings.length).toBeGreaterThan(0)

    const academicRecording = performanceRecordings.find((r) => r.performanceArea === 'academic')
    expect(academicRecording).toBeTruthy()
    expect(academicRecording?.title).toContain('Academic Performance Decline')
    expect(academicRecording?.trend).toBe('declining')
    expect(academicRecording?.concernLevel).toBe('high')
    expect(academicRecording?.subject).toContain('English')
    expect(academicRecording?.subject).toContain('Math')
  })

  test('should have created SWAN case for Eric with linked recordings', async () => {
    const swanCase = await prisma.case.findFirst({
      where: {
        studentId: 'student-031',
        type: 'SEN',
      },
      include: {
        student: true,
        linkedBackgroundRecordings: true,
        linkedPerformanceRecordings: true,
        linkedSocialBehaviourRecordings: true,
      },
    })

    expect(swanCase).toBeTruthy()
    expect(swanCase?.caseNumber).toBe('SWAN-2025-001')
    expect(swanCase?.type).toBe('SEN')
    expect(swanCase?.severity).toBe('HIGH')
    expect(swanCase?.status).toBe('ACTIVE')
    expect(swanCase?.title).toContain('SWAN Case')
    expect(swanCase?.caseOwner).toBe('Daniel Tan')
    expect(swanCase?.student.name).toBe('Eric Lim')

    // Verify linked recordings
    expect(swanCase?.linkedBackgroundRecordings.length).toBeGreaterThan(0)
    expect(swanCase?.linkedPerformanceRecordings.length).toBeGreaterThan(0)
    expect(swanCase?.linkedSocialBehaviourRecordings.length).toBeGreaterThan(0)

    // Verify progress notes and interventions
    expect(swanCase?.progressNotes).toContain('Term 1 check-in')
    expect(swanCase?.interventions).toContain('Weekly counseling')

    // Verify review dates
    expect(swanCase?.nextReviewDate).toBeTruthy()
    expect(swanCase?.lastReviewDate).toBeTruthy()
  })

  test('should calculate correct overall average for students', async () => {
    const alice = await prisma.student.findFirst({
      where: { name: 'Alice Wong' },
    })

    // Alice has grades: english: 92, math: 88, science: 90, chinese: 85, humanities: 87
    // Average = (92 + 88 + 90 + 85 + 87) / 5 = 442 / 5 = 88.4
    expect(alice?.overallAverage).toBeCloseTo(88.4, 1)
  })

  test('should support querying students by various filters', async () => {
    // Query by status
    const swanStudents = await prisma.student.findMany({
      where: { status: 'SWAN' },
    })
    expect(swanStudents.length).toBeGreaterThan(0)
    expect(swanStudents[0].name).toBe('Eric Lim')

    // Query by counselling need
    const needsCounsellingStudents = await prisma.student.findMany({
      where: { needsCounselling: true },
    })
    expect(needsCounsellingStudents.length).toBeGreaterThan(0)

    // Query by class enrollment
    const class5AStudents = await prisma.student.findMany({
      where: {
        enrollments: {
          some: {
            class: {
              className: '5A',
            },
          },
        },
      },
    })
    expect(class5AStudents.length).toBeGreaterThan(0)
  })

  test('should support case queries with filters', async () => {
    // Active cases
    const activeCases = await prisma.case.findMany({
      where: { status: 'ACTIVE' },
      include: {
        student: true,
      },
    })
    expect(activeCases.length).toBeGreaterThan(0)

    // SEN cases
    const senCases = await prisma.case.findMany({
      where: { type: 'SEN' },
    })
    expect(senCases.length).toBeGreaterThan(0)

    // High severity cases
    const highSeverityCases = await prisma.case.findMany({
      where: { severity: 'HIGH' },
    })
    expect(highSeverityCases.length).toBeGreaterThan(0)
  })
})
