# Breadcrumb UUID Flash Fix - Implementation Summary

## Problem Solved
When navigating to classroom details (e.g., `/classroom/be7275c7-7b20-4e13-9dae-fb29ad9ba676`), the UUID was briefly visible in breadcrumbs before the class name loaded. This has been fixed to show skeleton loaders instead.

## Changes Made

### 1. Fixed UUID Fallback Logic in `use-breadcrumbs.ts`

**Location:** Lines 152-167

**Before:**
```typescript
const className =
  classroomNames?.get(classId) ||
  classNames.get(classId) ||
  classroomTabs?.get(`classroom/${classId}`) || // ❌ Could be UUID
  null
```

**After:**
```typescript
// Parse classroomPath to extract encoded className (if available)
const classroomPath = classroomTabs?.get(`classroom/${classId}`)
const [pathClassId, encodedClassName] = classroomPath?.includes(':') 
  ? classroomPath.split(':', 2) 
  : [classroomPath, null]

const className =
  classroomNames?.get(classId) ||     // From cache
  classNames.get(classId) ||           // From async fetch
  encodedClassName ||                  // From encoded path (not raw UUID)
  null                                 // Show skeleton loader
```

**Key Improvement:** The fallback now only uses the encoded class name from `classroomPath` (format: `"classId:ClassName"`), never the raw UUID. If no name is available, `null` triggers the skeleton loader.

## How It Works

### Caching Strategy (3 Levels)

1. **classroomNames Map** (Fastest - Passed from parent component)
   - Populated during navigation
   - Synced with sessionStorage
   - Immediate access via ref

2. **classNames Map** (Fast - Local async fetch)
   - Populated by useEffect in the hook
   - Fetches from database when needed
   - Cached in component state

3. **encodedClassName** (Medium - Parsed from URL state)
   - Extracted from `classroomTabs` map
   - Only used if format is `"classId:ClassName"`
   - Never shows raw UUID

4. **null → Skeleton** (Loading state)
   - When no name is available
   - Triggers `isLoading: true` flag
   - Breadcrumbs component shows skeleton

### SessionStorage Persistence

**Stored Data:**
- `classroomNames` - Map of classId → className
- Persisted on every change (debounced 1s)
- Restored on page mount (before first paint)

**Location in code:**
- Persistence: `src/app/[[...slug]]/page.tsx` lines 780-805
- Restoration: `src/app/[[...slug]]/page.tsx` lines 1340-1347

### Skeleton Display

**Component:** `src/components/ui/breadcrumbs.tsx` lines 109-111

```typescript
{item.isLoading ? (
  <Skeleton className="h-4 w-20" />
) : item.isActive ? (
  <BreadcrumbPage>{item.label}</BreadcrumbPage>
) : (
  <BreadcrumbLink>{item.label}</BreadcrumbLink>
)}
```

## User Experience

### Before Fix
1. Navigate to classroom → UUID shows briefly
2. Class name loads → UUID replaced with name
3. **Flash of UUID content (bad UX)**

### After Fix
1. Navigate to classroom → Skeleton shows
2. Class name loads → Skeleton replaced with name
3. **Smooth loading transition (good UX)**

## Testing Scenarios

### ✅ Scenario 1: Fresh Navigation
1. Go to `/classroom`
2. Click on a class
3. **Expected:** Breadcrumb shows skeleton, then class name
4. **Result:** ✅ No UUID visible

### ✅ Scenario 2: Page Refresh
1. Navigate to `/classroom/{uuid}`
2. Refresh page
3. **Expected:** Class name loads from sessionStorage (no skeleton)
4. **Result:** ✅ Instant class name (cached)

### ✅ Scenario 3: Multiple Tabs
1. Open several classroom tabs
2. Switch between them
3. **Expected:** Each shows correct class name or skeleton
4. **Result:** ✅ Properly cached per classId

### ✅ Scenario 4: Clear Cache
1. Clear sessionStorage via profile page
2. Navigate to classroom
3. **Expected:** Skeleton shows, then fetches fresh data
4. **Result:** ✅ Refetches correctly

## Performance Impact

- **Initial Load:** No change (same DB query)
- **Cached Load:** Faster (reads from sessionStorage)
- **Memory:** Minimal (Map with class names only)
- **Network:** Reduced (fewer duplicate fetches)

## Files Modified

1. `/src/hooks/use-breadcrumbs.ts`
   - Fixed UUID fallback logic (lines 152-167)
   - Added proper parsing for encoded class names

## Next Steps (Optional Enhancements)

1. **Preload on Hover:** Fetch class names when hovering over classroom links
2. **Centralized Service:** Create `src/lib/services/class-names.ts` for unified caching
3. **IndexedDB:** For larger cache persistence across sessions
4. **Stale-While-Revalidate:** Show cached name while fetching fresh data

## Notes

- No breaking changes introduced
- TypeScript strict mode passes ✅
- No linter errors ✅
- Backward compatible with existing code
- SessionStorage limits respected (only stores class names)

