import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.classEnrollment.deleteMany()
  await prisma.studentParent.deleteMany()
  await prisma.attendanceDataRecording.deleteMany()
  await prisma.performanceDataRecording.deleteMany()
  await prisma.backgroundDataRecording.deleteMany()
  await prisma.socialBehaviourRecording.deleteMany()
  await prisma.case.deleteMany()
  await prisma.student.deleteMany()
  await prisma.parent.deleteMany()
  await prisma.classSchedule.deleteMany()
  await prisma.class.deleteMany()
  await prisma.teacher.deleteMany()

  // 1. Create Teacher
  console.log('👨‍🏫 Creating teacher...')
  const teacher = await prisma.teacher.create({
    data: {
      id: 'teacher-001',
      name: 'Daniel Tan',
      email: 'daniel.tan@school.edu.sg',
      role: 'FORM_TEACHER',
      department: 'Mathematics',
      classesAssigned: 'class-5a,class-6b,class-7a',
      formClassId: 'class-5a',
      ccaClassIds: 'cca-math-club,cca-robotics',
    },
  })
  console.log(`✅ Created teacher: ${teacher.name}`)

  // 2. Create Class 5A
  console.log('🏫 Creating class 5A...')
  const class5A = await prisma.class.create({
    data: {
      id: 'class-5a',
      className: '5A',
      subject: 'Mathematics',
      yearLevel: 5,
      academicYear: '2025',
      isFormClass: true,
      teacherId: teacher.id,
      formTeacherId: teacher.id,
      schedules: {
        create: [
          {
            day: 'Monday',
            startTime: '08:00',
            endTime: '09:00',
            location: 'Room 3-12',
          },
          {
            day: 'Wednesday',
            startTime: '08:00',
            endTime: '09:00',
            location: 'Room 3-12',
          },
          {
            day: 'Friday',
            startTime: '08:00',
            endTime: '09:00',
            location: 'Room 3-12',
          },
        ],
      },
    },
  })
  console.log(`✅ Created class: ${class5A.className}`)

  // 3. Create Students with Parents
  console.log('👨‍👩‍👧‍👦 Creating students and parents...')

  const studentsData = [
    {
      id: 'student-001',
      name: 'Alice Wong',
      yearLevel: 5,
      className: '5A',
      status: 'NONE',
      conductGrade: 'EXCELLENT',
      grades: { english: 92, math: 88, science: 90, chinese: 85, humanities: 87 },
      attendanceRate: 98,
      parents: { name: 'Mr. & Mrs. Wong', email: 'wong.family@email.com', phone: '+65 9123 4567' },
      familyBackground:
        'Supportive parents, both working professionals. Younger sibling in primary school.',
      friends: 'Emily Tan,Sarah Lee,Priya Krishnan',
      hasMedicalConditions: false,
      needsCounselling: false,
      hasDisciplinaryIssues: false,
      hasSEN: false,
    },
    {
      id: 'student-002',
      name: 'David Chen',
      yearLevel: 5,
      className: '5A',
      status: 'NONE',
      conductGrade: 'AVERAGE',
      grades: { english: 62, math: 58, science: 55 },
      attendanceRate: 85,
      parents: { name: 'Mrs. Chen', email: 'chen.family@email.com', phone: '+65 9234 5678' },
      healthDeclaration: 'No known allergies',
      friends: 'Michael Wong',
      hasMedicalConditions: false,
      needsCounselling: true,
      hasDisciplinaryIssues: false,
      hasSEN: false,
    },
    {
      id: 'student-003',
      name: 'Emily Tan',
      yearLevel: 5,
      className: '5A',
      status: 'NONE',
      conductGrade: 'ABOVE_AVERAGE',
      grades: { english: 85, math: 82, science: 87 },
      attendanceRate: 100,
      parents: { name: 'Mr. & Mrs. Tan', email: 'tan.family@email.com', phone: '+65 9345 6789' },
      healthDeclaration: 'Asthma - requires inhaler during physical activities',
      friends: 'Alice Wong,Sarah Lee',
      hasMedicalConditions: true,
      needsCounselling: false,
      hasDisciplinaryIssues: false,
      hasSEN: false,
    },
    {
      id: 'student-004',
      name: 'Lim Hui Ling',
      yearLevel: 5,
      className: '5A',
      status: 'SEN',
      conductGrade: 'AVERAGE',
      grades: { english: 79, math: 85, science: 91 },
      attendanceRate: 92,
      parents: { name: 'Mrs. Lim', email: 'lim.family@email.com', phone: '+65 9456 7890' },
      friends: 'Priya Krishnan',
      hasMedicalConditions: false,
      needsCounselling: true,
      hasDisciplinaryIssues: false,
      hasSEN: true,
    },
    {
      id: 'student-005',
      name: 'Muhammad Iskandar',
      yearLevel: 5,
      className: '5A',
      status: 'GEP',
      conductGrade: 'EXCELLENT',
      grades: { english: 92, math: 95, science: 95 },
      attendanceRate: 98,
      parents: {
        name: 'Mr. & Mrs. Iskandar',
        email: 'iskandar.family@email.com',
        phone: '+65 9567 8901',
      },
      friends: 'John Smith,Sarah Lee',
      hasMedicalConditions: false,
      needsCounselling: false,
      hasDisciplinaryIssues: false,
      hasSEN: false,
    },
    // Eric Lim - SEN student (student-031)
    {
      id: 'student-031',
      name: 'Eric Lim',
      yearLevel: 5,
      className: '5A',
      status: 'SEN',
      conductGrade: 'AVERAGE',
      grades: { english: 61, math: 67, science: 66 },
      attendanceRate: 89,
      parents: { name: 'Dr. & Mrs. Lim', email: 'lim.dr.family@email.com', phone: '+65 9111 2222' },
      familyBackground: 'High-achieving professional family. Recent marital issues affecting home environment.',
      healthDeclaration: 'Stress-related health issues - frequent sick room visits',
      mentalWellnessNotes: 'Under SEC monitoring for anxiety. Regular counseling sessions.',
      friends: 'Daniel Koh',
      hasMedicalConditions: false,
      needsCounselling: true,
      hasDisciplinaryIssues: false,
      hasSEN: true,
    },
    // Ryan Tan - Discipline case with growth story (student-006)
    {
      id: 'student-006',
      name: 'Ryan Tan',
      yearLevel: 5,
      className: '5A',
      status: 'NONE',
      conductGrade: 'AVERAGE', // Improved from BELOW_AVERAGE
      grades: { english: 74, math: 72, science: 75 }, // Recovered from earlier dip
      attendanceRate: 88,
      parents: { name: 'Mr. & Mrs. Tan', email: 'ryan.tan.family@email.com', phone: '+65 9678 9012' },
      familyBackground: 'Single mother, father works overseas. Older sibling in secondary school acts as caregiver.',
      healthDeclaration: null,
      mentalWellnessNotes: null,
      friends: 'David Chen,Marcus Lim',
      hasMedicalConditions: false,
      needsCounselling: false, // Case improving, no longer needs active counselling
      hasDisciplinaryIssues: true, // Has history, but improving
      hasSEN: false,
    },
  ]

  let studentCount = 0
  for (const studentData of studentsData) {
    // Create parent
    const parent = await prisma.parent.create({
      data: {
        name: studentData.parents.name,
        email: studentData.parents.email,
        phone: studentData.parents.phone,
      },
    })

    // Calculate overall average
    const grades = studentData.grades
    const gradeValues = Object.values(grades)
    const overallAverage = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length

    // Create student
    const student = await prisma.student.create({
      data: {
        id: studentData.id,
        name: studentData.name,
        yearLevel: studentData.yearLevel,
        className: studentData.className,
        status: studentData.status as any,
        conductGrade: studentData.conductGrade as any,
        attendanceRate: studentData.attendanceRate,
        familyBackground: studentData.familyBackground,
        healthDeclaration: studentData.healthDeclaration,
        mentalWellnessNotes: studentData.mentalWellnessNotes,
        friends: studentData.friends,
        hasMedicalConditions: studentData.hasMedicalConditions,
        needsCounselling: studentData.needsCounselling,
        hasDisciplinaryIssues: studentData.hasDisciplinaryIssues,
        hasSEN: studentData.hasSEN,
        overallAverage,
        enrollments: {
          create: {
            classId: class5A.id,
          },
        },
        parents: {
          create: {
            parentId: parent.id,
            relationship: 'Parent',
            isPrimary: true,
          },
        },
      },
    })

    studentCount++
    if (studentCount % 5 === 0 || studentData.id === 'student-031') {
      console.log(`   ✓ Created ${studentCount} students...`)
    }
  }

  console.log(`✅ Created ${studentCount} students with parents`)

  // 4. Create Eric's comprehensive records
  console.log('📝 Creating Eric\'s comprehensive records...')

  // Background recordings
  await prisma.backgroundDataRecording.create({
    data: {
      studentId: 'student-031',
      date: '2025-01-12',
      title: 'Family Situation - Recent Changes',
      description: 'Eric mentioned parents arguing more frequently. Family situation causing stress.',
      backgroundArea: 'family',
      severity: 'high',
      actionRequired: true,
      actionTaken: 'Scheduled follow-up counseling session with Ms. Wong',
      referredTo: 'School Counselor',
      visibility: 'STAFF',
      tags: 'family,counselling,sensitive',
      createdBy: 'Daniel Tan',
    },
  })

  await prisma.backgroundDataRecording.create({
    data: {
      studentId: 'student-031',
      date: '2025-01-10',
      title: 'Mental Wellness - Anxiety Management',
      description:
        'Counseling session focused on developing coping mechanisms for family-related anxiety.',
      backgroundArea: 'mental_wellness',
      severity: 'medium',
      actionRequired: true,
      actionTaken: 'Ongoing counseling sessions, teaching breathing exercises',
      referredTo: 'School Counselor - Ms. Wong',
      visibility: 'STAFF',
      tags: 'mental-wellness,counselling,anxiety',
      createdBy: 'Sarah Wong (School Counselor)',
    },
  })

  // Social behavior recordings
  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-031',
      date: '2025-01-12',
      title: 'Friendship Difficulties - Social Isolation',
      description: 'Still feeling isolated, only close to Daniel Koh. Eating alone at lunch more frequently.',
      behaviourArea: 'friendship',
      context: 'Recess observation',
      isPositive: false,
      concernLevel: 'medium',
      visibility: 'STAFF',
      tags: 'friendship,isolation,wellbeing',
      createdBy: 'Daniel Tan',
    },
  })

  // Performance recordings
  await prisma.performanceDataRecording.create({
    data: {
      studentId: 'student-031',
      date: '2024-11-15',
      title: 'Academic Performance Decline',
      description:
        'Significant decline in English and Math performance. Two consecutive failed assessments.',
      performanceArea: 'academic',
      subject: 'English, Math',
      trend: 'declining',
      previousLevel: 'Avg 78%',
      currentLevel: 'Avg 64%',
      concernLevel: 'high',
      visibility: 'STAFF',
      tags: 'academic,intervention-needed',
      createdBy: 'Daniel Tan',
    },
  })

  console.log('✅ Created 4 comprehensive records for Eric')

  // 5. Create SEN Case for Eric
  console.log('📋 Creating SEN case for Eric...')

  const ericBackgroundRecordings = await prisma.backgroundDataRecording.findMany({
    where: { studentId: 'student-031' },
  })

  const ericSocialRecordings = await prisma.socialBehaviourRecording.findMany({
    where: { studentId: 'student-031' },
  })

  const ericPerformanceRecordings = await prisma.performanceDataRecording.findMany({
    where: { studentId: 'student-031' },
  })

  const ericCase = await prisma.case.create({
    data: {
      studentId: 'student-031',
      caseNumber: 'SEN-2025-001',
      type: 'SEN',
      severity: 'HIGH',
      status: 'ACTIVE',
      title: 'SEN Case - Academic & Wellbeing Support',
      description:
        'Eric identified as SEN (Special Educational Needs) student requiring comprehensive support. Family situation, social isolation, and academic decline require coordinated intervention.',
      openedBy: 'Daniel Tan',
      caseOwner: 'Daniel Tan',
      caseTeam: 'SEC Team, School Counselor',
      linkedBackgroundRecordings: {
        connect: ericBackgroundRecordings.map((r) => ({ id: r.id })),
      },
      linkedSocialBehaviourRecordings: {
        connect: ericSocialRecordings.map((r) => ({ id: r.id })),
      },
      linkedPerformanceRecordings: {
        connect: ericPerformanceRecordings.map((r) => ({ id: r.id })),
      },
      progressNotes: `Term 1 check-in completed. Eric showing willingness to engage in 1-on-1 settings.

INTERVENTIONS:
- Weekly counseling sessions
- Termly check-ins
- PTM scheduled to discuss family support options

REVIEWS:
- Last reviewed: 2025-01-12
- Next review: 2025-02-14`,
    },
  })

  console.log(`✅ Created SEN case: ${ericCase.caseNumber}`)

  // 6. Create Ryan's comprehensive records - Discipline case with growth story
  console.log('📝 Creating Ryan\'s behavioral records and discipline case...')

  // Early negative behavioral incidents (September-October 2024)
  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-09-15',
      title: 'Classroom Disruption - Talking Back to Teacher',
      description:
        'Ryan talked back when asked to stop chatting during Math lesson. Refused to comply initially. Escalated to shouting. Student removed from class, parents notified.',
      behaviourArea: 'discipline',
      context: 'Math class, second warning given',
      isPositive: false,
      concernLevel: 'high',
      visibility: 'STAFF',
      tags: 'discipline,classroom-management,defiance',
      createdBy: 'Daniel Tan',
    },
  })

  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-09-28',
      title: 'Incomplete Homework - Third Consecutive Week',
      description:
        'Ryan has not submitted homework for English, Math, and Science for three weeks. When questioned, became defensive and made excuses. Parent meeting scheduled.',
      behaviourArea: 'responsibility',
      context: 'Homework check',
      isPositive: false,
      concernLevel: 'medium',
      visibility: 'STAFF',
      tags: 'homework,responsibility,follow-up-needed',
      createdBy: 'Daniel Tan',
    },
  })

  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-10-12',
      title: 'Peer Conflict - Physical Altercation',
      description:
        'Ryan got into a physical fight with classmate during recess. Started when other student teased him about his family. Sent to discipline master, parents called, restorative meeting arranged.',
      behaviourArea: 'peer_relations',
      context: 'Recess time, playground',
      isPositive: false,
      concernLevel: 'high',
      visibility: 'STAFF',
      tags: 'discipline,peer-conflict,physical-altercation,urgent',
      createdBy: 'Mrs. Sarah Lim (Discipline Master)',
    },
  })

  // Performance dip during behavioral issues (October-November 2024)
  await prisma.performanceDataRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-10-20',
      title: 'Academic Performance Decline',
      description:
        'Ryan\'s grades have dropped significantly. Failed Math quiz (38%), English composition (42%), Science test (45%). Not completing homework or preparing for assessments.',
      performanceArea: 'academic',
      subject: 'Math, English, Science',
      trend: 'declining',
      previousLevel: 'Avg 78%',
      currentLevel: 'Avg 42%',
      concernLevel: 'high',
      visibility: 'STAFF',
      tags: 'academic,intervention-needed,priority',
      createdBy: 'Daniel Tan',
    },
  })

  // Intervention period - Mixed signals (November-December 2024)
  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-11-08',
      title: 'CMT Check-in - Opening Up About Home Situation',
      description:
        'During CMT session, Ryan opened up about stress at home. Mother working two jobs, father overseas, older brother struggling with studies. Ryan feels pressure and lacks support. Regular check-ins scheduled, FSC referral made for family support.',
      behaviourArea: 'emotional_regulation',
      context: 'CMT counseling session',
      isPositive: true,
      concernLevel: 'medium',
      visibility: 'STAFF',
      tags: 'CMT,counseling,family-support,breakthrough',
      createdBy: 'Ms. Jennifer Wong (CMT Lead)',
    },
  })

  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-11-22',
      title: 'Improved Attitude - Participated in Group Work',
      description:
        'Ryan actively participated in Science group project today. Showed leadership, helped peers, stayed on task. First positive group interaction in weeks. Verbal praise given, parents notified of positive progress.',
      behaviourArea: 'participation',
      context: 'Science class group project',
      isPositive: true,
      concernLevel: 'low',
      visibility: 'STAFF',
      tags: 'positive,participation,improvement',
      createdBy: 'Mrs. Rachel Ng (Science Teacher)',
    },
  })

  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2024-12-05',
      title: 'Homework Completion Improving',
      description:
        'Ryan has submitted homework for the past two weeks consistently. Quality still needs work, but completion rate has improved significantly. Continue monitoring, provide encouragement.',
      behaviourArea: 'responsibility',
      context: 'Homework monitoring',
      isPositive: true,
      concernLevel: 'low',
      visibility: 'STAFF',
      tags: 'homework,improvement,positive-trend',
      createdBy: 'Daniel Tan',
    },
  })

  // Recent positive trajectory (January 2025)
  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2025-01-10',
      title: 'Excellent Behavior - Helping Peers',
      description:
        'Ryan volunteered to help David Chen with Math during remedial. Patient, encouraging, and demonstrated understanding. This is a significant turnaround. Praised publicly, considering for peer mentorship program.',
      behaviourArea: 'peer_relations',
      context: 'Remedial class',
      isPositive: true,
      concernLevel: 'low',
      visibility: 'STAFF',
      tags: 'positive,peer-support,growth,mentorship-potential',
      createdBy: 'Mr. David Koh (Math Teacher)',
    },
  })

  await prisma.socialBehaviourRecording.create({
    data: {
      studentId: 'student-006',
      date: '2025-01-18',
      title: 'CMT Review - Remarkable Progress',
      description:
        'Ryan has shown remarkable progress in behavior and attitude. Responding well to interventions. Family support from FSC has helped stabilize home situation. Recommend closing discipline case with monitoring. Recommend case closure with 3-month monitoring period.',
      behaviourArea: 'overall_progress',
      context: 'CMT quarterly review',
      isPositive: true,
      concernLevel: 'low',
      visibility: 'STAFF',
      tags: 'CMT,review,success-story,case-closure-recommended',
      createdBy: 'Ms. Jennifer Wong (CMT Lead)',
    },
  })

  // Academic recovery (December 2024 - January 2025)
  await prisma.performanceDataRecording.create({
    data: {
      studentId: 'student-006',
      date: '2025-01-15',
      title: 'Academic Recovery - Significant Improvement',
      description:
        'Ryan\'s recent assessments show strong recovery. Math quiz (72%), English composition (74%), Science test (76%). Consistent homework completion and active class participation noted.',
      performanceArea: 'academic',
      subject: 'Math, English, Science',
      trend: 'improving',
      previousLevel: 'Avg 42%',
      currentLevel: 'Avg 74%',
      concernLevel: 'low',
      visibility: 'STAFF',
      tags: 'academic,recovery,positive-trend,success',
      createdBy: 'Daniel Tan',
    },
  })

  console.log('✅ Created 10 behavioral and performance records for Ryan')

  // 7. Create Discipline Case for Ryan with full timeline
  console.log('📋 Creating discipline case for Ryan...')

  const ryanBehaviorRecordings = await prisma.socialBehaviourRecording.findMany({
    where: { studentId: 'student-006' },
  })

  const ryanPerformanceRecordings = await prisma.performanceDataRecording.findMany({
    where: { studentId: 'student-006' },
  })

  const ryanCase = await prisma.case.create({
    data: {
      studentId: 'student-006',
      caseNumber: 'DISC-2024-015',
      type: 'DISCIPLINE',
      severity: 'MEDIUM',
      status: 'RESOLVED', // Recently resolved, under monitoring
      title: 'Behavioral Issues - Classroom Disruption & Academic Decline',
      description:
        'Ryan displayed multiple behavioral issues including classroom disruption, talking back to teachers, incomplete homework, and physical altercation. Academic performance declined significantly during this period. Case opened following escalation of incidents in September-October 2024.',
      openedBy: 'Daniel Tan',
      openedDate: new Date('2024-09-15'),
      closedDate: new Date('2025-01-20'),
      closedBy: 'Daniel Tan',
      resolution: 'Case resolved successfully. Ryan has shown remarkable progress in behavior and attitude. Academic performance recovered to baseline. Recommend 3-month monitoring period with continued CMT support.',
      caseOwner: 'Daniel Tan',
      caseTeam: 'CMT (Ms. Jennifer Wong), Discipline Master (Mrs. Sarah Lim), FSC Support',
      linkedSocialBehaviourRecordings: {
        connect: ryanBehaviorRecordings.map((r) => ({ id: r.id })),
      },
      linkedPerformanceRecordings: {
        connect: ryanPerformanceRecordings.map((r) => ({ id: r.id })),
      },
      progressNotes: `
TIMELINE OF INTERVENTIONS & PROGRESS:

Sept 2024: Initial incidents - talking back, classroom disruption, homework non-completion
- Action: Parent meeting, behavior contract implemented
- Response: Limited improvement

Oct 2024: Escalation - physical altercation with peer, academic performance dropped sharply
- Action: CMT referral, FSC family support engaged, weekly check-ins
- Response: Ryan initially resistant but began opening up about home stressors

Nov 2024: Breakthrough period - Ryan opened up about family situation in CMT session
- Action: Continued CMT support, FSC arranged additional resources for family
- Progress: First signs of positive behavior change, participated well in group work

Dec 2024: Steady improvement - homework completion rate improved, fewer incidents
- Action: Positive reinforcement, continued monitoring, parent partnership strengthened
- Progress: Academic performance began recovering

Jan 2025: Significant turnaround - helping peers, excellent behavior, grades recovered
- CMT Review: Recommended case closure with monitoring
- Academic recovery confirmed - grades returned to baseline

INTERVENTIONS IMPLEMENTED:
1. Parent Partnership: Regular communication with mother, FSC family support engagement
2. CMT Involvement: Weekly check-ins with Ms. Jennifer Wong (CMT Lead)
3. Behavioral Contract: Clear expectations and consequences established
4. Academic Support: Remedial sessions, homework monitoring
5. Peer Mediation: Restorative meeting following October incident
6. Positive Reinforcement: Recognition of improvements, peer mentorship consideration
7. Family Support: FSC referral for practical support (financial, childcare resources)

REVIEWS:
- Last review: 2025-01-18 (CMT quarterly review - recommended closure)
- Next monitoring check: 2025-04-20 (3-month follow-up)

CURRENT STATUS: Case resolved with 3-month monitoring period. Ryan has shown remarkable growth.`,
    },
  })

  console.log(`✅ Created discipline case: ${ryanCase.caseNumber} (RESOLVED)`)

  // Summary
  console.log('\n✨ Seed completed successfully!')
  console.log(`   👨‍🏫 Teachers: 1`)
  console.log(`   🏫 Classes: 1`)
  console.log(`   👨‍👩‍👧‍👦 Students: ${studentCount}`)
  console.log(`   📝 Recordings: 14 (4 Eric, 10 Ryan)`)
  console.log(`   📋 Cases: 2 (1 SEN, 1 Discipline)`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
