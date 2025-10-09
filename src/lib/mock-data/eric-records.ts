/**
 * Comprehensive Student Records for Eric Lim
 * SWAN (Student With Additional Needs) Case - SEC/Wellbeing Monitoring
 *
 * Scenario: Mr. Tan is preparing for a sensitive PTM with Eric's parents.
 * Eric has recently been identified as a SWAN and is under SEC monitoring.
 * Mr. Tan needs to review family background, friendship history, and termly
 * check-ins to prepare thoughtful, supportive HDP comments.
 */

import type { StudentRecord } from '@/types/student-records'

export const ericStudentRecords: StudentRecord[] = [
  // ===============================================
  // RECENT: PTM PREPARATION (30 days before PTM)
  // ===============================================
  {
    id: 'eric-rec-001',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'teacher-notes',
    title: '🔒 PTM Prep - Private Notes (30 Days Before)',
    description:
      'PRIVATE: Preparing for sensitive PTM discussion with Dr. & Mrs. Lim. Eric\'s recent family changes require careful, supportive approach.',
    date: '2025-01-15',
    createdBy: 'Daniel Tan',
    createdAt: '2025-01-15T14:30:00',
    status: 'draft', // Private draft - not in HDP
    visibility: 'self', // Only teacher can see
    tags: ['ptm-prep', 'sensitive', 'family-background', 'swan'],
    data: {
      subType: 'teacher-notes',
      notes: [
        '✓ Review family background changes (recent marital issues mentioned in Feb check-in)',
        '✓ Check friendship circle - still only Daniel Koh, feeling isolated',
        '✓ Coordinate with Ms. Wong (school counselor) before PTM',
        '✓ Prepare speaking points - avoid writing sensitive family details on HDP',
        '✓ Focus on Eric\'s strengths first, then gently address emotional wellbeing',
        '✓ Reminder: Parents have very high expectations - may contribute to anxiety',
        '✓ Suggest family counseling resources if appropriate',
        '⚠️ Double-check: Has Eric consented to sharing counseling details with parents?',
      ],
      actionRequired: true,
      followUpDate: '2025-02-14', // PTM date
      sensitivity: 'high',
      concernLevel: 'medium-high',
    },
  },

  // ===============================================
  // TERM 1 2025: TERMLY CHECK-IN (Jan 2025)
  // ===============================================
  {
    id: 'eric-rec-002',
    studentId: 'student-031',
    type: 'profile',
    subType: 'wellbeing-checkin',
    title: 'Term 1 Wellbeing Check-In',
    description:
      'Termly 1-on-1 check-in with Eric. Discussed friendship difficulties, family situation, and coping strategies.',
    date: '2025-01-12',
    createdBy: 'Daniel Tan',
    createdAt: '2025-01-12T10:30:00',
    status: 'published',
    visibility: 'staff', // Visible to SEC team, counselor
    tags: ['termly-checkin', 'wellbeing', 'friendship', 'family-situation'],
    data: {
      subType: 'wellbeing-checkin',
      moodRating: 3, // 1-5 scale, 3 = neutral/ok
      concerns: [
        'Friendship difficulties - still feeling isolated, only close to Daniel Koh',
        'Family situation causing stress - mentioned parents arguing more',
        'Anxiety about upcoming exams - pressure from parents',
        'Eating alone at lunch more frequently',
      ],
      strengths: [
        'Willing to open up in 1-on-1 settings',
        'Shows maturity in understanding his feelings',
        'Engaged in art and quiet reading activities',
      ],
      actionTaken:
        'Scheduled follow-up counseling session with Ms. Wong. Reminded Eric of coping strategies from previous sessions.',
      followUpRequired: true,
      followUpDate: '2025-02-12',
      parentNotified: false, // Sensitive info - discuss at PTM
    },
  },

  {
    id: 'eric-rec-003',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'counseling',
    title: 'Counseling Session #8 - Coping with Family Stress',
    description:
      'Session focused on developing coping mechanisms for family-related anxiety. Eric shared feelings about parental expectations.',
    date: '2025-01-10',
    createdBy: 'Sarah Wong (School Counselor)',
    createdAt: '2025-01-10T14:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['counseling', 'anxiety', 'family-stress', 'coping-strategies'],
    data: {
      subType: 'counseling',
      sessionNumber: 8,
      duration: 45, // minutes
      focusAreas: ['Family dynamics', 'Academic pressure', 'Anxiety management'],
      techniques: ['CBT breathing exercises', 'Thought reframing', 'Journaling'],
      keyInsights:
        'Eric expressed feeling "never good enough" compared to older sibling. Anxiety increases when report card discussions come up at home.',
      progressNotes:
        'Making progress with breathing techniques. Still struggles with negative self-talk when comparing to sibling.',
      homeworkAssigned: 'Daily mood journaling, practice breathing exercises when anxious',
      nextSession: '2025-01-24',
      concernLevel: 'medium',
    },
  },

  // ===============================================
  // DEC 2024: DECLINING ACADEMIC ENGAGEMENT
  // ===============================================
  {
    id: 'eric-rec-004',
    studentId: 'student-031',
    type: 'performance',
    subType: 'academic-concerns',
    title: 'Academic Decline - End of Year Exams',
    description:
      'Eric\'s EOY exam results show significant decline from previous strong performance. Intervention required.',
    date: '2024-12-15',
    createdBy: 'Daniel Tan',
    createdAt: '2024-12-15T16:00:00',
    status: 'published',
    visibility: 'parent', // Shared with parents
    tags: ['academic-decline', 'intervention-needed', 'eoy-exams'],
    data: {
      subType: 'academic-concerns',
      previousAverage: 78, // Term 2 average
      currentAverage: 64, // EOY average
      decline: -14, // percentage points
      subjectsAffected: [
        { subject: 'English', previous: 82, current: 65, decline: -17 },
        { subject: 'Mathematics', previous: 85, current: 68, decline: -17 },
        { subject: 'Science', previous: 80, current: 62, decline: -18 },
        { subject: 'Chinese', previous: 70, current: 60, decline: -10 },
        { subject: 'Humanities', previous: 75, current: 64, decline: -11 },
      ],
      possibleCauses: [
        'Emotional wellbeing concerns (anxiety, low mood)',
        'Family stressors affecting concentration',
        'Decreased class participation and homework completion',
      ],
      interventionPlan:
        'Continue SEC monitoring, academic support sessions offered, coordinate with parents at PTM',
      concernLevel: 'high',
    },
  },

  {
    id: 'eric-rec-005',
    studentId: 'student-031',
    type: 'performance',
    subType: 'behavioral',
    title: 'Behavioral Observation - Withdrawal Increasing',
    description:
      'Eric increasingly withdrawn in class. Avoids group activities, eats alone, minimal participation.',
    date: '2024-12-08',
    createdBy: 'Daniel Tan',
    createdAt: '2024-12-08T11:30:00',
    status: 'published',
    visibility: 'staff',
    tags: ['behavioral-concern', 'withdrawal', 'social-isolation'],
    data: {
      subType: 'behavioral',
      observations: [
        'Sits at back of class, avoids eye contact',
        'Opts out of group work whenever possible',
        'Eating lunch alone in library more frequently',
        'Minimal participation in class discussions (previously more engaged)',
        'Appears tired, lacks energy',
      ],
      frequency: 'Daily - pattern increasing over past month',
      impact: 'Affecting academic engagement and peer relationships',
      actionTaken: 'Discussed with SEC team, increased monitoring, counseling referral made',
      concernLevel: 'medium-high',
    },
  },

  // ===============================================
  // NOV 2024: COUNSELING SESSIONS & HEALTH VISITS
  // ===============================================
  {
    id: 'eric-rec-006',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'counseling',
    title: 'Counseling Session #7 - Social Difficulties',
    description:
      'Session focused on friendship challenges and feelings of isolation. Eric expressed difficulty connecting with peers.',
    date: '2024-11-28',
    createdBy: 'Sarah Wong (School Counselor)',
    createdAt: '2024-11-28T14:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['counseling', 'social-difficulties', 'isolation', 'friendship'],
    data: {
      subType: 'counseling',
      sessionNumber: 7,
      duration: 45,
      focusAreas: ['Peer relationships', 'Social anxiety', 'Self-esteem'],
      techniques: ['Role-playing social interactions', 'Identifying negative thought patterns'],
      keyInsights:
        'Eric worries about being judged by peers. Feels he doesn\'t fit in. Only comfortable with Daniel Koh.',
      progressNotes:
        'Some progress in identifying anxious thoughts, but still avoiding social situations.',
      homeworkAssigned: 'Try saying hello to one classmate per day, journal feelings after',
      nextSession: '2024-12-12',
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-007',
    studentId: 'student-031',
    type: 'attendance',
    subType: 'medical',
    title: 'Nurse Visit - Stress-Related Complaints',
    description:
      'Eric visited school nurse complaining of headache and stomach ache. No fever or physical symptoms.',
    date: '2024-11-25',
    createdBy: 'School Nurse',
    createdAt: '2024-11-25T10:15:00',
    status: 'published',
    visibility: 'staff',
    tags: ['health-visit', 'stress-related', 'psychosomatic'],
    data: {
      subType: 'medical',
      complaints: ['Headache', 'Stomach ache'],
      vitals: {
        temperature: '36.5°C',
        bloodPressure: 'Normal',
      },
      assessment: 'No fever or physical illness. Symptoms appear stress-related.',
      treatment: 'Rest for 15 minutes, offered water, discussed relaxation techniques',
      followUp: 'Referred to school counselor for ongoing anxiety management',
      frequency: 'This is the 4th visit this term with similar complaints',
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-008',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'counseling',
    title: 'Counseling Session #6 - Family Expectations',
    description:
      'Discussion about academic pressure from parents and constant comparison with older sibling.',
    date: '2024-11-14',
    createdBy: 'Sarah Wong (School Counselor)',
    createdAt: '2024-11-14T14:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['counseling', 'family-pressure', 'academic-stress', 'sibling-comparison'],
    data: {
      subType: 'counseling',
      sessionNumber: 6,
      duration: 45,
      focusAreas: ['Family dynamics', 'Academic pressure', 'Self-worth'],
      techniques: ['Cognitive restructuring', 'Strength-based reflection'],
      keyInsights:
        'Eric feels he can never measure up to older sibling (currently in university). Parents frequently make comparisons.',
      progressNotes:
        'Eric able to identify his own strengths (art, creative thinking) but struggles to internalize these. Needs continued support.',
      homeworkAssigned: 'Write down three things he did well each day',
      nextSession: '2024-11-28',
      concernLevel: 'medium-high',
    },
  },

  // ===============================================
  // OCT 2024: INITIAL SWAN IDENTIFICATION
  // ===============================================
  {
    id: 'eric-rec-009',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'sec-case',
    title: 'SWAN Status Activated - Mental Health Support',
    description:
      'Eric officially identified as SWAN (Student With Additional Needs). SEC monitoring initiated for anxiety and social difficulties.',
    date: '2024-10-20',
    createdBy: 'SEC Team (Daniel Tan, Sarah Wong)',
    createdAt: '2024-10-20T15:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['swan', 'sec-monitoring', 'mental-health', 'case-activation'],
    data: {
      subType: 'sec-case',
      caseType: 'Wellbeing/Mental Health',
      category: 'Mental Health (Anxiety/Social Difficulties)',
      severity: 'Medium',
      supportPlan: {
        interventions: [
          'Bi-weekly counseling sessions with school counselor',
          'Termly check-ins with form teacher',
          'Academic support as needed',
          'Peer support buddy system (if Eric agrees)',
          'Family engagement and communication at PTMs',
        ],
        goalsForEric: [
          'Develop coping strategies for anxiety',
          'Build social confidence and peer connections',
          'Improve communication with family about feelings',
          'Maintain academic engagement despite emotional challenges',
        ],
        reviewDate: '2025-03-20', // End of Term 1
      },
      teamMembers: [
        'Daniel Tan (Form Teacher)',
        'Sarah Wong (School Counselor)',
        'Year Head',
        'Parents (to be engaged)',
      ],
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-010',
    studentId: 'student-031',
    type: 'profile',
    subType: 'family',
    title: 'Family Background & Situation Assessment',
    description:
      'Initial family background assessment for SEC case. High-achieving family environment contributing to Eric\'s anxiety.',
    date: '2024-10-15',
    createdBy: 'Sarah Wong (School Counselor)',
    createdAt: '2024-10-15T11:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['family-background', 'assessment', 'high-expectations'],
    data: {
      subType: 'family',
      familyStructure: {
        parents: 'Dr. & Mrs. Lim (both professionals)',
        siblings: '1 older sibling (university student, high achiever)',
        householdType: 'Nuclear family',
      },
      familyDynamics: {
        parentalExpectations: 'Very high - both parents have advanced degrees',
        siblingComparison: 'Frequent comparison with older sibling\'s achievements',
        emotionalSupport: 'Limited - focus primarily on academic performance',
        communicationStyle: 'Achievement-focused, less emotion-focused',
      },
      stressors: [
        'High parental academic expectations',
        'Constant comparison with high-achieving sibling',
        'Financial pressure mentioned (parents work long hours)',
        'Limited quality family time due to work commitments',
        'Recent marital tensions observed (per Eric\'s mentions)',
      ],
      protectiveFactors: [
        'Stable housing and financial situation',
        'Parents care about Eric (express through high expectations)',
        'Good relationship with older sibling (when sibling is home)',
      ],
      recommendations:
        'Family counseling recommended. PTM to address balancing academic expectations with emotional support.',
      concernLevel: 'medium-high',
    },
  },

  // ===============================================
  // SEPT 2024: EARLY INDICATORS & FIRST COUNSELING
  // ===============================================
  {
    id: 'eric-rec-011',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'counseling',
    title: 'Counseling Session #5 - Building Trust',
    description:
      'Early counseling session. Eric gradually opening up about feelings of inadequacy and anxiety.',
    date: '2024-10-10',
    createdBy: 'Sarah Wong (School Counselor)',
    createdAt: '2024-10-10T14:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['counseling', 'trust-building', 'anxiety'],
    data: {
      subType: 'counseling',
      sessionNumber: 5,
      duration: 45,
      focusAreas: ['Anxiety symptoms', 'Self-esteem', 'Academic pressure'],
      techniques: ['Active listening', 'Validation', 'Grounding exercises'],
      keyInsights:
        'Eric experiencing physical symptoms of anxiety (stomach aches, headaches). Worries constantly about disappointing parents.',
      progressNotes:
        'Building rapport well. Eric more comfortable sharing in sessions. Needs continued regular support.',
      homeworkAssigned: 'Practice deep breathing when feeling anxious',
      nextSession: '2024-10-24',
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-012',
    studentId: 'student-031',
    type: 'profile',
    subType: 'friendship',
    title: 'Friendship Circle Assessment',
    description:
      'Assessment of Eric\'s social connections. Small friend circle, primarily Daniel Koh. Feeling isolated.',
    date: '2024-09-28',
    createdBy: 'Daniel Tan',
    createdAt: '2024-09-28T13:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['friendship', 'social-assessment', 'isolation'],
    data: {
      subType: 'friendship',
      closeFriends: ['Daniel Koh'],
      socialCircle: 'Very small - primarily one close friend',
      socialBehaviors: [
        'Quiet and reserved in group settings',
        'Prefers one-on-one interactions',
        'Avoids large group activities',
        'Eats lunch with Daniel or alone',
        'Does not participate in CCAs or after-school activities',
      ],
      concerns: [
        'Limited peer support network',
        'Feelings of isolation increasing',
        'Social anxiety preventing connection with others',
      ],
      strengths: [
        'Has one stable, positive friendship (Daniel)',
        'Kind and respectful with peers',
        'Good listener when comfortable',
      ],
      recommendations:
        'Gradual exposure to small group activities. Consider interest-based groups (art club, reading club).',
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-013',
    studentId: 'student-031',
    type: 'performance',
    subType: 'behavioral',
    title: 'Initial Behavioral Observations - Signs of Withdrawal',
    description:
      'First formal documentation of concerning behavioral patterns. Eric becoming increasingly quiet and withdrawn.',
    date: '2024-09-15',
    createdBy: 'Daniel Tan',
    createdAt: '2024-09-15T16:30:00',
    status: 'published',
    visibility: 'staff',
    tags: ['behavioral-observation', 'early-signs', 'withdrawal'],
    data: {
      subType: 'behavioral',
      observations: [
        'Noticeable decrease in class participation over past month',
        'Often appears tired or distracted',
        'Avoids volunteer answering questions (previously more engaged)',
        'Sits alone when given choice in seating',
        'Body language indicates low energy/mood',
      ],
      comparison: 'Different from beginning of year - Eric was more engaged in Term 1',
      triggers: 'Seems worse after exam results or parent meetings',
      actionTaken: 'Referral to school counselor made, monitoring increased',
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-014',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'counseling',
    title: 'Counseling Session #3 - First Anxiety Discussion',
    description:
      'Third counseling session. Eric first verbalized feelings of anxiety and pressure.',
    date: '2024-09-12',
    createdBy: 'Sarah Wong (School Counselor)',
    createdAt: '2024-09-12T14:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['counseling', 'anxiety', 'breakthrough'],
    data: {
      subType: 'counseling',
      sessionNumber: 3,
      duration: 45,
      focusAreas: ['Understanding anxiety', 'Academic stress', 'Family relationships'],
      techniques: ['Psychoeducation about anxiety', 'Normalization'],
      keyInsights:
        'Eric used the word "anxious" for the first time. Described feeling of pressure to perform academically.',
      progressNotes:
        'Important breakthrough in naming his feelings. Beginning to trust counseling process.',
      homeworkAssigned: 'Notice when anxiety feelings come up, write them down',
      nextSession: '2024-09-26',
      concernLevel: 'medium',
    },
  },

  // ===============================================
  // AUG 2024: BEGINNING OF YEAR - BASELINE
  // ===============================================
  {
    id: 'eric-rec-015',
    studentId: 'student-031',
    type: 'performance',
    subType: 'academic-results',
    title: 'Term 2 2024 Results - Strong Performance (Before Decline)',
    description:
      'Eric\'s Term 2 results showing strong academic performance. Baseline before observed decline.',
    date: '2024-08-15',
    createdBy: 'Daniel Tan',
    createdAt: '2024-08-15T14:00:00',
    status: 'published',
    visibility: 'parent',
    tags: ['academic-results', 'baseline', 'strong-performance'],
    data: {
      subType: 'academic-results',
      overallAverage: 78,
      results: [
        { subject: 'English', score: 82, grade: 'B+', remarks: 'Good analytical skills' },
        { subject: 'Mathematics', score: 85, grade: 'A-', remarks: 'Strong problem-solving' },
        { subject: 'Science', score: 80, grade: 'B+', remarks: 'Solid understanding' },
        { subject: 'Chinese', score: 70, grade: 'B-', remarks: 'Consistent effort' },
        { subject: 'Humanities', score: 75, grade: 'B', remarks: 'Good critical thinking' },
      ],
      teacherComment:
        'Eric is a capable student who demonstrates good understanding across subjects. He works diligently and consistently.',
      parentMeetingNotes:
        'Parents expressed high expectations. Asked about pathways to IP/IB programs.',
      concernLevel: 'low', // At this point, no major concerns
    },
  },

  {
    id: 'eric-rec-016',
    studentId: 'student-031',
    type: 'profile',
    subType: 'general',
    title: 'Start of Year Profile - SEC Screening',
    description:
      'Beginning of year student profile. No immediate concerns flagged, but noted for monitoring.',
    date: '2024-08-05',
    createdBy: 'Daniel Tan',
    createdAt: '2024-08-05T09:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['start-of-year', 'baseline', 'screening'],
    data: {
      subType: 'general',
      generalObservations: [
        'Quiet but attentive student',
        'Completes work on time',
        'Polite and respectful',
        'Small social circle',
      ],
      strengths: ['Academically capable', 'Responsible', 'Kind'],
      areasToMonitor: [
        'Social integration - small friend group',
        'Confidence in class participation',
      ],
      initialConcernLevel: 'low',
      followUpPlan: 'Monitor social integration, encourage class participation',
    },
  },

  // ===============================================
  // ADDITIONAL: HEALTH RECORDS
  // ===============================================
  {
    id: 'eric-rec-017',
    studentId: 'student-031',
    type: 'attendance',
    subType: 'medical',
    title: 'Nurse Visit - Stress Headache (Oct)',
    description: 'Visit #2 this term with stress-related headache',
    date: '2024-10-18',
    createdBy: 'School Nurse',
    createdAt: '2024-10-18T11:00:00',
    status: 'published',
    visibility: 'staff',
    tags: ['health-visit', 'stress-related', 'headache'],
    data: {
      subType: 'medical',
      complaints: ['Headache', 'Feeling tired'],
      vitals: { temperature: '36.6°C', bloodPressure: 'Normal' },
      assessment: 'Stress-related tension headache. No fever.',
      treatment: 'Rest, water, relaxation techniques',
      followUp: 'Recommend continued counseling support',
      frequency: 'Second visit this month with similar complaints',
      concernLevel: 'medium',
    },
  },

  {
    id: 'eric-rec-018',
    studentId: 'student-031',
    type: 'attendance',
    subType: 'medical',
    title: 'Nurse Visit - Stomach Ache (Sept)',
    description: 'Visit #1 - stress-related stomach complaints',
    date: '2024-09-22',
    createdBy: 'School Nurse',
    createdAt: '2024-09-22T09:30:00',
    status: 'published',
    visibility: 'staff',
    tags: ['health-visit', 'stress-related', 'stomach-ache'],
    data: {
      subType: 'medical',
      complaints: ['Stomach ache', 'Nausea'],
      vitals: { temperature: '36.5°C', bloodPressure: 'Normal' },
      assessment: 'No physical illness detected. Anxiety-related symptoms suspected.',
      treatment: 'Rest, offered water, discussed breathing exercises',
      followUp: 'Referred to school counselor',
      frequency: 'First visit this term',
      concernLevel: 'low-medium',
    },
  },

  // ===============================================
  // AI SUMMARY (Generated for Mr. Tan)
  // ===============================================
  {
    id: 'eric-rec-019',
    studentId: 'student-031',
    type: 'case-related',
    subType: 'ai-summary',
    title: '🤖 AI Summary - Eric\'s Wellbeing Profile (Generated for PTM)',
    description:
      'AI-generated summary connecting academic decline to emotional wellbeing concerns. For Mr. Tan\'s PTM preparation.',
    date: '2025-01-15',
    createdBy: 'AI Assistant',
    createdAt: '2025-01-15T15:00:00',
    status: 'published',
    visibility: 'self', // Only for teacher
    tags: ['ai-summary', 'ptm-prep', 'holistic-view'],
    data: {
      subType: 'ai-summary',
      summary: `
**Eric Lim - Holistic Wellbeing Overview**

**Key Concerns:**
Eric is currently under SEC monitoring as a SWAN (Student With Additional Needs) for mental health support. Over the past 6 months, there has been a clear pattern of declining wellbeing that is directly impacting his academic performance and social engagement.

**Academic-Emotional Connection:**
Eric's academic performance has declined significantly (-14 percentage points) from Term 2 to EOY exams. This decline coincides with:
- Increasing anxiety and social difficulties
- Withdrawal from peer interactions
- Frequent stress-related health complaints
- Decreased classroom participation

**Primary Stressors:**
1. **Family Dynamics**: High parental academic expectations, frequent comparison with high-achieving older sibling, limited emotional support at home, possible marital tensions
2. **Social Isolation**: Small friend circle (primarily Daniel Koh), feelings of not fitting in, avoidance of group activities
3. **Academic Pressure**: Self-imposed pressure to meet family expectations, fear of disappointing parents, perfectionist tendencies

**Positive Indicators:**
- Eric is engaged in counseling and making progress in naming his feelings
- He has one stable, supportive friendship
- He responds well to 1-on-1 support from trusted adults
- He shows maturity in understanding his emotions (in safe settings)

**Recommended PTM Approach:**
1. **Lead with strengths**: Acknowledge Eric's kindness, responsibility, and courage in seeking help
2. **Connect academic decline to wellbeing**: Help parents understand the emotional roots of academic changes
3. **Sensitive family discussion**: Gently explore family stressors without being confrontational
4. **Collaborative support plan**: Emphasize school-family partnership in supporting Eric's wellbeing
5. **Resource sharing**: Provide information about family counseling resources
6. **Realistic expectations**: Discuss adjusting expectations during this challenging period

**Tone**: Compassionate, non-judgmental, strengths-based, focused on collaborative support rather than blame.

**Confidentiality Note**: Eric has consented to sharing general counseling themes with parents at PTM, but specific session details remain confidential unless safety concerns arise.
      `,
      generatedAt: '2025-01-15T15:00:00',
      confidence: 'high',
      sentiment: 'concerned-but-hopeful',
    },
  },
]

/**
 * Helper function to get Eric's records by type
 */
export function getEricRecordsByType(type: string): StudentRecord[] {
  return ericStudentRecords.filter((record) => record.type === type)
}

/**
 * Helper function to get Eric's recent records (last N days)
 */
export function getEricRecentRecords(days: number = 30): StudentRecord[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return ericStudentRecords.filter((record) => {
    const recordDate = new Date(record.date)
    return recordDate >= cutoffDate
  })
}

/**
 * Helper function to get Eric's counseling sessions
 */
export function getEricCounselingSessions(): StudentRecord[] {
  return ericStudentRecords.filter(
    (record) => record.type === 'case-related' && record.data?.subType === 'counseling'
  )
}

/**
 * Helper function to get Eric's termly check-ins
 */
export function getEricTermlyCheckIns(): StudentRecord[] {
  return ericStudentRecords.filter(
    (record) => record.type === 'profile' && record.data?.subType === 'wellbeing-checkin'
  )
}

/**
 * Helper function to get Eric's PTM prep notes (private)
 */
export function getEricPTMPrepNotes(): StudentRecord[] {
  return ericStudentRecords.filter(
    (record) =>
      record.visibility === 'self' &&
      record.tags?.includes('ptm-prep')
  )
}
