const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to home
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // Navigate to Classroom
  console.log('1. Navigating to Classroom...');
  await page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' }).click();
  await page.waitForURL('**/classroom');
  await page.waitForTimeout(500);

  // Check if Classroom is active in sidebar
  const classroomButton = page.locator('[data-sidebar="menu-button"]').filter({ hasText: 'Classroom' });
  const isActive1 = await classroomButton.getAttribute('data-active');
  console.log('   Classroom active in sidebar:', isActive1 === 'true' ? '✅' : '❌');

  // Navigate to Class 5A
  console.log('2. Navigating to Class 5A...');
  await page.getByText('Class 5A').first().click();
  await page.waitForURL('**/classroom/class-5a');
  await page.waitForTimeout(500);

  // Check if Classroom is still active in sidebar
  const isActive2 = await classroomButton.getAttribute('data-active');
  console.log('   Classroom still active in sidebar:', isActive2 === 'true' ? '✅' : '❌');

  // Check tab label
  const tabText1 = await page.locator('[data-tab-item="true"]').filter({ hasText: 'Class 5A' }).first().textContent();
  console.log('   Tab shows "Class 5A":', tabText1.includes('Class 5A') ? '✅' : '❌');

  // Navigate to Alice Wong
  console.log('3. Navigating to Alice Wong student profile...');
  await page.getByText('Alice Wong').click();
  await page.waitForURL('**/classroom/class-5a/student/alice-wong');
  await page.waitForTimeout(1000);

  // Check if Classroom is still active in sidebar
  const isActive3 = await classroomButton.getAttribute('data-active');
  console.log('   Classroom still active in sidebar:', isActive3 === 'true' ? '✅' : '❌');

  // Check tab label
  const tabText2 = await page.locator('[data-tab-item="true"]').nth(1).textContent();
  console.log('   Tab shows "Alice Wong":', tabText2.includes('Alice Wong') ? '✅' : '❌');

  // Check page heading
  const heading = await page.locator('h1').first().textContent();
  console.log('   Page heading shows "Alice Wong":', heading.includes('Alice Wong') ? '✅' : '❌');

  // Check student profile displays correct name (not "Unknown Student")
  const profileName = await page.locator('h2, h3').filter({ hasText: /Unknown Student|Alice Wong/ }).first().textContent();
  console.log('   Profile shows "Alice Wong" (not "Unknown Student"):', profileName.includes('Alice Wong') ? '✅' : '❌');

  await page.screenshot({ path: 'student-profile-fixed.png', fullPage: true });
  console.log('\n✅ Screenshot saved to student-profile-fixed.png');

  await browser.close();
})();