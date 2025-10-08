# Classroom Routing Hierarchy Tests

This test suite validates the tab replacement behavior in the classroom navigation hierarchy.

## Expected Behavior

Child pages should **replace** their parent tabs rather than opening new tabs:

### Navigation Flow (Drilling Down)
- `classroom` → `classroom/5a` **(replaces parent tab)**
- `classroom/5a` → `classroom/5a/student/alice-wong` **(replaces parent tab)**
- `classroom/5a` → `classroom/5a/grades` **(replaces parent tab)**

### Back Navigation (Going Up)
- `classroom/5a/student/alice-wong` → `classroom/5a` **(replaces child tab)**
- `classroom/5a/grades` → `classroom/5a` **(replaces child tab)**
- `classroom/5a` → `classroom` **(replaces child tab)**

### Key Assertions
✅ Tab count remains constant when navigating within hierarchy
✅ Parent tab disappears when child opens
✅ Child tab disappears when navigating back
✅ No duplicate tabs in the tab bar
✅ URLs follow correct hierarchy structure

## Running the Tests

### Prerequisites
```bash
# Install dependencies
npm install

# Make sure dev server is running
npm run dev
```

### Run All Tests
```bash
# Run all Playwright tests
npx playwright test

# Run only classroom hierarchy tests
npx playwright test classroom-routing-hierarchy

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed
```

### Run Specific Tests
```bash
# Test: classroom → class replacement
npx playwright test -g "should replace classroom tab when opening a class"

# Test: class → student replacement
npx playwright test -g "should replace class tab when opening student details"

# Test: back navigation
npx playwright test -g "should replace student tab with class tab when clicking back"

# Test: full navigation flow
npx playwright test -g "should maintain hierarchy through full navigation flow"

# Test: no duplicates
npx playwright test -g "should not have duplicate tabs in the UI"
```

### Debug Tests
```bash
# Run with debug mode
npx playwright test --debug

# Generate and view test report
npx playwright test
npx playwright show-report
```

## Test Files

- **`classroom-routing-hierarchy.spec.ts`** - Main test suite for tab replacement behavior
- **`classroom.spec.ts`** - General classroom module tests
- **`tab-navigation.spec.ts`** - Multi-tab navigation tests

## Expected Results

All tests should pass with the following assertions:

1. ✅ **Tab replacement on drill-down**: When clicking from parent to child, parent tab is replaced
2. ✅ **Tab replacement on back navigation**: When clicking back button, child tab is replaced
3. ✅ **No duplicate tabs**: No duplicate tab keys appear in the UI
4. ✅ **Correct URL structure**: URLs follow the format `classroom/{classId}/...`
5. ✅ **Multiple top-level tabs**: Can have multiple independent top-level tabs, each with their own hierarchy

## Screenshots

Test screenshots are saved to `tests/screenshots/` including:
- `hierarchy-classroom-to-class.png`
- `hierarchy-class-to-student.png`
- `hierarchy-class-to-grades.png`
- `hierarchy-student-back-to-class.png`
- `hierarchy-grades-back-to-class.png`
- `hierarchy-class-back-to-classroom.png`
- `hierarchy-full-flow.png`
- `hierarchy-multiple-top-level.png`
- `hierarchy-url-structure.png`
- `hierarchy-no-duplicates.png`

## Troubleshooting

### Test Failures

**"Encountered two children with the same key"**
- This indicates duplicate tabs are being created
- Check that `handleNavigate` properly removes parent tabs before adding child tabs
- Verify `useEffect` doesn't add duplicate tabs on URL change

**"Expected tab count to be X, but got Y"**
- Parent tab may not be getting replaced properly
- Check the `replaceParent` parameter is being passed correctly
- Verify `getParentTab()` returns correct parent key

**"Tab not visible/visible when it shouldn't be"**
- State update timing issue - add `waitForTimeout` after navigation
- Check that `openTabs` state is being updated correctly

### Common Issues

1. **Dev server not running**: Start with `npm run dev`
2. **Stale browser state**: Clear browser cache and restart tests
3. **Timing issues**: Increase `waitForTimeout` values if tests are flaky
4. **URL mismatch**: Check that mock data class IDs match expected values (e.g., "5a" not "5A")

## Coverage

The test suite covers:
- ✅ Classroom → Class navigation
- ✅ Class → Student navigation
- ✅ Class → Grades navigation
- ✅ All back navigation paths
- ✅ Full navigation flow with multiple steps
- ✅ Multiple independent top-level tabs
- ✅ URL structure validation
- ✅ Duplicate tab detection

## Next Steps

After running tests:
1. Review screenshots in `tests/screenshots/`
2. Check HTML report: `npx playwright show-report`
3. Fix any failing tests
4. Update tests if behavior changes
