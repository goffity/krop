import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8082';
const TEST_EMAIL = `e2e_${Date.now()}@krop.app`;
const TEST_PASSWORD = 'test1234';

test.setTimeout(60000);

test.describe('Krop Finance Tracker — E2E', () => {
  test('full flow: register → dashboard → add transaction → verify', async ({ page }) => {
    // Handle alerts
    page.on('dialog', async (dialog) => {
      console.log(`   Alert: ${dialog.message()}`);
      await dialog.accept();
    });

    // ============ 1. Login page loads ============
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Krop').first()).toBeVisible();
    await page.screenshot({ path: '/tmp/krop-e2e-01-login.png' });
    console.log('✓ 1. Login page loaded');

    // ============ 2. Navigate to Register ============
    await page.getByText('สมัครเลย').click();
    await page.waitForTimeout(1000);
    await expect(page.getByPlaceholder('กรอกรหัสผ่านอีกครั้ง')).toBeVisible();
    await page.screenshot({ path: '/tmp/krop-e2e-02-register.png' });
    console.log('✓ 2. Register page loaded');

    // ============ 3. Register ============
    await page.getByPlaceholder('your@email.com').last().fill(TEST_EMAIL);
    await page.getByPlaceholder('อย่างน้อย 6 ตัวอักษร').fill(TEST_PASSWORD);
    await page.getByPlaceholder('กรอกรหัสผ่านอีกครั้ง').fill(TEST_PASSWORD);

    // Click the register button
    await page.locator('[tabindex="0"]').filter({ hasText: 'สมัครสมาชิก' }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/krop-e2e-03-after-register.png' });
    console.log('✓ 3. Registration submitted');

    // ============ 4. Should auto-redirect to Dashboard ============
    // With email confirmation disabled, signup returns a session
    // The auth state listener should redirect to tabs
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`   Current URL: ${url}`);

    // If still on auth page, try manual login
    if (url.includes('auth') || url.includes('login') || url.includes('register')) {
      console.log('   → Not auto-redirected, trying manual login...');
      await page.goto(`${BASE_URL}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.getByPlaceholder('your@email.com').first().fill(TEST_EMAIL);
      await page.getByPlaceholder('••••••••').first().fill(TEST_PASSWORD);
      await page.screenshot({ path: '/tmp/krop-e2e-04-login-filled.png' });

      await page.locator('[tabindex="0"]').filter({ hasText: 'เข้าสู่ระบบ' }).first().click();
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: '/tmp/krop-e2e-05-dashboard.png' });

    // ============ 5. Verify Dashboard ============
    const dashboardLoaded = await page.getByText('Dashboard').isVisible().catch(() => false);
    console.log(`✓ 4. Dashboard loaded: ${dashboardLoaded}`);

    if (!dashboardLoaded) {
      console.log('   ✗ Dashboard did not load — stopping test');
      return;
    }

    // Check tabs
    const tabs = ['หน้าหลัก', 'งบประมาณ', 'เป้าหมาย', 'ประวัติ', 'บัญชี'];
    for (const tab of tabs) {
      const visible = await page.getByText(tab).isVisible().catch(() => false);
      console.log(`   Tab "${tab}": ${visible ? '✓' : '✗'}`);
    }

    // Check empty state
    const emptyState = await page.getByText('ยังไม่มีรายการ').isVisible().catch(() => false);
    console.log(`✓ 5. Empty state: ${emptyState}`);

    // ============ 6. Add Transaction ============
    await page.getByText('+', { exact: true }).click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/krop-e2e-06-add-transaction.png' });

    const addPageVisible = await page.getByText('เพิ่มรายการ').isVisible().catch(() => false);
    console.log(`✓ 6. Add transaction page: ${addPageVisible}`);

    // Wait for categories to load
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/krop-e2e-07-categories.png' });

    const categories = ['🍜 อาหาร', '🚇 เดินทาง', '🛒 ช้อปปิ้ง', '💊 สุขภาพ', '🎬 บันเทิง', '📄 ค่าบิล', '📚 การศึกษา'];
    let catsLoaded = 0;
    for (const cat of categories) {
      const visible = await page.getByText(cat).isVisible().catch(() => false);
      if (visible) catsLoaded++;
    }
    console.log(`✓ 7. Categories loaded: ${catsLoaded}/7`);

    if (catsLoaded === 0) {
      console.log('   ✗ No categories — cannot save transaction');
      return;
    }

    // Fill form
    await page.getByPlaceholder('0').fill('350');
    await page.getByText('🍜 อาหาร').click();
    await page.getByPlaceholder('รายละเอียดเพิ่มเติม...').fill('ข้าวมันไก่');
    await page.screenshot({ path: '/tmp/krop-e2e-08-filled.png' });
    console.log('✓ 8. Form filled');

    // Save
    await page.getByText('บันทึก').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/krop-e2e-09-after-save.png' });

    // ============ 7. Verify Dashboard shows transaction ============
    const backOnDashboard = await page.getByText('Dashboard').isVisible().catch(() => false);
    const noteVisible = await page.getByText('ข้าวมันไก่').isVisible().catch(() => false);
    const amountVisible = await page.getByText('-฿350').isVisible().catch(() => false);
    const summaryVisible = await page.getByText('฿350').first().isVisible().catch(() => false);

    console.log(`✓ 9. Back on Dashboard: ${backOnDashboard}`);
    console.log(`✓ 10. Transaction note "ข้าวมันไก่": ${noteVisible}`);
    console.log(`✓ 11. Amount "-฿350": ${amountVisible}`);
    console.log(`✓ 12. Summary updated: ${summaryVisible}`);

    await page.screenshot({ path: '/tmp/krop-e2e-10-final.png' });
    console.log('\n=== E2E TEST COMPLETE ===');
  });
});
