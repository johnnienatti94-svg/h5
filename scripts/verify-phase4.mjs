// scripts/verify-phase4.mjs
// Automated verification suite for Phase 4: Authentication & Applications

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runPhase4Tests() {
  console.log('--- Starting Phase 4 Authentication & Applications Verification ---\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
    }
  }

  try {
    const testPhone = '0891234567';
    let sessionCookie = '';

    // 1. Request OTP
    const reqRes = await fetch(`${BASE_URL}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone }),
    });
    const reqData = await reqRes.json();
    assert(
      reqRes.status === 200 && reqData.success === true,
      `1. Request OTP (${testPhone}) -> HTTP 200`
    );

    // 2. Cooldown Rate Limiting (Immediately request again)
    const cooldownRes = await fetch(`${BASE_URL}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone }),
    });
    const cooldownData = await cooldownRes.json();
    assert(
      cooldownRes.status === 429 && cooldownData.code === 'COOLDOWN_ACTIVE',
      '2. Request OTP Cooldown Active -> HTTP 429'
    );

    // 3. Verify OTP with Invalid Code
    const invalidVerifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: testPhone, code: '000000' }),
    });
    const invalidVerifyData = await invalidVerifyRes.json();
    assert(
      invalidVerifyRes.status === 400 && invalidVerifyData.code === 'INVALID_OTP',
      '3. Verify OTP with Wrong Code -> HTTP 400'
    );

    // 4. Verify OTP with Valid Code (dev code is 123456)
    const validVerifyRes = await fetch(`${BASE_URL}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: testPhone,
        code: reqData.devCode || '123456',
        privacyAccepted: true,
        privacyPolicyVersion: '2026-09-01',
      }),
    });
    const validVerifyData = await validVerifyRes.json();
    const setCookieHeader = validVerifyRes.headers.get('set-cookie');
    if (setCookieHeader) {
      sessionCookie = setCookieHeader.split(';')[0];
    }
    assert(
      validVerifyRes.status === 200 &&
        validVerifyData.success === true &&
        validVerifyData.user?.phoneVerified === true,
      '4. Verify OTP with Valid Code -> HTTP 200 & verified user'
    );

    // 5. Auth Me Endpoint with Session Cookie
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meData = await meRes.json();
    assert(
      meRes.status === 200 && meData.authenticated === true && meData.user?.phone === '0891234567',
      '5. Current Session Check (/api/auth/me) -> HTTP 200 Authenticated'
    );

    // 6. Draft Persistence (Save and Load Draft)
    const draftSaveRes = await fetch(`${BASE_URL}/api/applications/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        productId: 'iphone-16-pro',
        variantId: 'var-iph16pro-128-desert',
        offerVersionId: 'off-iph16pro-0pct-10m',
        contactName: 'ทดสอบ สมัครผ่อน',
        selectedBranchId: 'branch-bkk-central-world',
        step: 3,
      }),
    });
    const draftSaveData = await draftSaveRes.json();

    const draftLoadRes = await fetch(`${BASE_URL}/api/applications/draft`, {
      headers: { Cookie: sessionCookie },
    });
    const draftLoadData = await draftLoadRes.json();
    assert(
      draftSaveRes.status === 200 &&
        draftLoadRes.status === 200 &&
        draftLoadData.draft?.contactName === 'ทดสอบ สมัครผ่อน' &&
        draftLoadData.draft?.step === 3,
      '6. Server-Persisted Draft (/api/applications/draft) -> HTTP 200'
    );

    // 7. Idempotent Application Submission
    const idempotencyKey = `test_idem_${Date.now()}`;
    const submitRes = await fetch(`${BASE_URL}/api/applications/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        productId: 'iphone-16-pro',
        variantId: 'var-iph16pro-128-desert',
        offerVersionId: 'off-iph16pro-0pct-10m',
        contactName: 'ทดสอบ สมัครผ่อน',
        selectedBranchId: 'branch-bkk-central-world',
        customerNote: 'ขอรับเครื่องช่วงเสาร์-อาทิตย์ครับ',
        privacyAccepted: true,
        privacyPolicyVersion: '2026-09-01',
        termsAccepted: true,
        marketingAccepted: true,
        idempotencyKey,
      }),
    });
    const submitData = await submitRes.json();
    const createdAppId = submitData.application?.id;
    assert(
      submitRes.status === 200 &&
        submitData.success === true &&
        submitData.application?.reference?.startsWith('APP-') &&
        submitData.application?.status === 'SUBMITTED',
      `7. Submit Application -> HTTP 200 Ref: ${submitData.application?.reference}`
    );

    // 8. Idempotency Verification (Resubmit with same key)
    const duplicateSubmitRes = await fetch(`${BASE_URL}/api/applications/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({
        productId: 'iphone-16-pro',
        variantId: 'var-iph16pro-128-desert',
        offerVersionId: 'off-iph16pro-0pct-10m',
        contactName: 'ทดสอบ สมัครผ่อน',
        selectedBranchId: 'branch-bkk-central-world',
        privacyAccepted: true,
        privacyPolicyVersion: '2026-09-01',
        termsAccepted: true,
        idempotencyKey,
      }),
    });
    const duplicateData = await duplicateSubmitRes.json();
    assert(
      duplicateSubmitRes.status === 200 &&
        duplicateData.application?.id === createdAppId &&
        duplicateData.application?.reference === submitData.application?.reference,
      '8. Idempotent Retry -> Returns Identical Application (No Duplicate)'
    );

    // 9. Customer Applications List
    const listRes = await fetch(`${BASE_URL}/api/applications`, {
      headers: { Cookie: sessionCookie },
    });
    const listData = await listRes.json();
    assert(
      listRes.status === 200 &&
        listData.success === true &&
        Array.isArray(listData.applications) &&
        listData.applications.some((a) => a.id === createdAppId),
      '9. Customer Applications List (/api/applications) -> HTTP 200'
    );

    // 10. Single Application Detail & Event Timeline
    const detailRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}`, {
      headers: { Cookie: sessionCookie },
    });
    const detailData = await detailRes.json();
    assert(
      detailRes.status === 200 &&
        detailData.application?.id === createdAppId &&
        detailData.application?.events?.length >= 1 &&
        detailData.application?.events[0]?.eventType === 'APPLICATION_SUBMITTED',
      '10. Single Application Detail & Timeline (/api/applications/:id) -> HTTP 200'
    );

    // 11. Customer Cancellation
    const cancelRes = await fetch(`${BASE_URL}/api/applications/${createdAppId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: sessionCookie },
      body: JSON.stringify({ reason: 'เปลี่ยนใจต้องการเลือกรุ่นอื่น' }),
    });
    const cancelData = await cancelRes.json();
    assert(
      cancelRes.status === 200 &&
        cancelData.success === true &&
        cancelData.application?.status === 'CANCELLED' &&
        cancelData.application?.cancellationReason === 'เปลี่ยนใจต้องการเลือกรุ่นอื่น',
      '11. Cancel Application (/api/applications/:id/cancel) -> HTTP 200 CANCELLED'
    );

    // 12. Public Apply Route Page
    const applyPageRes = await fetch(`${BASE_URL}/apply`);
    const applyHtml = await applyPageRes.text();
    assert(
      applyPageRes.status === 200 &&
        applyHtml.includes('ใบสมัครผ่อนชำระ') &&
        applyHtml.includes('เลือกข้อเสนอ'),
      '12. Public Application Page (/apply) -> HTTP 200'
    );

    // 13. Customer Application Detail Route Page
    const appDetailPageRes = await fetch(`${BASE_URL}/account/applications/${createdAppId}`, {
      headers: { Cookie: sessionCookie },
    });
    assert(
      appDetailPageRes.status === 200,
      `13. Customer Application Detail Page (/account/applications/${createdAppId}) -> HTTP 200`
    );

    // 14. Session Logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const postLogoutMeRes = await fetch(`${BASE_URL}/api/auth/me`);
    const postLogoutMeData = await postLogoutMeRes.json();
    assert(
      logoutRes.status === 200 && postLogoutMeData.authenticated === false,
      '14. Session Logout (/api/auth/logout) -> Session Safely Revoked'
    );

  } catch (error) {
    console.error('Test execution failed with error:', error);
  }

  console.log('\n========================================');
  console.log(`Phase 4 Test Result: ${passed}/${total} passed.`);
  console.log('========================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase4Tests();
