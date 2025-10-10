-- Migration: Row Level Security (RLS) Policies
-- Description: Security policies for multi-tenant teacher access control

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_private_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_fitness ENABLE ROW LEVEL SECURITY;
ALTER TABLE cce_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE behaviour_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Check if teacher teaches student
-- =====================================================
CREATE OR REPLACE FUNCTION teacher_has_access_to_student(teacher_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM students s
    JOIN student_classes sc ON s.id = sc.student_id
    JOIN teacher_classes tc ON sc.class_id = tc.class_id
    WHERE s.id = student_uuid
      AND tc.teacher_id = teacher_uuid
      AND sc.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Check if teacher is form teacher of student
-- =====================================================
CREATE OR REPLACE FUNCTION teacher_is_form_teacher(teacher_uuid UUID, student_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM students
    WHERE id = student_uuid
      AND form_teacher_id = teacher_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TEACHERS TABLE POLICIES
-- =====================================================

-- Teachers can view all teachers
CREATE POLICY "Teachers can view all teachers"
  ON teachers FOR SELECT
  USING (true);

-- Teachers can update their own profile
CREATE POLICY "Teachers can update own profile"
  ON teachers FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- CLASSES TABLE POLICIES
-- =====================================================

-- Teachers can view all classes
CREATE POLICY "Teachers can view all classes"
  ON classes FOR SELECT
  USING (true);

-- =====================================================
-- TEACHER_CLASSES TABLE POLICIES
-- =====================================================

-- Teachers can view their own assignments
CREATE POLICY "Teachers can view class assignments"
  ON teacher_classes FOR SELECT
  USING (true);

-- =====================================================
-- STUDENTS TABLE POLICIES
-- =====================================================

-- Teachers can view students they teach or are form teacher of
CREATE POLICY "Teachers can view assigned students"
  ON students FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), id)
    OR teacher_is_form_teacher(auth.uid(), id)
  );

-- Form teachers can update their students
CREATE POLICY "Form teachers can update students"
  ON students FOR UPDATE
  USING (teacher_is_form_teacher(auth.uid(), id));

-- =====================================================
-- PARENTS_GUARDIANS TABLE POLICIES
-- =====================================================

-- Teachers can view guardians of students they have access to
CREATE POLICY "Teachers can view guardians of assigned students"
  ON parents_guardians FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM student_guardians sg
      JOIN students s ON sg.student_id = s.id
      WHERE sg.guardian_id = parents_guardians.id
        AND (
          teacher_has_access_to_student(auth.uid(), s.id)
          OR teacher_is_form_teacher(auth.uid(), s.id)
        )
    )
  );

-- Form teachers can add/update guardians for their students
CREATE POLICY "Form teachers can manage guardians"
  ON parents_guardians FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM student_guardians sg
      JOIN students s ON sg.student_id = s.id
      WHERE sg.guardian_id = parents_guardians.id
        AND teacher_is_form_teacher(auth.uid(), s.id)
    )
  );

-- =====================================================
-- STUDENT_GUARDIANS TABLE POLICIES
-- =====================================================

-- Teachers can view guardian relationships for students they have access to
CREATE POLICY "Teachers can view guardian relationships"
  ON student_guardians FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- =====================================================
-- STUDENT_CLASSES TABLE POLICIES
-- =====================================================

-- Teachers can view student enrollments
CREATE POLICY "Teachers can view student enrollments"
  ON student_classes FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- =====================================================
-- STUDENT_OVERVIEW TABLE POLICIES
-- =====================================================

-- Teachers can view overview of students they have access to
CREATE POLICY "Teachers can view student overview"
  ON student_overview FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- Form teachers can update student overview
CREATE POLICY "Form teachers can update student overview"
  ON student_overview FOR ALL
  USING (teacher_is_form_teacher(auth.uid(), student_id));

-- =====================================================
-- STUDENT_PRIVATE_NOTES TABLE POLICIES
-- =====================================================

-- Teachers can view notes they created
CREATE POLICY "Teachers can view own private notes"
  ON student_private_notes FOR SELECT
  USING (created_by = auth.uid());

-- Form teachers can view ALL private notes for their students
CREATE POLICY "Form teachers can view all private notes for their students"
  ON student_private_notes FOR SELECT
  USING (teacher_is_form_teacher(auth.uid(), student_id));

-- Teachers can create private notes for students they have access to
CREATE POLICY "Teachers can create private notes"
  ON student_private_notes FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      teacher_has_access_to_student(auth.uid(), student_id)
      OR teacher_is_form_teacher(auth.uid(), student_id)
    )
  );

-- Teachers can update/delete their own notes
CREATE POLICY "Teachers can update own private notes"
  ON student_private_notes FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete own private notes"
  ON student_private_notes FOR DELETE
  USING (created_by = auth.uid());

-- =====================================================
-- ATTENDANCE, ACADEMIC_RESULTS, PHYSICAL_FITNESS, CCE_RESULTS
-- Similar pattern: Teachers can view/edit for students they have access to
-- =====================================================

-- ATTENDANCE
CREATE POLICY "Teachers can view attendance"
  ON attendance FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Teachers can manage attendance"
  ON attendance FOR ALL
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- ACADEMIC_RESULTS
CREATE POLICY "Teachers can view academic results"
  ON academic_results FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Teachers can manage academic results"
  ON academic_results FOR ALL
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- PHYSICAL_FITNESS
CREATE POLICY "Teachers can view physical fitness"
  ON physical_fitness FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Teachers can manage physical fitness"
  ON physical_fitness FOR ALL
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- CCE_RESULTS
CREATE POLICY "Teachers can view CCE results"
  ON cce_results FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Form teachers can manage CCE results"
  ON cce_results FOR ALL
  USING (teacher_is_form_teacher(auth.uid(), student_id));

-- =====================================================
-- FRIEND_RELATIONSHIPS & BEHAVIOUR_OBSERVATIONS
-- =====================================================

CREATE POLICY "Teachers can view friend relationships"
  ON friend_relationships FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Teachers can manage friend relationships"
  ON friend_relationships FOR ALL
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Teachers can view behaviour observations"
  ON behaviour_observations FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Teachers can create behaviour observations"
  ON behaviour_observations FOR INSERT
  WITH CHECK (
    observed_by = auth.uid()
    AND (
      teacher_has_access_to_student(auth.uid(), student_id)
      OR teacher_is_form_teacher(auth.uid(), student_id)
    )
  );

CREATE POLICY "Teachers can update own behaviour observations"
  ON behaviour_observations FOR UPDATE
  USING (observed_by = auth.uid());

-- =====================================================
-- CASES & CASE_ISSUES
-- =====================================================

CREATE POLICY "Teachers can view cases"
  ON cases FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
    OR created_by = auth.uid()
    OR assigned_to = auth.uid()
  );

CREATE POLICY "Teachers can create cases"
  ON cases FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND (
      teacher_has_access_to_student(auth.uid(), student_id)
      OR teacher_is_form_teacher(auth.uid(), student_id)
    )
  );

CREATE POLICY "Case owners and form teachers can update cases"
  ON cases FOR UPDATE
  USING (
    created_by = auth.uid()
    OR assigned_to = auth.uid()
    OR teacher_is_form_teacher(auth.uid(), student_id)
  );

-- CASE_ISSUES
CREATE POLICY "Teachers can view case issues"
  ON case_issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_issues.case_id
        AND (
          teacher_has_access_to_student(auth.uid(), c.student_id)
          OR teacher_is_form_teacher(auth.uid(), c.student_id)
          OR c.created_by = auth.uid()
          OR c.assigned_to = auth.uid()
        )
    )
  );

CREATE POLICY "Teachers can create case issues"
  ON case_issues FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = case_issues.case_id
        AND (
          c.created_by = auth.uid()
          OR c.assigned_to = auth.uid()
          OR teacher_is_form_teacher(auth.uid(), c.student_id)
        )
    )
  );

CREATE POLICY "Issue creators can update their issues"
  ON case_issues FOR UPDATE
  USING (created_by = auth.uid());

-- =====================================================
-- REPORTS & REPORT_COMMENTS
-- =====================================================

CREATE POLICY "Teachers can view reports"
  ON reports FOR SELECT
  USING (
    teacher_has_access_to_student(auth.uid(), student_id)
    OR teacher_is_form_teacher(auth.uid(), student_id)
    OR created_by = auth.uid()
  );

CREATE POLICY "Form teachers can create reports"
  ON reports FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND teacher_is_form_teacher(auth.uid(), student_id)
  );

CREATE POLICY "Report creators can update their reports"
  ON reports FOR UPDATE
  USING (created_by = auth.uid());

-- REPORT_COMMENTS
CREATE POLICY "Teachers can view report comments"
  ON report_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_comments.report_id
        AND (
          teacher_has_access_to_student(auth.uid(), r.student_id)
          OR teacher_is_form_teacher(auth.uid(), r.student_id)
          OR r.created_by = auth.uid()
        )
    )
  );

CREATE POLICY "Teachers can comment on reports they have access to"
  ON report_comments FOR INSERT
  WITH CHECK (
    commenter_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM reports r
      WHERE r.id = report_comments.report_id
        AND (
          teacher_has_access_to_student(auth.uid(), r.student_id)
          OR teacher_is_form_teacher(auth.uid(), r.student_id)
        )
    )
  );

CREATE POLICY "Commenters can update own comments"
  ON report_comments FOR UPDATE
  USING (commenter_id = auth.uid());

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON POLICY "Teachers can view assigned students" ON students IS 'Teachers can only view students in their assigned classes or students they are form teacher for';
COMMENT ON POLICY "Teachers can view own private notes" ON student_private_notes IS 'Teachers can view private notes they created';
COMMENT ON POLICY "Form teachers can view all private notes for their students" ON student_private_notes IS 'Form teachers have full visibility of all private notes for their students';
