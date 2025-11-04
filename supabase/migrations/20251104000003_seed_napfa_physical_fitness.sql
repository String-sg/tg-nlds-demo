-- Migration: Seed NAPFA Physical Fitness Data
-- Description: Generate NAPFA assessment results for all 36 students
-- Records: 36 physical fitness records

-- Get teacher ID
WITH teacher_info AS (
  SELECT id as teacher_uuid FROM teachers WHERE email = 'daniel.tan@school.edu.sg' LIMIT 1
)

INSERT INTO physical_fitness (
  student_id, assessment_date, assessment_type, metrics, overall_grade, pass_status, remarks, assessed_by
)
SELECT
  s.id,
  '2025-03-20'::date,
  'NAPFA',
  n.metrics,
  n.overall_grade,
  n.pass_status,
  n.remarks,
  t.teacher_uuid
FROM students s
CROSS JOIN teacher_info t
CROSS JOIN LATERAL (
  VALUES
    ('{"sit_ups":22,"standing_broad_jump":132,"sit_and_reach":32,"shuttle_run":"11.4s","pull_ups":2,"run_1_6km":"11m 30s","total_points":11}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":37,"standing_broad_jump":157,"sit_and_reach":40,"shuttle_run":"11s","pull_ups":7,"run_1_6km":"10m 6s","total_points":17}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":13,"standing_broad_jump":120,"sit_and_reach":28,"shuttle_run":"12.4s","pull_ups":1,"run_1_6km":"12m 18s","total_points":7}'::jsonb, 'Bronze', true, 'Primary 5 NAPFA - Bronze award'),
    ('{"sit_ups":47,"standing_broad_jump":182,"sit_and_reach":52,"shuttle_run":"9.8s","pull_ups":9,"run_1_6km":"8m 36s","total_points":23}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":31,"standing_broad_jump":158,"sit_and_reach":42,"shuttle_run":"10.3s","pull_ups":6,"run_1_6km":"10m 30s","total_points":13}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":21,"standing_broad_jump":140,"sit_and_reach":35,"shuttle_run":"11.4s","pull_ups":2,"run_1_6km":"11m 24s","total_points":10}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":33,"standing_broad_jump":156,"sit_and_reach":39,"shuttle_run":"10.9s","pull_ups":7,"run_1_6km":"9m 54s","total_points":14}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":47,"standing_broad_jump":187,"sit_and_reach":51,"shuttle_run":"9.5s","pull_ups":8,"run_1_6km":"9m 0s","total_points":23}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":33,"standing_broad_jump":169,"sit_and_reach":42,"shuttle_run":"10.2s","pull_ups":6,"run_1_6km":"9m 48s","total_points":14}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":13,"standing_broad_jump":127,"sit_and_reach":22,"shuttle_run":"12.5s","pull_ups":0,"run_1_6km":"12m 0s","total_points":5}'::jsonb, 'Pass', true, 'Primary 5 NAPFA - Pass award'),
    ('{"sit_ups":20,"standing_broad_jump":130,"sit_and_reach":33,"shuttle_run":"11.5s","pull_ups":2,"run_1_6km":"11m 18s","total_points":10}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":34,"standing_broad_jump":165,"sit_and_reach":42,"shuttle_run":"10.6s","pull_ups":5,"run_1_6km":"9m 42s","total_points":12}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":45,"standing_broad_jump":176,"sit_and_reach":51,"shuttle_run":"9.9s","pull_ups":10,"run_1_6km":"9m 24s","total_points":21}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":34,"standing_broad_jump":158,"sit_and_reach":41,"shuttle_run":"10.4s","pull_ups":7,"run_1_6km":"10m 24s","total_points":16}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":23,"standing_broad_jump":140,"sit_and_reach":36,"shuttle_run":"11.8s","pull_ups":2,"run_1_6km":"11m 24s","total_points":9}'::jsonb, 'Bronze', true, 'Primary 5 NAPFA - Bronze award'),
    ('{"sit_ups":47,"standing_broad_jump":171,"sit_and_reach":52,"shuttle_run":"9.5s","pull_ups":9,"run_1_6km":"9m 30s","total_points":22}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":34,"standing_broad_jump":166,"sit_and_reach":41,"shuttle_run":"10.3s","pull_ups":7,"run_1_6km":"9m 54s","total_points":16}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":20,"standing_broad_jump":140,"sit_and_reach":32,"shuttle_run":"11.9s","pull_ups":4,"run_1_6km":"10m 54s","total_points":8}'::jsonb, 'Bronze', true, 'Primary 5 NAPFA - Bronze award'),
    ('{"sit_ups":49,"standing_broad_jump":173,"sit_and_reach":46,"shuttle_run":"10s","pull_ups":8,"run_1_6km":"9m 24s","total_points":23}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":32,"standing_broad_jump":168,"sit_and_reach":44,"shuttle_run":"10.2s","pull_ups":6,"run_1_6km":"10m 0s","total_points":17}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":35,"standing_broad_jump":162,"sit_and_reach":38,"shuttle_run":"10.2s","pull_ups":6,"run_1_6km":"9m 48s","total_points":17}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":24,"standing_broad_jump":142,"sit_and_reach":35,"shuttle_run":"11.4s","pull_ups":4,"run_1_6km":"11m 0s","total_points":11}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":47,"standing_broad_jump":182,"sit_and_reach":47,"shuttle_run":"9.6s","pull_ups":10,"run_1_6km":"9m 18s","total_points":18}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":34,"standing_broad_jump":164,"sit_and_reach":43,"shuttle_run":"10.7s","pull_ups":6,"run_1_6km":"10m 6s","total_points":15}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":28,"standing_broad_jump":141,"sit_and_reach":37,"shuttle_run":"11.8s","pull_ups":2,"run_1_6km":"11m 30s","total_points":11}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":15,"standing_broad_jump":121,"sit_and_reach":29,"shuttle_run":"12.2s","pull_ups":0,"run_1_6km":"12m 24s","total_points":4}'::jsonb, 'Pass', true, 'Primary 5 NAPFA - Pass award'),
    ('{"sit_ups":37,"standing_broad_jump":154,"sit_and_reach":40,"shuttle_run":"10.2s","pull_ups":5,"run_1_6km":"10m 12s","total_points":17}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":27,"standing_broad_jump":132,"sit_and_reach":34,"shuttle_run":"11.3s","pull_ups":3,"run_1_6km":"10m 36s","total_points":11}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":15,"standing_broad_jump":129,"sit_and_reach":24,"shuttle_run":"12.6s","pull_ups":0,"run_1_6km":"12m 54s","total_points":5}'::jsonb, 'Pass', true, 'Primary 5 NAPFA - Pass award'),
    ('{"sit_ups":34,"standing_broad_jump":169,"sit_and_reach":42,"shuttle_run":"10.9s","pull_ups":6,"run_1_6km":"10m 18s","total_points":15}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":46,"standing_broad_jump":175,"sit_and_reach":48,"shuttle_run":"9.6s","pull_ups":9,"run_1_6km":"8m 48s","total_points":20}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":23,"standing_broad_jump":133,"sit_and_reach":34,"shuttle_run":"12s","pull_ups":4,"run_1_6km":"10m 54s","total_points":8}'::jsonb, 'Bronze', true, 'Primary 5 NAPFA - Bronze award'),
    ('{"sit_ups":38,"standing_broad_jump":150,"sit_and_reach":43,"shuttle_run":"10.2s","pull_ups":5,"run_1_6km":"9m 54s","total_points":12}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":43,"standing_broad_jump":181,"sit_and_reach":52,"shuttle_run":"9.7s","pull_ups":12,"run_1_6km":"9m 12s","total_points":20}'::jsonb, 'Gold', true, 'Primary 5 NAPFA - Gold award'),
    ('{"sit_ups":21,"standing_broad_jump":134,"sit_and_reach":30,"shuttle_run":"11.9s","pull_ups":3,"run_1_6km":"10m 54s","total_points":10}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award'),
    ('{"sit_ups":35,"standing_broad_jump":161,"sit_and_reach":43,"shuttle_run":"10.9s","pull_ups":6,"run_1_6km":"10m 6s","total_points":14}'::jsonb, 'Silver', true, 'Primary 5 NAPFA - Silver award')
) AS n(metrics, overall_grade, pass_status, remarks)
WHERE s.student_id IN ('S050101', 'S050102', 'S050103', 'S050104', 'S050105', 'S050106', 'S050107', 'S050108', 'S050109', 'S050110', 'S050111', 'S050112', 'S050032', 'S050033', 'S050034', 'S050035', 'S050036', 'S050037', 'S050038', 'S050039', 'S050040', 'S050041', 'S050042', 'S050043', 'S050044', 'S050045', 'S050046', 'S050047', 'S050048', 'S050049', 'S050050', 'S050051', 'S050052', 'S050053', 'S050054', 'S050055');
