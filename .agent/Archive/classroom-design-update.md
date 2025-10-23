# Classroom Page Design Update Plan

## Overview
Update the classroom landing page (`my-classes.tsx`) to match the Figma design while preserving all existing functionality. Mark UI elements that require database schema updates.

## Figma Design Analysis

### Key Layout Changes
1. **Form Class Section**: Large card (left) + "Overall" summary card (right)
2. **Subject Classes**: 3-column equal-width card grid
3. **CCA Classes**: Full-width cards
4. **AI Agent Integration**: Notification boxes in each card
5. **Stats Display**: Horizontal layout with vertical dividers

### New UI Components
- Overall status card with illustration
- AI Agent notification boxes (orange star icon)
- Horizontal stats bars with dividers
- Badge grouping (inline display)
- Schedule information display

## Implementation Steps

### Step 1: Update Type Definitions
**File**: `src/types/classroom.ts`

Add new types for:
```typescript
// AI Agent notification
interface AINotification {
  message: string
  timestamp?: string
  priority?: 'info' | 'warning' | 'urgent'
}

// Schedule information
interface ClassSchedule {
  days: string[]
  time?: string
  location?: string
}

// Overall status
interface OverallStatus {
  message: string
  status: 'good' | 'warning' | 'attention'
  illustration?: string
}
```

**TODO Comments to Add**:
- Mark `AINotification` as pending AI Agent API integration
- Mark schedule fields as pending database schema update

---

### Step 2: Update MyClasses Component
**File**: `src/components/classroom/my-classes.tsx`

#### 2.1 Form Class Section
**Changes**:
- Split into two-column layout: Main card (66%) + Overall card (33%)
- Update stats to horizontal layout with dividers
- Add AI Agent notification section
- Update badge display to inline

**New Components**:
```typescript
// OverallCard component for form class summary
function OverallCard({ status }: { status?: OverallStatus }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-sm text-stone-600">Overall</p>
        <h3 className="text-lg font-semibold">{status?.message || "All good, Mr. Tan"}</h3>
      </CardHeader>
      <CardContent>
        {/* TODO: Add illustration asset */}
        <div className="bg-gradient-to-b from-blue-100 to-pink-100 rounded-lg h-48">
          <p className="text-xs text-stone-500 p-4">Pending: Illustration asset</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

**TODO Comments**:
```typescript
// TODO: Database schema update needed
// - Add classes.schedule (JSON): { days: string[], time: string, location: string }
// - Add classes.ai_notifications (JSON): { message: string, priority: string }
// - Add form_classes.sen_count (integer)
// - Add form_classes.pa_count (integer)
// - Add form_classes.overall_status (JSON)
```

#### 2.2 Update ClassCard Component
**Changes**:
- Horizontal stats bar: `Student | Classroom | My classes`
- Add vertical dividers between stats
- Add AI Agent notification box at bottom
- Update badge layout to inline (not stacked)

**Layout Structure**:
```
┌─────────────────────────────────────┐
│ Class 5A                            │
│ [Mathematics] [Year 5]              │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Student  │ Classroom │ Schedule ││
│ │   30     │   3-12    │ Mon,Wed  ││
│ └─────────────────────────────────┘│
│                                     │
│ ⭐ AI Agent                         │
│ No class today. No event captured. │
└─────────────────────────────────────┘
```

**Implementation**:
```typescript
function ClassCard({ classData, isFormClass }: ClassCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{classData.class_name}</CardTitle>
        <div className="flex gap-2">
          {/* Inline badges */}
          <Badge>{classData.subject}</Badge>
          <Badge>Year {classData.year_level}</Badge>
          {isFormClass && <Badge variant="success">Excellence award winner</Badge>}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Horizontal stats with dividers */}
        <div className="flex items-center divide-x border rounded-lg">
          <StatItem label="Student" value={classData.student_count} />
          <StatItem label="Classroom" value={classData.classroom_number || "TODO: DB"} />
          <StatItem label="My classes" value={formatSchedule(classData.schedule)} />
        </div>
        
        {/* AI Agent notification */}
        <AINotificationBox notification={classData.ai_notification} />
      </CardContent>
    </Card>
  )
}
```

#### 2.3 Update CCACard Component
**Changes**:
- Add Location stat field
- Add Schedule display
- Update layout to match subject cards
- Add AI Agent notification

**TODO Comments**:
```typescript
// TODO: Database schema update needed
// - Add ccas.location (string)
// - Add ccas.schedule (JSON)
// - Add ccas.ai_notifications (JSON)
```

#### 2.4 Create AINotificationBox Component
```typescript
function AINotificationBox({ notification }: { notification?: AINotification }) {
  if (!notification) {
    return (
      <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
        <div className="flex items-start gap-2">
          <span className="text-orange-500">⭐</span>
          <div>
            <p className="text-sm font-medium text-stone-600">AI Agent</p>
            <p className="text-sm text-stone-500 italic">
              Pending: AI Agent integration
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
      <div className="flex items-start gap-2">
        <span className="text-orange-500">⭐</span>
        <div>
          <p className="text-sm font-medium text-stone-900">AI Agent</p>
          <p className="text-sm text-stone-700 mt-1">{notification.message}</p>
        </div>
      </div>
    </div>
  )
}
```

#### 2.5 Create StatItem Component
```typescript
function StatItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 px-3 py-2">
      <p className="text-xs text-stone-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-stone-900">{value}</p>
    </div>
  )
}
```

---

### Step 3: Update Class Overview (Minor Changes)
**File**: `src/components/classroom/class-overview.tsx`

**Changes**:
- Keep student list table (not shown in landing, but needed for detail view)
- Update breadcrumb styling if needed
- No major structural changes

---

### Step 4: Add Placeholder Data & Pending Markers

**Display "Pending" badges where data is missing**:
```typescript
{!classData.schedule && (
  <Badge variant="outline" className="text-xs">
    TODO: Schedule data
  </Badge>
)}

{!classData.ai_notification && (
  <p className="text-xs text-stone-500 italic">
    Pending: AI Agent integration
  </p>
)}
```

---

## Database Schema Updates Required

### Classes Table
```sql
-- TODO: Run migration
ALTER TABLE classes ADD COLUMN schedule JSONB;
ALTER TABLE classes ADD COLUMN ai_notifications JSONB;
ALTER TABLE classes ADD COLUMN classroom_number VARCHAR(10);
```

### CCA Table
```sql
-- TODO: Run migration
ALTER TABLE ccas ADD COLUMN location VARCHAR(255);
ALTER TABLE ccas ADD COLUMN schedule JSONB;
ALTER TABLE ccas ADD COLUMN ai_notifications JSONB;
```

### Form Classes Stats
```sql
-- TODO: Add to classes or create form_class_stats table
-- sen_count, pa_count, overall_status
```

---

## Files to Modify

1. ✏️ **src/components/classroom/my-classes.tsx** (Major update)
   - Update ClassCard component
   - Update CCACard component
   - Add OverallCard component
   - Add AINotificationBox component
   - Add StatItem component
   - Update layout grids

2. ✏️ **src/types/classroom.ts** (Minor update)
   - Add AINotification interface
   - Add ClassSchedule interface
   - Add OverallStatus interface

3. 📝 **src/components/classroom/class-overview.tsx** (No changes needed)
   - Keep as-is for detail view

---

## What Will NOT Change

✅ **Preserved**:
- All existing data fetching hooks
- Database queries (only TODO comments added)
- Navigation and routing
- Student profile functionality
- Grade entry functionality
- Attendance tracking
- Class detail pages
- Table views in detail pages

❌ **Not Updated** (as requested):
- Sidebar navigation
- Tab system
- Header/breadcrumb system (outside classroom content)

---

## UI Markers for Pending Features

**Badge colors**:
- 🟡 Yellow badge: "Pending: Database update"
- 🟠 Orange badge: "Pending: AI Agent integration"
- 🔵 Blue badge: "TODO: Asset needed"

**Example markers**:
```typescript
{/* TODO: Database field needed */}
<Badge variant="outline" className="text-yellow-600 border-yellow-600">
  Pending: Schedule data
</Badge>

{/* TODO: AI integration */}
<div className="text-orange-600 text-xs italic">
  Pending: AI Agent integration
</div>

{/* TODO: Asset */}
<div className="bg-stone-100 p-4 rounded text-xs text-stone-500">
  Pending: Illustration asset
</div>
```

---

## Testing Checklist

After implementation:
- [ ] Form class displays with Overall card
- [ ] Subject classes display in 3-column grid
- [ ] CCA classes display full-width
- [ ] All existing data still renders correctly
- [ ] Pending markers visible for missing data
- [ ] AI Agent boxes show placeholder text
- [ ] Stats display horizontally with dividers
- [ ] Badges display inline
- [ ] Responsive layout works on mobile
- [ ] No console errors
- [ ] All existing functionality preserved

---

## Success Criteria

1. ✅ UI matches Figma design layout
2. ✅ All existing content preserved
3. ✅ TODO comments added for database updates
4. ✅ Pending markers visible in UI
5. ✅ No breaking changes to existing features
6. ✅ Responsive and accessible
7. ✅ Ready for future database schema implementation

---

## Next Steps (Future Work)

**Phase 2 - Database Implementation**:
1. Create database migration scripts
2. Update API endpoints for new fields
3. Implement AI Agent integration
4. Add illustration assets
5. Remove "Pending" markers
6. Add actual schedule data
7. Implement real-time AI notifications

**Phase 3 - Enhancement**:
1. Add animations for AI Agent updates
2. Implement Overall status calculation logic
3. Add class performance trends
4. Add interactive schedule calendar
5. Add quick actions in cards

