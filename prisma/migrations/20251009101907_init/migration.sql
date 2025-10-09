-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "avatar" TEXT,
    "classesAssigned" TEXT NOT NULL,
    "formClassId" TEXT,
    "ccaClassIds" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "className" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "yearLevel" INTEGER NOT NULL,
    "academicYear" TEXT NOT NULL,
    "isFormClass" BOOLEAN NOT NULL DEFAULT false,
    "teacherId" TEXT NOT NULL,
    "formTeacherId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Class_formTeacherId_fkey" FOREIGN KEY ("formTeacherId") REFERENCES "Teacher" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    CONSTRAINT "ClassSchedule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "yearLevel" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NONE',
    "conductGrade" TEXT NOT NULL DEFAULT 'AVERAGE',
    "avatar" TEXT,
    "parentName" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "parentPhone" TEXT NOT NULL,
    "familyBackground" TEXT,
    "housingFinance" TEXT,
    "healthDeclaration" TEXT,
    "mentalWellnessNotes" TEXT,
    "friends" TEXT NOT NULL,
    "hasMedicalConditions" BOOLEAN NOT NULL DEFAULT false,
    "needsCounselling" BOOLEAN NOT NULL DEFAULT false,
    "hasDisciplinaryIssues" BOOLEAN NOT NULL DEFAULT false,
    "hasSEN" BOOLEAN NOT NULL DEFAULT false,
    "overallAverage" REAL,
    "attendanceRate" REAL NOT NULL DEFAULT 100.0,
    "lastUpdatedPerformance" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClassEnrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "type" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "ccaName" TEXT,
    "eventName" TEXT,
    "dismissalTime" TEXT,
    "dismissalReason" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentNotified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "AttendanceRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceRecord_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcademicGrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "assessmentName" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "maxScore" REAL NOT NULL,
    "percentage" REAL NOT NULL,
    "letterGrade" TEXT,
    "weightage" REAL NOT NULL DEFAULT 1.0,
    "term" TEXT,
    "academicYear" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "comments" TEXT,
    "gradedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedBy" TEXT NOT NULL,
    CONSTRAINT "AcademicGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AcademicGrade_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CCAPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "ccaName" TEXT NOT NULL,
    "ccaType" TEXT NOT NULL,
    "attendanceRate" REAL,
    "participation" TEXT,
    "achievements" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "grade" TEXT,
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CCAPerformance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhysicalFitnessRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "testDate" TEXT NOT NULL,
    "overallGrade" TEXT,
    "tests" TEXT NOT NULL,
    "remarks" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhysicalFitnessRecord_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CCEGrade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "observations" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CCEGrade_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "openedDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedBy" TEXT NOT NULL,
    "closedDate" DATETIME,
    "closedBy" TEXT,
    "resolution" TEXT,
    "caseOwner" TEXT NOT NULL,
    "caseTeam" TEXT NOT NULL,
    "nextReviewDate" DATETIME,
    "lastReviewDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Case_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "caseId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "sessionType" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER,
    "attendees" TEXT NOT NULL,
    "discussion" TEXT,
    "interventions" TEXT NOT NULL,
    "progress" TEXT,
    "nextSteps" TEXT NOT NULL,
    "conductedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseSession_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneralRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'STAFF',
    "tags" TEXT NOT NULL,
    "linkedCaseId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GeneralRecording_linkedCaseId_fkey" FOREIGN KEY ("linkedCaseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "GeneralRecording_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClassAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "studentId" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "dismissedBy" TEXT,
    "dismissedAt" DATETIME,
    CONSTRAINT "ClassAlert_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "groupName" TEXT,
    "studentId" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConversationParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" DATETIME,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderRole" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    CONSTRAINT "MessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageReadReceipt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MessageReadReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "Teacher_email_idx" ON "Teacher"("email");

-- CreateIndex
CREATE INDEX "Teacher_department_idx" ON "Teacher"("department");

-- CreateIndex
CREATE INDEX "Class_yearLevel_className_idx" ON "Class"("yearLevel", "className");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "Class_academicYear_idx" ON "Class"("academicYear");

-- CreateIndex
CREATE INDEX "ClassSchedule_classId_day_idx" ON "ClassSchedule"("classId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_name_idx" ON "Student"("name");

-- CreateIndex
CREATE INDEX "Student_yearLevel_idx" ON "Student"("yearLevel");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_className_idx" ON "Student"("className");

-- CreateIndex
CREATE INDEX "Student_overallAverage_idx" ON "Student"("overallAverage");

-- CreateIndex
CREATE INDEX "Student_attendanceRate_idx" ON "Student"("attendanceRate");

-- CreateIndex
CREATE INDEX "ClassEnrollment_studentId_idx" ON "ClassEnrollment"("studentId");

-- CreateIndex
CREATE INDEX "ClassEnrollment_classId_idx" ON "ClassEnrollment"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassEnrollment_studentId_classId_key" ON "ClassEnrollment"("studentId", "classId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_studentId_type_date_idx" ON "AttendanceRecord"("studentId", "type", "date");

-- CreateIndex
CREATE INDEX "AttendanceRecord_date_status_idx" ON "AttendanceRecord"("date", "status");

-- CreateIndex
CREATE INDEX "AttendanceRecord_type_idx" ON "AttendanceRecord"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_studentId_type_date_key" ON "AttendanceRecord"("studentId", "type", "date");

-- CreateIndex
CREATE INDEX "AcademicGrade_studentId_subject_academicYear_idx" ON "AcademicGrade"("studentId", "subject", "academicYear");

-- CreateIndex
CREATE INDEX "AcademicGrade_studentId_term_idx" ON "AcademicGrade"("studentId", "term");

-- CreateIndex
CREATE INDEX "AcademicGrade_classId_subject_idx" ON "AcademicGrade"("classId", "subject");

-- CreateIndex
CREATE INDEX "AcademicGrade_gradedDate_idx" ON "AcademicGrade"("gradedDate");

-- CreateIndex
CREATE INDEX "AcademicGrade_published_idx" ON "AcademicGrade"("published");

-- CreateIndex
CREATE INDEX "CCAPerformance_studentId_academicYear_idx" ON "CCAPerformance"("studentId", "academicYear");

-- CreateIndex
CREATE INDEX "CCAPerformance_ccaName_idx" ON "CCAPerformance"("ccaName");

-- CreateIndex
CREATE INDEX "PhysicalFitnessRecord_studentId_testDate_idx" ON "PhysicalFitnessRecord"("studentId", "testDate");

-- CreateIndex
CREATE INDEX "CCEGrade_studentId_term_idx" ON "CCEGrade"("studentId", "term");

-- CreateIndex
CREATE INDEX "CCEGrade_academicYear_idx" ON "CCEGrade"("academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_studentId_status_idx" ON "Case"("studentId", "status");

-- CreateIndex
CREATE INDEX "Case_type_status_idx" ON "Case"("type", "status");

-- CreateIndex
CREATE INDEX "Case_caseNumber_idx" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_openedDate_idx" ON "Case"("openedDate");

-- CreateIndex
CREATE INDEX "Case_nextReviewDate_idx" ON "Case"("nextReviewDate");

-- CreateIndex
CREATE INDEX "CaseSession_caseId_date_idx" ON "CaseSession"("caseId", "date");

-- CreateIndex
CREATE INDEX "CaseSession_date_idx" ON "CaseSession"("date");

-- CreateIndex
CREATE INDEX "GeneralRecording_studentId_category_idx" ON "GeneralRecording"("studentId", "category");

-- CreateIndex
CREATE INDEX "GeneralRecording_studentId_date_idx" ON "GeneralRecording"("studentId", "date");

-- CreateIndex
CREATE INDEX "GeneralRecording_category_subType_idx" ON "GeneralRecording"("category", "subType");

-- CreateIndex
CREATE INDEX "GeneralRecording_linkedCaseId_idx" ON "GeneralRecording"("linkedCaseId");

-- CreateIndex
CREATE INDEX "GeneralRecording_createdAt_idx" ON "GeneralRecording"("createdAt");

-- CreateIndex
CREATE INDEX "ClassAlert_classId_status_idx" ON "ClassAlert"("classId", "status");

-- CreateIndex
CREATE INDEX "ClassAlert_severity_status_idx" ON "ClassAlert"("severity", "status");

-- CreateIndex
CREATE INDEX "ClassAlert_createdDate_idx" ON "ClassAlert"("createdDate");

-- CreateIndex
CREATE INDEX "Conversation_studentId_idx" ON "Conversation"("studentId");

-- CreateIndex
CREATE INDEX "Conversation_type_idx" ON "Conversation"("type");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE INDEX "ConversationParticipant_userId_idx" ON "ConversationParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_userId_key" ON "ConversationParticipant"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_sentAt_idx" ON "Message"("conversationId", "sentAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "MessageAttachment_messageId_idx" ON "MessageAttachment"("messageId");

-- CreateIndex
CREATE INDEX "MessageReadReceipt_messageId_idx" ON "MessageReadReceipt"("messageId");

-- CreateIndex
CREATE INDEX "MessageReadReceipt_userId_idx" ON "MessageReadReceipt"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReadReceipt_messageId_userId_key" ON "MessageReadReceipt"("messageId", "userId");
