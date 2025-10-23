# Tab Navigation State Management Fix

## Problem Summary

Multi-tab navigation was losing intermediate tabs during navigation. For example, navigating Home → Explore → Draft would result in only Home + Draft tabs being visible, with Explore tab missing.

## Root Cause Analysis

### The Core Issue
Next.js App Router in `[[...slug]]/page.tsx` was **remounting the page component on every route change**, causing React's `useState` to reinitialize to its default value `['home']`, losing all previously opened tabs.

### Why This Happened
1. **Dynamic Route Behavior**: Next.js treats each URL change in a catch-all route (`[[...slug]]`) as a potentially different page instance
2. **Component Lifecycle**: Page components unmount and remount on navigation in App Router
3. **State Reset**: `useState(['home'])` reinitializes to `['home']` on every mount
4. **React 19 Strict Mode**: Double-rendering exacerbated the issue with stale closures in `setOpenTabs(currentTabs => ...)`

### Debug Evidence
Console logs showed:
```
// After Explore navigation
currentTabs: Array(2) → [home, explore] ✅

// After Draft navigation (component remounted)
currentTabs: Array(1) → [home] ❌  // Lost 'explore'!
Adding new tab → [home, draft]     // Missing intermediate tab
```

## Solution Implementation

### 1. sessionStorage Persistence
**File**: `src/app/[[...slug]]/page.tsx` (lines 247-253)

```tsx
// BEFORE: Hardcoded initial state
const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>(['home'])

// AFTER: Initialize from sessionStorage
const [openTabs, setOpenTabs] = useState<ClosableTabKey[]>(() => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem('openTabs')
    return stored ? JSON.parse(stored) : ['home']
  }
  return ['home']
})
```

**Why it works**: sessionStorage persists during the browser session but survives component remounts, providing state continuity across page navigation.

### 2. useRef for Immediate State Access
**File**: `src/app/[[...slug]]/page.tsx` (line 255)

```tsx
const openTabsRef = useRef<ClosableTabKey[]>(openTabs)
```

**Why it works**: Provides immediate, non-stale access to current tabs array, avoiding closure issues when useEffect fires multiple times in React Strict Mode.

### 3. Sync State with sessionStorage in useEffect
**File**: `src/app/[[...slug]]/page.tsx` (lines 287-312)

```tsx
// BEFORE: Used functional updater with stale closure
setOpenTabs((currentTabs) => {
  if (!currentTabs.includes(tabFromUrl)) {
    return [...currentTabs, tabFromUrl]
  }
  return currentTabs
})

// AFTER: Read from ref, update both ref and sessionStorage
const currentTabsFromRef = openTabsRef.current
const tabExists = currentTabsFromRef.includes(tabFromUrl as ClosableTabKey)

if (!tabExists) {
  const newTabs = [...currentTabsFromRef, tabFromUrl as ClosableTabKey]
  openTabsRef.current = newTabs  // Update ref immediately
  setOpenTabs(newTabs)
  sessionStorage.setItem('openTabs', JSON.stringify(newTabs))  // Persist
}
```

**Why it works**:
- Reads from ref instead of relying on functional updater parameter (avoids stale state)
- Updates ref immediately before async state update
- Persists to sessionStorage for cross-remount persistence

### 4. Persist on Tab Close
**File**: `src/app/[[...slug]]/page.tsx` (lines 414-415)

```tsx
const handleCloseTab = useCallback((pageKey: TabKey) => {
  setOpenTabs((tabs) => {
    // ... filter logic ...
    openTabsRef.current = filteredTabs
    sessionStorage.setItem('openTabs', JSON.stringify(filteredTabs))
    return filteredTabs
  })
}, [])
```

### 5. Fixed Dropdown Menu Navigation
**File**: `src/app/[[...slug]]/page.tsx` (lines 831-836)

```tsx
// BEFORE: Only updated activeTab state
onClick={() => setActiveTab(tabKey)}

// AFTER: Also updates URL to trigger navigation
onClick={() => {
  setActiveTab(tabKey)
  const newPath = tabKey === 'home' ? '/' : `/${tabKey}`
  router.push(newPath, { scroll: false })
}}
```

**Why it works**: Ensures URL stays in sync with UI state, triggering proper navigation flow through useEffect.

## Test Updates

### File: `tests/tab-navigation.spec.ts` (lines 62-69)

Updated test expectations to match "always open new tabs" behavior:

```tsx
// BEFORE: Expected 2 tabs (Home + Class 5A)
await expect(tabs).toHaveCount(2)

// AFTER: Expected 3 tabs (Home + Classroom + Class 5A)
await expect(tabs).toHaveCount(3) // Always opens new tabs
```

## Validation Results

All 3 Playwright tests now pass:
- ✅ Home → Explore → Draft creates 3 tabs (previously failed with only 2)
- ✅ Classroom → Class 5A navigation opens new tabs correctly
- ✅ Switching between tabs via dropdown maintains all tab state

## Key Learnings

1. **Next.js App Router Behavior**: Dynamic routes can cause page components to remount, requiring persistent state management
2. **sessionStorage vs localStorage**: sessionStorage is ideal for UI state that should persist during a session but reset on new browser tabs
3. **React 19 Strict Mode**: Double-rendering requires careful state management to avoid stale closures
4. **Ref + State Pattern**: Using `useRef` alongside `useState` provides immediate access while maintaining React's reactivity

## Future Improvements to Consider

1. **React Context**: Move tab state to a layout-level Context Provider for more robust state management
2. **State Management Library**: Consider Zustand or Jotai for global client state
3. **URL as Source of Truth**: Explore making URL params the single source of truth with proper state hydration
4. **Tab State Cleanup**: Add logic to clean up sessionStorage on specific events (e.g., closing all tabs)
5. **Type Safety**: Consider stricter types for sessionStorage serialization/deserialization

## Related Files

- `src/app/[[...slug]]/page.tsx` - Main application component with tab management
- `tests/tab-navigation.spec.ts` - Playwright tests validating tab behavior
- `tests/debug-tab-navigation.spec.ts` - Debug test (removed after fixing)
