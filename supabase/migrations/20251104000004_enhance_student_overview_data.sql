-- Migration: Enhance Student Overview Data
-- Description: Update student_overview with medical conditions, health declarations, and family background
-- Records: 36 student overview updates


UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Dairy"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Wears glasses","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050101' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050102' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":["Eczema"],"medications":["Ventolin inhaler (blue)"],"notes":"Monitor during physical activities"}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050103' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050104' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Dairy"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050105' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Eggs"],"conditions":["Diabetes Type 1"],"medications":["EpiPen (emergency)"],"notes":"Requires close monitoring. Emergency contact on file."}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050106' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050107' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Eggs"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050108' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":["Eczema"],"medications":["Insulin injections"],"notes":"Monitor during physical activities"}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":0,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050109' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Wears glasses","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050110' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050111' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Eggs"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050112' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050032' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050033' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Shellfish"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050034' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050035' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050036' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050037' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Dairy"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":0,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050038' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050039' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":0,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050040' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050041' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050042' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Single parent household","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050043' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Pollen"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050044' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050045' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050046' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050047' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":["Mild asthma"],"medications":["Insulin injections"],"notes":"Monitor during physical activities"}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050048' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050049' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050050' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Both parents working professionals","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050051' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":["Eggs"],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Both parents present, supportive environment","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050052' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Requires dental follow-up"}'::jsonb,
  family = '{"siblings":0,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050053' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":1,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050054' LIMIT 1);

UPDATE student_overview
SET
  medical_conditions = '{"allergies":[],"conditions":[],"medications":[]}'::jsonb,
  health_declaration = '{"vision":"Normal","hearing":"Normal","dental":"Healthy"}'::jsonb,
  family = '{"siblings":2,"home_situation":"Lives with extended family","notes":"Stable home environment"}'::jsonb,
  updated_at = NOW()
WHERE student_id = (SELECT id FROM students WHERE student_id = 'S050055' LIMIT 1);
