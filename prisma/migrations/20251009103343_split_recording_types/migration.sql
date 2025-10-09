/*
  Warnings:

  - You are about to drop the `GeneralRecording` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `ConversationParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `userName` on the `ConversationParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `parentEmail` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parentName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `parentPhone` on the `Student` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "GeneralRecording_createdAt_idx";

-- DropIndex
DROP INDEX "GeneralRecording_linkedCaseId_idx";

-- DropIndex
DROP INDEX "GeneralRecording_category_subType_idx";

-- DropIndex
DROP INDEX "GeneralRecording_studentId_date_idx";

-- DropIndex
DROP INDEX "GeneralRecording_studentId_category_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "GeneralRecording";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "hashedPassword" TEXT,
    "lastLogin" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StudentParent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudentParent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentParent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceDataRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "observationType" TEXT NOT NULL,
    "frequency" TEXT,
    "impact" TEXT,
    "parentContacted" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'STAFF',
    "tags" TEXT NOT NULL,
    "linkedCaseId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttendanceDataRecording_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AttendanceDataRecording_linkedCaseId_fkey" FOREIGN KEY ("linkedCaseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceDataRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "performanceArea" TEXT NOT NULL,
    "subject" TEXT,
    "trend" TEXT,
    "previousLevel" TEXT,
    "currentLevel" TEXT,
    "concernLevel" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'STAFF',
    "tags" TEXT NOT NULL,
    "linkedCaseId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PerformanceDataRecording_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceDataRecording_linkedCaseId_fkey" FOREIGN KEY ("linkedCaseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BackgroundDataRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "backgroundArea" TEXT NOT NULL,
    "severity" TEXT,
    "actionRequired" BOOLEAN NOT NULL DEFAULT false,
    "actionTaken" TEXT,
    "referredTo" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'STAFF',
    "tags" TEXT NOT NULL,
    "linkedCaseId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BackgroundDataRecording_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BackgroundDataRecording_linkedCaseId_fkey" FOREIGN KEY ("linkedCaseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SocialBehaviourRecording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "behaviourArea" TEXT NOT NULL,
    "context" TEXT,
    "peersInvolved" TEXT,
    "isPositive" BOOLEAN NOT NULL DEFAULT true,
    "concernLevel" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'STAFF',
    "tags" TEXT NOT NULL,
    "linkedCaseId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialBehaviourRecording_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SocialBehaviourRecording_linkedCaseId_fkey" FOREIGN KEY ("linkedCaseId") REFERENCES "Case" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConversationParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastReadAt" DATETIME,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teacherId" TEXT,
    "parentId" TEXT,
    CONSTRAINT "ConversationParticipant_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationParticipant_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationParticipant_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConversationParticipant" ("conversationId", "id", "joinedAt", "lastReadAt", "unreadCount", "userType") SELECT "conversationId", "id", "joinedAt", "lastReadAt", "unreadCount", "userType" FROM "ConversationParticipant";
DROP TABLE "ConversationParticipant";
ALTER TABLE "new_ConversationParticipant" RENAME TO "ConversationParticipant";
CREATE INDEX "ConversationParticipant_teacherId_idx" ON "ConversationParticipant"("teacherId");
CREATE INDEX "ConversationParticipant_parentId_idx" ON "ConversationParticipant"("parentId");
CREATE INDEX "ConversationParticipant_conversationId_idx" ON "ConversationParticipant"("conversationId");
CREATE UNIQUE INDEX "ConversationParticipant_conversationId_teacherId_parentId_key" ON "ConversationParticipant"("conversationId", "teacherId", "parentId");
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "yearLevel" INTEGER NOT NULL,
    "className" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NONE',
    "conductGrade" TEXT NOT NULL DEFAULT 'AVERAGE',
    "avatar" TEXT,
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
INSERT INTO "new_Student" ("attendanceRate", "avatar", "className", "conductGrade", "createdAt", "deletedAt", "email", "familyBackground", "friends", "hasDisciplinaryIssues", "hasMedicalConditions", "hasSEN", "healthDeclaration", "housingFinance", "id", "isActive", "lastUpdatedPerformance", "mentalWellnessNotes", "name", "needsCounselling", "overallAverage", "status", "updatedAt", "yearLevel") SELECT "attendanceRate", "avatar", "className", "conductGrade", "createdAt", "deletedAt", "email", "familyBackground", "friends", "hasDisciplinaryIssues", "hasMedicalConditions", "hasSEN", "healthDeclaration", "housingFinance", "id", "isActive", "lastUpdatedPerformance", "mentalWellnessNotes", "name", "needsCounselling", "overallAverage", "status", "updatedAt", "yearLevel" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
CREATE INDEX "Student_name_idx" ON "Student"("name");
CREATE INDEX "Student_yearLevel_idx" ON "Student"("yearLevel");
CREATE INDEX "Student_status_idx" ON "Student"("status");
CREATE INDEX "Student_className_idx" ON "Student"("className");
CREATE INDEX "Student_overallAverage_idx" ON "Student"("overallAverage");
CREATE INDEX "Student_attendanceRate_idx" ON "Student"("attendanceRate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE INDEX "Parent_email_idx" ON "Parent"("email");

-- CreateIndex
CREATE INDEX "Parent_phone_idx" ON "Parent"("phone");

-- CreateIndex
CREATE INDEX "StudentParent_studentId_idx" ON "StudentParent"("studentId");

-- CreateIndex
CREATE INDEX "StudentParent_parentId_idx" ON "StudentParent"("parentId");

-- CreateIndex
CREATE INDEX "StudentParent_isPrimary_idx" ON "StudentParent"("isPrimary");

-- CreateIndex
CREATE UNIQUE INDEX "StudentParent_studentId_parentId_key" ON "StudentParent"("studentId", "parentId");

-- CreateIndex
CREATE INDEX "AttendanceDataRecording_studentId_date_idx" ON "AttendanceDataRecording"("studentId", "date");

-- CreateIndex
CREATE INDEX "AttendanceDataRecording_linkedCaseId_idx" ON "AttendanceDataRecording"("linkedCaseId");

-- CreateIndex
CREATE INDEX "AttendanceDataRecording_createdAt_idx" ON "AttendanceDataRecording"("createdAt");

-- CreateIndex
CREATE INDEX "PerformanceDataRecording_studentId_date_idx" ON "PerformanceDataRecording"("studentId", "date");

-- CreateIndex
CREATE INDEX "PerformanceDataRecording_performanceArea_idx" ON "PerformanceDataRecording"("performanceArea");

-- CreateIndex
CREATE INDEX "PerformanceDataRecording_linkedCaseId_idx" ON "PerformanceDataRecording"("linkedCaseId");

-- CreateIndex
CREATE INDEX "PerformanceDataRecording_createdAt_idx" ON "PerformanceDataRecording"("createdAt");

-- CreateIndex
CREATE INDEX "BackgroundDataRecording_studentId_date_idx" ON "BackgroundDataRecording"("studentId", "date");

-- CreateIndex
CREATE INDEX "BackgroundDataRecording_backgroundArea_idx" ON "BackgroundDataRecording"("backgroundArea");

-- CreateIndex
CREATE INDEX "BackgroundDataRecording_linkedCaseId_idx" ON "BackgroundDataRecording"("linkedCaseId");

-- CreateIndex
CREATE INDEX "BackgroundDataRecording_actionRequired_idx" ON "BackgroundDataRecording"("actionRequired");

-- CreateIndex
CREATE INDEX "BackgroundDataRecording_createdAt_idx" ON "BackgroundDataRecording"("createdAt");

-- CreateIndex
CREATE INDEX "SocialBehaviourRecording_studentId_date_idx" ON "SocialBehaviourRecording"("studentId", "date");

-- CreateIndex
CREATE INDEX "SocialBehaviourRecording_behaviourArea_idx" ON "SocialBehaviourRecording"("behaviourArea");

-- CreateIndex
CREATE INDEX "SocialBehaviourRecording_linkedCaseId_idx" ON "SocialBehaviourRecording"("linkedCaseId");

-- CreateIndex
CREATE INDEX "SocialBehaviourRecording_isPositive_idx" ON "SocialBehaviourRecording"("isPositive");

-- CreateIndex
CREATE INDEX "SocialBehaviourRecording_createdAt_idx" ON "SocialBehaviourRecording"("createdAt");
