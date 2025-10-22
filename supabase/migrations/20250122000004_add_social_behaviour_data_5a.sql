-- Migration: Add Social & Behaviour Data for Primary 5A Students
-- Description: Populate behaviour observations and friend relationships for students S050101-S050112
-- This adds the missing social and behaviour data that teachers need to see in the UI

-- =====================================================
-- STEP 1: Add Behaviour Observations
-- =====================================================

WITH new_students AS (
  SELECT id, student_id, name FROM students WHERE student_id BETWEEN 'S050101' AND 'S050112'
),
teacher_info AS (
  SELECT id as teacher_uuid FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1
)
INSERT INTO behaviour_observations (student_id, observation_date, category, title, description, severity, location, action_taken, observed_by)
SELECT
  ns.id,
  obs.observation_date,
  obs.category,
  obs.title,
  obs.description,
  obs.severity,
  obs.location,
  obs.action_taken,
  ti.teacher_uuid
FROM new_students ns
CROSS JOIN teacher_info ti
CROSS JOIN LATERAL (
  SELECT * FROM (VALUES
    -- Eric Lim (S050101) - SWAN mental health case
    ('S050101', '2025-01-15'::date, 'concern', 'Stress-related symptoms during exam period', 'Student visited sick bay twice this week complaining of headaches and stomach aches. Symptoms appear stress-related. Discussed with school counsellor. Student is already in SWAN program.', 'medium', 'classroom', 'Referred to counsellor, contacted parents', null),
    ('S050101', '2024-12-10'::date, 'positive', 'Excellent English composition', 'Submitted an outstanding narrative essay showing deep emotional insight. Work demonstrates strong creative writing abilities. Encouraged to participate in writing competition.', null, 'classroom', 'Praised student, recommended for enrichment', null),
    ('S050101', '2024-11-20'::date, 'concern', 'Social withdrawal noted', 'Student has been sitting alone during recess for the past week. Usually eats quickly and returns to class alone. Friends mentioned he has been avoiding group activities.', 'medium', 'canteen', 'Monitored situation, informed school counsellor', null),
    ('S050101', '2024-10-05'::date, 'positive', 'Helpful and considerate towards peers', 'Observed Eric helping classmate understand difficult Math concept during group work. Patient and clear in explaining. Shows empathy and good communication.', null, 'classroom', 'Acknowledged positive behaviour', null),

    -- Lim Hui Ling (S050102) - Low attendance case
    ('S050102', '2025-01-18'::date, 'concern', 'Frequent tardiness pattern', 'Student arrived 30 minutes late for third time this week. Appears tired and mentioned helping with younger siblings in morning. Home situation may be affecting punctuality.', 'medium', 'classroom', 'Spoke with student, documenting pattern for counsellor review', null),
    ('S050102', '2025-01-10'::date, 'positive', 'Active participation in group project', 'Despite attendance challenges, student contributed enthusiastically to Science project. Worked well with team members and completed assigned tasks on time.', null, 'classroom', 'Encouraged continued participation', null),
    ('S050102', '2024-12-03'::date, 'concern', 'Incomplete homework pattern', 'Third consecutive week of incomplete Math homework. Student mentioned family responsibilities taking up evening time. Need to explore support options.', 'medium', 'classroom', 'Meeting scheduled with parent and student counsellor', null),
    ('S050102', '2024-11-15'::date, 'positive', 'Kind and supportive to classmates', 'Noticed Hui Ling comforting a classmate who was upset. Shows emotional maturity and empathy despite own challenges.', null, 'playground', 'Acknowledged caring behaviour', null),

    -- Siti Nurul Ain (S050103) - Behavioral/discipline case
    ('S050103', '2025-01-20'::date, 'positive', 'Improved self-regulation', 'Notable improvement in managing emotions during disagreements. Used calm words instead of raising voice when frustrated with group member. Growth evident.', null, 'classroom', 'Praised improvement, encouraged continued effort', null),
    ('S050103', '2025-01-08'::date, 'concern', 'Disruptive behaviour during lesson', 'Student repeatedly talked over teacher during Math lesson. When corrected, responded with eye-rolling and muttering. Continued until separated from friend.', 'high', 'classroom', 'Timeout implemented, parents notified, reflection worksheet completed', null),
    ('S050103', '2024-12-12'::date, 'concern', 'Conflict with peer during recess', 'Argument escalated to pushing between Siti and classmate over game rules. Both students upset. Situation required teacher intervention.', 'high', 'playground', 'Both students counselled separately, apologies exchanged, recess privileges monitored', null),
    ('S050103', '2024-11-28'::date, 'positive', 'Strong sports participation', 'Excellent teamwork and sportsmanship during PE lesson. Encouraged teammates positively and followed game rules well. Athletic skills are strength.', null, 'sports hall', 'Recognized positive contribution to team', null),

    -- Chen Jia Yi (S050104) - Counselling case (now closed, peer issues resolved)
    ('S050104', '2025-01-12'::date, 'positive', 'Confident participation in class discussions', 'Voluntarily shared ideas during English lesson. Spoke clearly and listened respectfully to others. Clear improvement in social confidence since counselling.', null, 'classroom', 'Encouraged continued participation', null),
    ('S050104', '2024-12-05'::date, 'positive', 'Healthy friendships observed', 'Playing happily with group of friends during recess. Included others and shared game equipment. Social integration much improved.', null, 'playground', 'Noted positive development', null),
    ('S050104', '2024-10-20'::date, 'concern', 'Reluctance to work in groups', 'Student requested to work alone on group project. Appeared anxious about peer interaction. Mentioned feeling "left out" by classmates.', 'medium', 'classroom', 'Facilitated gradual group integration with teacher support', null),

    -- Nicholas Loh (S050105) - Attendance counselling case
    ('S050105', '2025-01-14'::date, 'concern', 'Appears fatigued during lessons', 'Student fell asleep briefly during Science lesson. When asked, mentioned staying up late. Pattern of tiredness noted recently.', 'medium', 'classroom', 'Spoke with student about sleep schedule, informed parents', null),
    ('S050105', '2024-12-18'::date, 'positive', 'Outstanding Science project presentation', 'Delivered excellent presentation on solar system with creative visual aids. Showed thorough research and strong understanding. Engaged classmates with questions.', null, 'classroom', 'Praised effort and quality of work', null),
    ('S050105', '2024-11-08'::date, 'concern', 'Late arrival after long absence', 'Returned after three-day absence, arrived 45 minutes late. Mentioned family trip but seemed disoriented. Attendance pattern concerning.', 'medium', 'classroom', 'Documented for attendance review', null),

    -- Muhammad Iskandar (S050106) - GEP, leadership qualities
    ('S050106', '2025-01-16'::date, 'positive', 'Exemplary leadership during group work', 'Naturally took initiative to organize group Math project. Ensured all members contributed and understood tasks. Showed patience and inclusivity.', null, 'classroom', 'Acknowledged leadership skills, recommended for class monitor consideration', null),
    ('S050106', '2024-12-20'::date, 'positive', 'Excellent presentation on climate change', 'Delivered mature, well-researched presentation. Fielded complex questions from classmates with confidence. Demonstrated critical thinking beyond grade level.', null, 'classroom', 'Recommended for Science enrichment program', null),
    ('S050106', '2024-11-14'::date, 'positive', 'Helps struggling classmates unprompted', 'Observed Muhammad explaining Math concept to classmate without being asked. Patient and encouraging teaching approach. Shows academic maturity and generosity.', null, 'classroom', 'Encouraged peer tutoring role', null),

    -- Tan Wei Jie (S050107) - STEM career guidance
    ('S050107', '2025-01-17'::date, 'positive', 'Creative problem-solving in Science', 'Designed innovative solution for egg-drop challenge using unexpected materials. Explained engineering principles clearly to class. Strong analytical thinking.', null, 'science lab', 'Encouraged to explore engineering interests', null),
    ('S050107', '2024-12-16'::date, 'positive', 'Engaged in technology discussion', 'Asked thoughtful questions about coding and robotics during career talk. Shows genuine interest in STEM fields. Requested information about coding clubs.', null, 'classroom', 'Provided information on STEM programs', null),
    ('S050107', '2024-10-25'::date, 'neutral', 'Prefers independent work in Science', 'Student works efficiently alone on experiments but less engaged in group settings. Results are excellent. May need encouragement for collaborative projects.', null, 'science lab', 'Monitored balance of independent and group work', null),

    -- Alice Wong (S050108) - High achiever, all-rounder
    ('S050108', '2025-01-19'::date, 'positive', 'Outstanding academic excellence', 'Scored full marks on challenging Math assessment. Explained complex problem-solving clearly when presenting to class. Shows deep conceptual understanding.', null, 'classroom', 'Recommended for enrichment opportunities', null),
    ('S050108', '2024-12-22'::date, 'positive', 'Compassionate peer support', 'Voluntarily offered to help classmate who missed lessons. Created study notes and patiently explained concepts. Shows academic maturity and kindness.', null, 'classroom', 'Recognized caring attitude', null),
    ('S050108', '2024-11-30'::date, 'positive', 'Balanced approach to competition', 'Despite winning essay competition, remained humble and congratulated other participants. Shows healthy attitude towards achievement. Good role model.', null, 'classroom', 'Praised sportsmanship and attitude', null),

    -- Priya Krishnan (S050109) - SEN support case
    ('S050109', '2025-01-13'::date, 'positive', 'Growth in reading comprehension', 'Showing improvement in understanding complex texts with support strategies. Successfully answered inference questions with scaffolding. Progress is encouraging.', null, 'classroom', 'Continued use of reading support tools', null),
    ('S050109', '2024-12-09'::date, 'positive', 'Excellent artistic expression', 'Created beautiful and detailed artwork for class project. Shows strong visual-spatial skills. Art is area of strength and confidence.', null, 'art room', 'Displayed artwork, boosted confidence', null),
    ('S050109', '2024-11-18'::date, 'neutral', 'Requires additional time for assessments', 'Student uses full extended time allowance for Math test. Accommodations working well. Results improving with appropriate support.', null, 'classroom', 'Continued provision of accommodations', null),

    -- Reza Halim (S050110) - Counselling completed (exam anxiety resolved)
    ('S050110', '2025-01-11'::date, 'positive', 'Improved test anxiety management', 'Handled Math assessment calmly using breathing techniques learned in counselling. Completed test confidently without visible stress. Significant progress.', null, 'classroom', 'Reinforced anxiety management strategies', null),
    ('S050110', '2024-12-14'::date, 'positive', 'Positive attitude and resilience', 'When given challenging Science question, persisted rather than giving up immediately. Shows growth mindset. Anxiety management helping overall confidence.', null, 'classroom', 'Encouraged persistent effort', null),
    ('S050110', '2024-10-15'::date, 'concern', 'Anxiety symptoms before assessment', 'Student showed visible stress before English test - fidgeting, pale, shallow breathing. Needed calming intervention before beginning. Anxiety affecting performance.', 'medium', 'classroom', 'Referred to school counsellor for anxiety management support', null),

    -- Wong Kai Xuan (S050111) - Academic support counselling, Math struggles
    ('S050111', '2025-01-09'::date, 'positive', 'Improved Math confidence with support', 'Successfully completed fractions worksheet with minimal assistance. Shows growing understanding of concepts with intervention program. Good progress.', null, 'classroom', 'Continued intervention support, positive reinforcement', null),
    ('S050111', '2024-12-17'::date, 'positive', 'Strong effort in Chinese lesson', 'Excellent performance in Chinese composition. Writing shows creativity and good language skills. Non-Math subjects are strength areas.', null, 'classroom', 'Acknowledged strength in languages', null),
    ('S050111', '2024-11-22'::date, 'concern', 'Frustration with Math problem-solving', 'Student became upset during challenging word problems, said "I am stupid at Math." Self-confidence in Math is low. Needs encouragement and support.', 'medium', 'classroom', 'Provided reassurance, adjusted difficulty level, praised effort over outcome', null),

    -- Ryan Tan (S050112) - Disciplinary case showing improvement, CMT intervention
    ('S050112', '2025-01-21'::date, 'positive', 'Excellent self-control demonstrated', 'When frustrated during group activity, Ryan took a break and deep breath instead of reacting negatively. Applied behaviour strategies successfully. Major improvement!', null, 'classroom', 'Praised self-regulation, reinforced positive choices', null),
    ('S050112', '2025-01-07'::date, 'positive', 'Respectful interaction with peers', 'Observed Ryan sharing materials willingly and using polite language during group work. Behaviour management strategies working well. Continued progress.', null, 'classroom', 'Positive reinforcement provided', null),
    ('S050112', '2024-12-11'::date, 'positive', 'Improvement in following instructions', 'Ryan listened carefully to multi-step instructions and completed tasks in correct sequence without reminders. Shows growing self-discipline.', null, 'classroom', 'Acknowledged improved focus', null),
    ('S050112', '2024-11-05'::date, 'concern', 'Physical altercation with peer', 'Ryan pushed classmate during disagreement over sports equipment. Situation escalated quickly. Both students needed separation and calming time.', 'high', 'playground', 'Both students disciplined, parents contacted, conflict resolution session held, CMT intervention initiated', null),
    ('S050112', '2024-10-10'::date, 'concern', 'Defiant response to teacher instruction', 'When asked to put away device, Ryan refused and argued loudly. Disrupted class. Required firm intervention and timeout.', 'high', 'classroom', 'Timeout implemented, reflection activity completed, parents informed', null)
  ) AS obs(student_id, observation_date, category, title, description, severity, location, action_taken, dummy)
  WHERE obs.student_id = ns.student_id
) obs;

-- =====================================================
-- STEP 2: Add Friend Relationships
-- =====================================================

-- Create bidirectional friendships between students in Primary 5A
-- Groups:
--   Cluster 1 (High achievers): Eric, Muhammad, Alice, Tan Wei Jie
--   Cluster 2 (Girls social group): Lim Hui Ling, Siti, Chen Jia Yi, Alice, Priya
--   Cluster 3 (Boys active group): Nicholas, Ryan, Muhammad, Reza
--   Cluster 4 (Study support): Wong Kai Xuan, Priya, Chen Jia Yi

WITH student_mapping AS (
  SELECT
    s.id,
    s.student_id,
    s.name
  FROM students s
  WHERE s.student_id BETWEEN 'S050101' AND 'S050112'
),
teacher_info AS (
  SELECT id as teacher_uuid FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1
)
INSERT INTO friend_relationships (student_id, friend_id, relationship_type, closeness_level, notes, observed_by, observation_date)
SELECT
  s1.id as student_id,
  s2.id as friend_id,
  rel.relationship_type,
  rel.closeness_level,
  rel.notes,
  ti.teacher_uuid,
  CURRENT_DATE
FROM teacher_info ti
CROSS JOIN (VALUES
  -- Eric Lim (S050101) friendships
  ('S050101', 'S050106', 'study_partner', 'close', 'Bond over academic interests, often discuss schoolwork and books together'),
  ('S050101', 'S050107', 'peer', 'close', 'Share interest in Science and technology, work well together on projects'),
  ('S050101', 'S050108', 'study_partner', 'acquaintance', 'Respect each other academically but not particularly close socially'),
  ('S050101', 'S050104', 'peer', 'close', 'Both have experienced social challenges, supportive of each other'),

  -- Lim Hui Ling (S050102) friendships
  ('S050102', 'S050103', 'peer', 'very_close', 'Very close friends, spend most recess times together, live in same neighborhood'),
  ('S050102', 'S050104', 'peer', 'close', 'Sit together in class, chat during breaks, share snacks'),
  ('S050102', 'S050109', 'peer', 'close', 'Bonded over helping each other with different subjects'),

  -- Siti Nurul Ain (S050103) friendships
  ('S050103', 'S050102', 'peer', 'very_close', 'Best friends since Primary 1, very close bond despite different backgrounds'),
  ('S050103', 'S050108', 'peer', 'acquaintance', 'Alice tries to include Siti in activities despite behavioral differences'),
  ('S050103', 'S050112', 'peer', 'close', 'Both working on behavior improvements, understand each other challenges'),

  -- Chen Jia Yi (S050104) friendships
  ('S050104', 'S050102', 'peer', 'close', 'Supportive friendship, Hui Ling patient and kind'),
  ('S050104', 'S050108', 'peer', 'close', 'Alice has been welcoming and inclusive, helping Jia Yi feel included'),
  ('S050104', 'S050111', 'study_partner', 'close', 'Study together for Chinese, both enjoy language arts'),
  ('S050104', 'S050101', 'peer', 'close', 'Understanding friendship, both empathetic personalities'),

  -- Nicholas Loh (S050105) friendships
  ('S050105', 'S050112', 'peer', 'close', 'Play football together during recess, common sports interests'),
  ('S050105', 'S050106', 'peer', 'acquaintance', 'Different academic levels but friendly, occasional game partners'),
  ('S050105', 'S050110', 'peer', 'close', 'Comfortable friendship, often pair up for activities'),

  -- Muhammad Iskandar (S050106) friendships
  ('S050106', 'S050108', 'study_partner', 'very_close', 'Both high achievers, healthy academic competition, mutual respect and collaboration'),
  ('S050106', 'S050107', 'study_partner', 'close', 'Both passionate about STEM, work on Science projects together'),
  ('S050106', 'S050101', 'study_partner', 'close', 'Study group partners, discuss academic topics during breaks'),
  ('S050106', 'S050112', 'peer', 'acquaintance', 'Muhammad tries to be positive influence, plays sports occasionally'),

  -- Tan Wei Jie (S050107) friendships
  ('S050107', 'S050106', 'study_partner', 'close', 'Share Science and technology interests, collaborate on experiments'),
  ('S050107', 'S050101', 'peer', 'close', 'Common interests in reading and learning, enjoy intellectual discussions'),
  ('S050107', 'S050108', 'study_partner', 'acquaintance', 'Respect each other work, not particularly close outside academics'),

  -- Alice Wong (S050108) friendships
  ('S050108', 'S050106', 'study_partner', 'very_close', 'Best friends, study together, support each other, healthy competitive spirit'),
  ('S050108', 'S050104', 'peer', 'close', 'Alice mentors and includes Jia Yi, kind and supportive friendship'),
  ('S050108', 'S050109', 'peer', 'close', 'Alice helps Priya with subjects, patient and encouraging friend'),
  ('S050108', 'S050102', 'peer', 'acquaintance', 'Different social circles but friendly and respectful'),

  -- Priya Krishnan (S050109) friendships
  ('S050109', 'S050108', 'peer', 'close', 'Alice is very supportive of Priya, helps with schoolwork patiently'),
  ('S050109', 'S050111', 'study_partner', 'very_close', 'Both receive learning support, understand each other challenges, study buddies'),
  ('S050109', 'S050102', 'peer', 'close', 'Hui Ling is kind and inclusive, they help each other'),
  ('S050109', 'S050104', 'peer', 'close', 'Bonded through collaborative projects, share creative interests'),

  -- Reza Halim (S050110) friendships
  ('S050110', 'S050112', 'peer', 'close', 'Both have overcome challenges, play sports together, supportive friendship'),
  ('S050110', 'S050105', 'peer', 'close', 'Comfortable friendship, pair up for group activities'),
  ('S050110', 'S050106', 'peer', 'acquaintance', 'Muhammad encouraging influence, occasional study partner'),

  -- Wong Kai Xuan (S050111) friendships
  ('S050111', 'S050109', 'study_partner', 'very_close', 'Both have learning support, study together, supportive friendship'),
  ('S050111', 'S050104', 'study_partner', 'close', 'Strong in Chinese together, study partners for languages'),
  ('S050111', 'S050108', 'peer', 'acquaintance', 'Alice helpful when Kai Xuan needs support, patient tutor'),

  -- Ryan Tan (S050112) friendships
  ('S050112', 'S050110', 'peer', 'close', 'Both showing behavioral improvement, play football together, understand each other'),
  ('S050112', 'S050105', 'peer', 'close', 'Sports buddies, play during recess, common interests in games'),
  ('S050112', 'S050103', 'peer', 'close', 'Both working on self-control, relate to each other challenges'),
  ('S050112', 'S050106', 'peer', 'acquaintance', 'Muhammad positive role model for Ryan, friendly but different personalities')

) AS rel(student_id_code, friend_id_code, relationship_type, closeness_level, notes)
INNER JOIN student_mapping s1 ON s1.student_id = rel.student_id_code
INNER JOIN student_mapping s2 ON s2.student_id = rel.friend_id_code;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE behaviour_observations IS 'Updated with realistic observations for Primary 5A students (S050101-S050112)';
COMMENT ON TABLE friend_relationships IS 'Updated with social network data for Primary 5A students showing natural friendship clusters';
