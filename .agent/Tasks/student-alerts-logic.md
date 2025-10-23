# Student Alerts Widget Logic

## Overview

The Student Alerts widget on the home page displays up to **3 students** who need attention or deserve recognition. The alerts are dynamically generated from the database based on attendance, cases, and behavior observations from the past week.

**Location**: Home page, top-right widget in the teacher dashboard grid

**File**: `/src/lib/supabase/queries.ts` → `getStudentAlerts()` function

---

## Alert Criteria

### Time Window
- **Duration**: Past 7 days from today
- **Calculation**: `today.getDate() - 7`
- All checks (attendance, cases, behavior) use this window

### Scope
- **Only shows students from classes the teacher teaches**
- Queries `teacher_classes` to get teacher's class assignments
- Filters `student_classes` for active enrollments only (`status: 'active'`)
- Teacher must have at least one class to see alerts

---

## Priority System

Alerts are shown in order of priority. Each student can only appear **once** (no duplicates).

### Priority 1: Attendance Issues 🚨

**Trigger Condition**: 
- 2 or more absences in the past week

**Severity Levels**:
- **High (Red)**: 3+ absences
  - Gradient: `from-red-400 via-pink-500 to-orange-400`
  - Background: Red
- **Medium (Purple)**: Exactly 2 absences
  - Gradient: `from-purple-400 via-pink-500 to-red-400`
  - Background: Purple

**Message Format**: 
- `"X absence this week"` (singular)
- `"X absences this week"` (plural)

**Database Tables Used**:
- `attendance` table
- Filters: `status IN ('absent', 'late')` within date range
- Only counts `'absent'` status for alert threshold

**Example**:
```
TW (Tan Wei Jie)
"3 absences this week"
Priority: High (red ring)
```

---

### Priority 2: Open Cases ⚠️

**Trigger Condition**:
- Any case with status `'open'` or `'in_progress'`

**Severity Levels**:
- **High (Red)**: Case severity = `'high'`
- **Medium (Purple)**: Case severity = `'medium'`
- **Info (Blue)**: Case severity = `'low'`
  - Gradient: `from-blue-400 via-cyan-500 to-teal-400`
  - Background: Blue

**Message Format**:
- `"Open [case_type] case"`
- Examples: 
  - "Open discipline case"
  - "Open counselling case"
  - "Open sen case"

**Database Tables Used**:
- `cases` table
- Filters: `status IN ('open', 'in_progress')`
- Ordered by: `severity DESC` (high severity first)

**Deduplication**:
- If student already has an attendance alert, they are **skipped**
- Prevents showing the same student twice

**Example**:
```
SC (Sarah Chen)
"Open discipline case"
Priority: High (red ring)
```

---

### Priority 3: Positive Recognition ⭐

**Trigger Condition**:
- Recent positive behavior observations in the past week
- **Only checked if fewer than 3 alerts already**

**Categories Considered Positive**:
- `'excellence'`
- `'achievement'`
- `'improvement'`
- `'positive'`

**Alternative Trigger**:
- Any observation with severity `'low'` (regardless of category)

**Severity Level**:
- **Info (Blue)**: Always
  - Gradient: `from-blue-400 via-cyan-500 to-teal-400`
  - Background: Blue

**Message Format**:
- Always: `"Excellent progress"`

**Database Tables Used**:
- `behaviour_observations` table
- Filters: `observation_date >= weekAgo`
- Ordered by: `observation_date DESC`
- Limit: 10 most recent observations checked

**Deduplication**:
- If student already has any alert (attendance or case), they are **skipped**

**Example**:
```
MW (Marcus Wong)
"Excellent progress"
Priority: Info (blue ring)
```

---

## Alert Display Logic

### Maximum Alerts
- **Hard limit**: 3 students
- Returns `alerts.slice(0, limit)` where `limit = 3`

### Student Information Included

Each alert contains:
```typescript
{
  student_id: string          // Database UUID
  student_name: string        // Full name (e.g., "Tan Wei Jie")
  initials: string           // Two-letter initials (e.g., "TW")
  message: string            // Alert message
  priority: 'high' | 'medium' | 'info'
  alert_type: 'attendance' | 'case' | 'behaviour' | 'performance'
  class_id: string | null    // Student's primary class
  class_name: string | null  // Class name (e.g., "5A")
}
```

### Initials Generation Logic
```typescript
// For multi-word names: First letter + Last letter
"Tan Wei Jie" → "TJ" (T from Tan, J from Jie)

// For single-word names: First 2 characters
"Reza" → "RE"
```

### Visual Design

**Avatar Ring Colors**:
- 🔴 **High Priority**: Red gradient ring
- 🟣 **Medium Priority**: Purple gradient ring
- 🔵 **Info Priority**: Blue gradient ring

**Structure**:
```
┌─────────────┐
│  Gradient   │  ← Colored ring
│  ┌───────┐  │
│  │ White │  │  ← White separator
│  │ ┌───┐ │  │
│  │ │ TW │ │  │  ← Initials with colored background
│  │ └───┘ │  │
│  └───────┘  │
└─────────────┘
     Tan       ← First name only
```

---

## Click Behavior

### With Classroom Context (Preferred)
When a student alert has a `class_id`:
- **URL**: `/classroom/[classId]/student/[student-name-slug]`
- **Example**: `/classroom/be7275c7-7b20-4e13-9dae-fb29ad9ba676/student/tan-wei-jie`
- Opens student profile in their classroom context
- Maintains navigation breadcrumb trail

### Without Classroom Context (Fallback)
If no `class_id` is available:
- **URL**: `/student-[student-name-slug]`
- **Example**: `/student-tan-wei-jie`
- Opens standalone student profile

---

## Loading States

### Skeleton Loading
Shows while fetching data from database:
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Animated   │  │  Animated   │  │  Animated   │
│  ┌───────┐  │  │  ┌───────┐  │  │  ┌───────┐  │
│  │       │  │  │  │       │  │  │  │       │  │
│  │ Gray  │  │  │  │ Gray  │  │  │  │ Gray  │  │
│  │       │  │  │  │       │  │  │  │       │  │
│  └───────┘  │  │  └───────┘  │  │  └───────┘  │
└─────────────┘  └─────────────┘  └─────────────┘
     ▬▬▬▬             ▬▬▬▬             ▬▬▬▬
```

**Features**:
- Gradient ring with pulse animation
- White separator ring
- Gray pulsing inner circle
- Gray pulsing name placeholder

**Duration**: Shows until user context loads AND alerts data fetches

### Fallback Data
If no alerts are found:
```json
{
  "student_id": "",
  "student_name": "No alerts",
  "initials": "NA",
  "message": "All students doing well",
  "priority": "info",
  "alert_type": "performance",
  "class_id": null,
  "class_name": null
}
```

---

## Example Scenarios

### Scenario 1: Multiple Urgent Issues
**Students**:
- Tan Wei Jie: 4 absences (this week)
- Sarah Chen: 2 absences (this week)
- Marcus Wong: Open high-severity discipline case

**Result**:
1. 🔴 **TW** - "4 absences this week" (High priority)
2. 🟣 **SC** - "2 absences this week" (Medium priority)
3. 🔴 **MW** - "Open discipline case" (High priority)

---

### Scenario 2: Mixed Priorities
**Students**:
- Tan Wei Jie: 3 absences
- Sarah Chen: Open low-severity counselling case
- Marcus Wong: Positive behavior observation
- Lisa Tan: Positive achievement

**Result**:
1. 🔴 **TW** - "3 absences this week" (High priority)
2. 🔵 **SC** - "Open counselling case" (Info priority)
3. 🔵 **MW** - "Excellent progress" (Info priority)

Note: Lisa Tan doesn't show (limit of 3)

---

### Scenario 3: Student with Multiple Issues
**Student**: Tan Wei Jie
- Has 3 absences
- Has open discipline case
- Has negative behavior observation

**Result**:
- 🔴 **TW** - "3 absences this week"

**Reasoning**: 
- Attendance alert takes priority
- Only ONE alert per student
- Case and behavior are not shown separately

---

### Scenario 4: All Positive
**Students**:
- All students have good attendance
- No open cases
- 3 students with recent positive observations

**Result**:
1. 🔵 **TW** - "Excellent progress"
2. 🔵 **SC** - "Excellent progress"
3. 🔵 **MW** - "Excellent progress"

---

## Database Schema Dependencies

### Tables Used
1. **teacher_classes**: Get classes taught by teacher
2. **student_classes**: Get active students in those classes
3. **students**: Get student names and basic info
4. **attendance**: Check absence records
5. **cases**: Check open/in-progress cases
6. **behaviour_observations**: Check positive observations

### Required Columns

**students**:
- `id`, `name`, `student_id`

**attendance**:
- `student_id`, `status`, `date`

**cases**:
- `student_id`, `status`, `severity`, `case_type`

**behaviour_observations**:
- `student_id`, `category`, `severity`, `observation_date`

---

## Configuration

### Adjustable Parameters

**Alert Limit**:
```typescript
getStudentAlerts(supabase, teacherId, 3) // Default: 3
```

**Attendance Threshold**:
```typescript
if (count >= 2) { // Currently: 2+ absences
  // High priority at 3+
  priority: count >= 3 ? 'high' : 'medium'
}
```

**Time Window**:
```typescript
weekAgo.setDate(today.getDate() - 7) // Currently: 7 days
```

**Positive Behavior Categories**:
```typescript
const positiveCategories = [
  'excellence',
  'achievement', 
  'improvement',
  'positive',
]
```

---

## Performance Considerations

### Query Optimization
- Uses indexed columns (`student_id`, `status`, `date`)
- Filters data at database level before processing
- Uses `LIMIT` on behavior observations (10 records max)
- Single query per data source (attendance, cases, behavior)

### Caching Strategy
- Data is fetched on component mount
- Re-fetches when user changes (dependency: `user?.user_id`)
- No automatic refresh (requires page reload for latest data)

### Error Handling
```typescript
try {
  // Fetch alerts
} catch (error) {
  console.error('Error fetching student alerts:', error)
  setStudentAlerts(fallbackStudentAlertsData) // Show "No alerts"
}
```

---

## Future Enhancements

### Potential Improvements
1. **Real-time Updates**: Use Supabase subscriptions for live alerts
2. **Customizable Thresholds**: Let teachers set their own alert triggers
3. **More Alert Types**: Academic performance, missing assignments
4. **Alert History**: Show dismissed/acknowledged alerts
5. **Notification System**: Push notifications for critical alerts
6. **Filter Options**: Toggle between urgent/positive alerts
7. **Expand Widget**: Show more than 3 students in expanded view
8. **Alert Details**: Tooltip showing more context on hover

### Considerations
- Balance between information density and clarity
- Performance impact of additional queries
- User preferences and personalization
- Mobile responsiveness with more alerts

---

## Testing Checklist

- [ ] Teacher with no classes → Shows fallback
- [ ] Teacher with classes but no students → Shows fallback
- [ ] Student with 2 absences → Shows medium priority
- [ ] Student with 3+ absences → Shows high priority
- [ ] Student with open case → Shows with correct severity
- [ ] Student with multiple issues → Shows only once
- [ ] Positive observations → Shows blue info alerts
- [ ] More than 3 alerts available → Shows only top 3
- [ ] Click alert → Navigates to correct student profile
- [ ] Loading state → Shows skeleton before data loads
- [ ] Error state → Shows fallback gracefully

