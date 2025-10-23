# Student Alerts Widget - Attendance Priority Update

## Changes Made

✅ **Modified:** `src/lib/supabase/queries.ts` - `getStudentAlerts()` function

### New Behavior

The student alerts widget now **prioritizes students with attendance issues** over SWAN cases or other case types.

## Priority Levels

### Critical (< 60% attendance) - HIGH PRIORITY
- Immediate intervention needed
- Detailed message with specific numbers

### High Concern (60-79% attendance) - HIGH PRIORITY
- Requires follow-up and support plan
- Shows absence and late counts

### Moderate (80-89% attendance) - MEDIUM PRIORITY
- Monitor patterns
- Check for underlying issues

## Expected Display

Based on migrated data, the widget will show:

### **Lim Hui Ling (S050102)** - First Priority
- **Attendance Rate:** 40.9% (9 absences out of 22 days)
- **Priority:** High
- **Alert Type:** Attendance
- **Message:** "Critical attendance issue: 41% attendance rate (9 absences out of 22 days). Immediate family intervention and support needed."

### Fallback Students (if more alerts needed):
1. **Nicholas Loh** - 72.7% (High concern)
2. **Siti Nurul Ain** - 77.3% (High concern)
3. **Ryan Tan** - 72.7% (High concern)

## How It Works

1. **Calculates overall attendance rate** (not just weekly)
2. **Identifies students below 90%** attendance
3. **Sorts by lowest rate first** (worst cases appear first)
4. **Provides detailed context** based on severity:
   - Critical: Exact numbers + immediate action needed
   - High: Absence/late counts + follow-up needed
   - Medium: Monitor and investigate

5. **Returns top result** (limit = 1 by default)

## UI Impact

The student alerts card will now display:

```
STUDENT ALERTS

1 student requires immediate attention today.

┌─────────────────────────────────────┐
│ Lim Hui Ling (5A)    [High Priority]│
│                                     │
│ Critical attendance issue: 41%      │
│ attendance rate (9 absences out of  │
│ 22 days). Immediate family          │
│ intervention and support needed.    │
└─────────────────────────────────────┘
```

Clicking the card navigates to Lim Hui Ling's student profile page.

## Technical Details

### Data Source
- Queries `attendance` table for all records
- Calculates present/absent/late counts per student
- Computes overall attendance percentage
- Filters and sorts by severity

### No Duplicates
- Students only appear once (highest priority alert wins)
- Attendance alerts take precedence over case alerts
- SWAN enrichment only applies to non-attendance alerts
