# Database Schema Quick Reference

**Last Updated**: 2025-10-09

---

## 🏗️ Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────────┐         ┌─────────────┐
│   Teacher   │────┬───→│    Class     │←───┬───│     Student     │←───────│   Parent    │
└─────────────┘    │    └──────────────┘    │    └─────────────────┘         └─────────────┘
                   │            │            │            │
                   │            │            │            │
                   └────────────┴────────────┴────────────┘
                                │
                   ┌────────────┼────────────────┬─────────────────┐
                   │            │                │                 │
           ┌───────▼──────┐ ┌──▼─────────────┐ ┌▼───────────────┐ ┌▼──────────────┐
           │ Attendance   │ │ AcademicGrade  │ │ CCAPerformance │ │ PhysFitness   │
           └──────────────┘ └────────────────┘ └────────────────┘ └───────────────┘

                   ┌────────────┬──────────────────────┬──────────────────┐
                   │            │                      │                  │
           ┌───────▼──────┐ ┌──▼──────────────────┐ ┌─▼─────────────┐ ┌─▼──────────────┐
           │ AttendData   │ │ PerformanceData     │ │ BackgroundData│ │ SocialBehaviour│
           │ Recording    │ │ Recording           │ │ Recording     │ │ Recording      │
           └──────────────┘ └─────────────────────┘ └───────────────┘ └────────────────┘
                   │                   │                     │                  │
                   └───────────────────┴─────────────────────┴──────────────────┘
                                              │
                                       ┌──────▼──────┐
                                       │    Case     │
                                       └─────────────┘

┌────────────────┐         ┌──────────────┐
│ Conversation   │────────→│   Message    │
└────────────────┘         └──────────────┘
        │
        │
        ▼
┌────────────────┐
│ Participant    │ (Teacher or Parent)
└────────────────┘
```

---

## 📊 Core Tables

### Teacher
```prisma
model Teacher {
  id              String    // cuid
  name            String
  email           String    @unique
  role            UserRole  // TEACHER, FORM_TEACHER, HOD, YEAR_HEAD
  department      String
  avatar          String?

  classesAssigned String[]
  formClassId     String?
  ccaClassIds     String[]

  classes         Class[]   @relation("TeacherClasses")
  formClasses     Class[]   @relation("FormTeacher")
}
```

**Indexes**:
- email (unique)
- department

**Usage**: User authentication, class ownership

---

### Class
```prisma
model Class {
  id              String
  className       String         // "5A", "6B"
  subject         String
  yearLevel       Int
  academicYear    String         // "2025"
  isFormClass     Boolean

  teacherId       String
  formTeacherId   String?

  teacher         Teacher        @relation("TeacherClasses")
  formTeacher     Teacher?       @relation("FormTeacher")
  enrollments     ClassEnrollment[]
  attendance      AttendanceRecord[]
  grades          AcademicGrade[]
  schedules       ClassSchedule[]
}
```

**Indexes**:
- [yearLevel, className]
- teacherId
- academicYear

**Usage**: Class management, student grouping

---

### Student
```prisma
model Student {
  id              String
  name            String
  email           String?       @unique
  yearLevel       Int
  className       String
  status          StudentStatus  // NONE, GEP, SEN, SWAN
  conductGrade    ConductGrade
  avatar          String?

  // Parent Info
  parentName      String
  parentEmail     String
  parentPhone     String

  // Background
  familyBackground     String?   @db.Text
  housingFinance       String?   @db.Text
  healthDeclaration    String?   @db.Text
  mentalWellnessNotes  String?   @db.Text
  friends              String[]

  // Flags
  hasMedicalConditions    Boolean
  needsCounselling        Boolean
  hasDisciplinaryIssues   Boolean
  hasSEN                  Boolean

  // Performance Cache
  overallAverage       Float?
  attendanceRate       Float

  // Relationships
  enrollments          ClassEnrollment[]
  attendanceRecords    AttendanceRecord[]
  academicGrades       AcademicGrade[]
  generalRecordings    GeneralRecording[]
  cases                Case[]
  conversations        Conversation[]
}
```

**Indexes**:
- name
- yearLevel
- status
- className
- overallAverage
- attendanceRate

**Usage**: Central student entity, links to all student data

---

## 📅 Attendance View Tables

### AttendanceRecord
```prisma
model AttendanceRecord {
  id              String
  studentId       String
  classId         String?

  type            AttendanceType    // DAILY, CCA, SCHOOL_EVENT, EARLY_DISMISSAL
  date            String
  status          AttendanceStatus  // PRESENT, ABSENT, LATE, EXCUSED
  reason          AbsenceReason?
  notes           String?           @db.Text

  // Type-specific fields
  ccaName         String?
  eventName       String?
  dismissalTime   String?
  dismissalReason String?

  recordedBy      String
  parentNotified  Boolean

  student         Student
  class           Class?
}
```

**Indexes**:
- [studentId, type, date] (unique)
- [date, status]
- type

**Query Examples**:
```typescript
// Daily attendance for a class
const attendance = await prisma.attendanceRecord.findMany({
  where: {
    classId: 'class-5a',
    date: '2025-10-09',
    type: 'DAILY'
  }
})

// Student's attendance history
const history = await prisma.attendanceRecord.findMany({
  where: {
    studentId: 'student-031',
    type: 'DAILY'
  },
  orderBy: { date: 'desc' }
})
```

---

## 📈 Performance View Tables

### AcademicGrade
```prisma
model AcademicGrade {
  id              String
  studentId       String
  classId         String

  subject         String
  assessmentType  AssessmentType
  assessmentName  String

  score           Float
  maxScore        Float
  percentage      Float
  letterGrade     String?
  weightage       Float

  term            String?
  academicYear    String
  published       Boolean
  comments        String?       @db.Text

  gradedDate      DateTime
  gradedBy        String

  student         Student
  class           Class
}
```

**Indexes**:
- [studentId, subject, academicYear]
- [studentId, term]
- [classId, subject]
- gradedDate
- published

**Query Examples**:
```typescript
// Student's term grades
const grades = await prisma.academicGrade.findMany({
  where: {
    studentId: 'student-031',
    term: 'Term 1',
    published: true
  },
  orderBy: { subject: 'asc' }
})

// Class average for a subject
const classGrades = await prisma.academicGrade.findMany({
  where: {
    classId: 'class-5a',
    subject: 'Mathematics',
    published: true
  }
})
const average = classGrades.reduce((sum, g) => sum + g.percentage, 0) / classGrades.length
```

### CCAPerformance
```prisma
model CCAPerformance {
  id              String
  studentId       String
  ccaName         String
  ccaType         String

  attendanceRate  Float?
  participation   String?
  achievements    String[]
  skills          String[]

  term            String
  academicYear    String
  grade           String?
  remarks         String?       @db.Text

  recordedBy      String

  student         Student
}
```

**Usage**: CCA participation tracking, achievements

### PhysicalFitnessRecord
```prisma
model PhysicalFitnessRecord {
  id              String
  studentId       String

  testName        String
  testDate        String
  overallGrade    String?

  tests           Json          // Individual test results

  remarks         String?       @db.Text
  recordedBy      String

  student         Student
}
```

**Usage**: NAPFA test results

### CCEGrade
```prisma
model CCEGrade {
  id              String
  studentId       String

  area            String
  grade           CCEGrade
  term            String
  academicYear    String

  observations    String?       @db.Text
  recordedBy      String

  student         Student
}
```

**Usage**: Character Citizenship Education grades

---

## 📋 Cases View Tables

### Case
```prisma
model Case {
  id              String
  studentId       String
  caseNumber      String        @unique

  type            CaseType      // DISCIPLINE, SEN, COUNSELLING, CAREER_GUIDANCE
  severity        CaseSeverity  // CRITICAL, HIGH, MEDIUM, LOW
  status          CaseStatus    // ACTIVE, MONITORING, RESOLVED, CLOSED

  title           String
  description     String

  openedDate      DateTime
  openedBy        String
  closedDate      DateTime?
  closedBy        String?
  resolution      String?

  caseOwner       String
  caseTeam        String

  student         Student

  // Linked recordings (building blocks for evidence and progress)
  linkedAttendanceRecordings    AttendanceDataRecording[]
  linkedPerformanceRecordings   PerformanceDataRecording[]
  linkedBackgroundRecordings    BackgroundDataRecording[]
  linkedSocialBehaviourRecordings SocialBehaviourRecording[]

  // Simple progress tracking
  progressNotes   String?       // Brief notes on case progress
  interventions   String?       // Summary of interventions taken

  nextReviewDate  DateTime?
  lastReviewDate  DateTime?
}
```

**Indexes**:
- [studentId, status]
- [type, status]
- caseNumber (unique)
- openedDate
- nextReviewDate

**Usage**: Formal heavyweight interventions (DISCIPLINE, SEN, COUNSELLING, CAREER_GUIDANCE)

**Query Examples**:
```typescript
// Active counselling cases with linked recordings
const cases = await prisma.case.findMany({
  where: {
    type: 'COUNSELLING',
    status: 'ACTIVE'
  },
  include: {
    student: true,
    linkedPerformanceRecordings: {
      orderBy: { createdAt: 'desc' },
      take: 5
    },
    linkedBackgroundRecordings: true
  }
})

// Student's case history with all evidence
const studentCases = await prisma.case.findMany({
  where: { studentId: 'student-031' },
  include: {
    linkedAttendanceRecordings: true,
    linkedPerformanceRecordings: true,
    linkedBackgroundRecordings: true,
    linkedSocialBehaviourRecordings: true
  },
  orderBy: { openedDate: 'desc' }
})

// Create new case with linked recordings
const newCase = await prisma.case.create({
  data: {
    studentId: 'student-031',
    caseNumber: 'CASE-2025-031',
    type: 'SEN',
    severity: 'HIGH',
    status: 'ACTIVE',
    title: 'Academic Support Required',
    description: 'Student showing signs of learning difficulties',
    openedBy: 'teacher-123',
    caseOwner: 'teacher-456',
    caseTeam: 'SEN Team',
    linkedPerformanceRecordings: {
      connect: [
        { id: 'recording-001' },
        { id: 'recording-002' }
      ]
    }
  }
})
```

---

## 📝 Teacher Recordings (Building Blocks for Cases)

Teacher recordings are lightweight, informal observations that serve as building blocks for formal Cases. They're separated into 4 types for clarity and type-safety.

### AttendanceDataRecording
```prisma
model AttendanceDataRecording {
  id              String
  studentId       String
  date            String

  title           String
  description     String

  // Attendance-specific fields
  observationType String   // "frequent_absence", "late_pattern", "early_dismissal_request"
  frequency       String?  // "Daily", "Weekly", "Occasionally"
  impact          String?  // Impact on learning
  parentContacted Boolean

  visibility      RecordVisibility
  tags            String
  linkedCaseId    String?

  createdBy       String

  student         Student
  linkedCase      Case?
}
```

**Indexes**: [studentId, date], linkedCaseId

**Usage**: Informal attendance observations (separate from official AttendanceRecord)

**Example**:
```typescript
await prisma.attendanceDataRecording.create({
  data: {
    studentId: 'student-031',
    date: '2025-10-09',
    title: 'Late arrival pattern observed',
    description: 'Student has been late 4 out of 5 days this week',
    observationType: 'late_pattern',
    frequency: 'Daily',
    impact: 'Missing morning lessons, affecting Math performance',
    parentContacted: true,
    visibility: 'STAFF',
    tags: 'attendance,punctuality',
    createdBy: 'teacher-123'
  }
})
```

---

### PerformanceDataRecording
```prisma
model PerformanceDataRecording {
  id              String
  studentId       String
  date            String

  title           String
  description     String

  // Performance-specific fields
  performanceArea String   // "academic", "cca", "physical_fitness", "cce"
  subject         String?  // For academic: "English", "Math", etc.
  trend           String?  // "improving", "declining", "stable"
  previousLevel   String?  // Baseline for comparison
  currentLevel    String?  // Current state
  concernLevel    String?  // "low", "medium", "high"

  visibility      RecordVisibility
  tags            String
  linkedCaseId    String?

  createdBy       String

  student         Student
  linkedCase      Case?
}
```

**Indexes**: [studentId, date], performanceArea, linkedCaseId

**Usage**: Performance observations across academic, CCA, fitness, CCE

**Example**:
```typescript
await prisma.performanceDataRecording.create({
  data: {
    studentId: 'student-031',
    date: '2025-10-09',
    title: 'Significant decline in English and Math',
    description: 'Two consecutive failed assessments in both subjects',
    performanceArea: 'academic',
    subject: 'English, Math',
    trend: 'declining',
    previousLevel: 'Avg 78%',
    currentLevel: 'Avg 64%',
    concernLevel: 'high',
    visibility: 'STAFF',
    tags: 'academic,intervention-needed',
    createdBy: 'teacher-123'
  }
})
```

---

### BackgroundDataRecording
```prisma
model BackgroundDataRecording {
  id              String
  studentId       String
  date            String

  title           String
  description     String

  // Background-specific fields
  backgroundArea  String   // "health", "mental_wellness", "family", "housing_finance"
  severity        String?  // "low", "medium", "high"
  actionRequired  Boolean
  actionTaken     String?
  referredTo      String?  // "School Counselor", "Social Worker", etc.

  visibility      RecordVisibility
  tags            String
  linkedCaseId    String?

  createdBy       String

  student         Student
  linkedCase      Case?
}
```

**Indexes**: [studentId, date], backgroundArea, actionRequired, linkedCaseId

**Usage**: Health, wellness, family, housing/finance observations

**Example**:
```typescript
await prisma.backgroundDataRecording.create({
  data: {
    studentId: 'student-031',
    date: '2025-10-09',
    title: 'Family separation affecting wellbeing',
    description: 'Student shared parents are going through divorce',
    backgroundArea: 'family',
    severity: 'high',
    actionRequired: true,
    actionTaken: 'Initial check-in completed',
    referredTo: 'School Counselor',
    visibility: 'STAFF',
    tags: 'family,counselling,urgent',
    createdBy: 'teacher-123'
  }
})
```

---

### SocialBehaviourRecording
```prisma
model SocialBehaviourRecording {
  id              String
  studentId       String
  date            String

  title           String
  description     String

  // Social behavior-specific fields
  behaviourArea   String   // "friendship", "peer_interaction", "character_observation", "conflict"
  context         String?  // "Classroom", "Recess", "CCA", etc.
  peersInvolved   String?  // Names of other students involved
  isPositive      Boolean  // Positive or concerning behavior
  concernLevel    String?  // "low", "medium", "high"

  visibility      RecordVisibility
  tags            String
  linkedCaseId    String?

  createdBy       String

  student         Student
  linkedCase      Case?
}
```

**Indexes**: [studentId, date], behaviourArea, isPositive, linkedCaseId

**Usage**: Friendship and character observations

**Example**:
```typescript
// Concerning behavior
await prisma.socialBehaviourRecording.create({
  data: {
    studentId: 'student-031',
    date: '2025-10-09',
    title: 'Social isolation observed',
    description: 'Student eating alone at recess for 4th consecutive day',
    behaviourArea: 'friendship',
    context: 'Recess',
    isPositive: false,
    concernLevel: 'medium',
    visibility: 'STAFF',
    tags: 'social,friendship,wellbeing',
    createdBy: 'teacher-123'
  }
})

// Positive behavior
await prisma.socialBehaviourRecording.create({
  data: {
    studentId: 'student-045',
    date: '2025-10-09',
    title: 'Leadership in group project',
    description: 'Demonstrated excellent collaboration and conflict resolution',
    behaviourArea: 'character_observation',
    context: 'Science project',
    peersInvolved: 'Alice, Bob, Charlie',
    isPositive: true,
    visibility: 'STAFF',
    tags: 'positive,leadership,character',
    createdBy: 'teacher-123'
  }
})
```

---

## 💬 Messaging Tables

### Conversation
```prisma
model Conversation {
  id              String
  type            ConversationType  // ONE_TO_ONE, GROUP
  groupName       String?
  studentId       String

  isPinned        Boolean
  isArchived      Boolean
  isMuted         Boolean

  student         Student
  participants    ConversationParticipant[]
  messages        Message[]
}
```

**Indexes**:
- studentId
- type
- updatedAt

### Message
```prisma
model Message {
  id              String
  conversationId  String
  senderId        String
  senderName      String
  senderRole      ParticipantRole
  type            MessageType
  content         String        @db.Text
  status          String

  conversation    Conversation
  attachments     MessageAttachment[]
  readReceipts    MessageReadReceipt[]

  sentAt          DateTime
}
```

**Indexes**:
- [conversationId, sentAt]
- senderId

---

## 🔔 Alerts

### ClassAlert
```prisma
model ClassAlert {
  id           String
  classId      String
  studentId    String?
  type         AlertType
  severity     AlertSeverity
  title        String
  description  String        @db.Text
  status       String

  createdDate  DateTime
  dueDate      DateTime?
  dismissedBy  String?
  dismissedAt  DateTime?

  class        Class
}
```

**Indexes**:
- [classId, status]
- [severity, status]
- createdDate

---

## 🔍 Common Query Patterns

### Get Students by Class
```typescript
const students = await prisma.student.findMany({
  where: {
    enrollments: {
      some: { classId: 'class-5a' }
    }
  },
  include: {
    enrollments: {
      include: { class: true }
    }
  }
})
```

### Get Student Profile (Complete)
```typescript
const student = await prisma.student.findUnique({
  where: { id: 'student-031' },
  include: {
    enrollments: { include: { class: true } },
    attendanceRecords: {
      where: { type: 'DAILY' },
      orderBy: { date: 'desc' },
      take: 30
    },
    academicGrades: {
      where: { published: true },
      orderBy: { gradedDate: 'desc' }
    },
    cases: {
      where: { status: { in: ['ACTIVE', 'MONITORING'] } },
      include: { sessions: true }
    },
    generalRecordings: {
      orderBy: { date: 'desc' },
      take: 20
    }
  }
})
```

### Get Class Performance Statistics
```typescript
const classStats = await prisma.student.findMany({
  where: {
    enrollments: { some: { classId: 'class-5a' } }
  },
  select: {
    id: true,
    name: true,
    overallAverage: true,
    attendanceRate: true,
    academicGrades: {
      where: {
        term: 'Term 1',
        published: true
      }
    }
  }
})

const avgPerformance = classStats.reduce((sum, s) => sum + (s.overallAverage || 0), 0) / classStats.length
const avgAttendance = classStats.reduce((sum, s) => sum + s.attendanceRate, 0) / classStats.length
```

### Get Active Cases for Review
```typescript
const dueForReview = await prisma.case.findMany({
  where: {
    status: 'ACTIVE',
    nextReviewDate: {
      lte: new Date()
    }
  },
  include: {
    student: true,
    sessions: {
      orderBy: { date: 'desc' },
      take: 1
    }
  },
  orderBy: {
    severity: 'desc'
  }
})
```

---

## 🎯 Performance Tips

### Use Select to Limit Fields
```typescript
// ❌ Bad: Fetches all fields
const students = await prisma.student.findMany()

// ✅ Good: Only fetches needed fields
const students = await prisma.student.findMany({
  select: {
    id: true,
    name: true,
    overallAverage: true
  }
})
```

### Use Includes Wisely
```typescript
// ❌ Bad: N+1 query problem
const students = await prisma.student.findMany()
for (const student of students) {
  const grades = await prisma.academicGrade.findMany({
    where: { studentId: student.id }
  })
}

// ✅ Good: Single query with include
const students = await prisma.student.findMany({
  include: {
    academicGrades: true
  }
})
```

### Pagination for Large Lists
```typescript
const students = await prisma.student.findMany({
  skip: (page - 1) * 20,
  take: 20,
  orderBy: { name: 'asc' }
})
```

---

## 📚 Enum Reference

```typescript
enum UserRole {
  TEACHER
  FORM_TEACHER
  HOD
  YEAR_HEAD
}

enum StudentStatus {
  NONE
  GEP    // Gifted Education Programme
  SEN    // Special Educational Needs
  SWAN   // Students With Additional Needs
}

enum ConductGrade {
  EXCELLENT
  ABOVE_AVERAGE
  AVERAGE
  NEEDS_IMPROVEMENT
}

enum AttendanceType {
  DAILY
  CCA
  SCHOOL_EVENT
  EARLY_DISMISSAL
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

enum AssessmentType {
  ASSIGNMENT
  QUIZ
  EXAM
  PROJECT
  PRACTICAL
}

enum CaseType {
  DISCIPLINE
  SEN
  COUNSELLING
  CAREER_GUIDANCE
}

enum CaseSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum CaseStatus {
  ACTIVE
  MONITORING
  RESOLVED
  CLOSED
}

enum RecordCategory {
  ATTENDANCE
  PERFORMANCE
  BACKGROUND
  SOCIAL_BEHAVIOUR
}

enum RecordVisibility {
  PRIVATE      // Teacher only
  STAFF        // All staff
  PARENT       // Shared with parents
  STUDENT      // Visible to student
}
```

---

**Last Updated**: 2025-10-09
