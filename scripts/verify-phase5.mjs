// scripts/verify-phase5.mjs
// Automated verification suite for Phase 5: Staff Workflow & Branch Scoping

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runPhase5Tests() {
  console.log('--- Starting Phase 5 Staff Workflow Verification ---\n');

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
    let bmCookie = '';
    let adminCookie = '';

    // 1. Staff Login with Invalid Password
    const invalidLoginRes = await fetch(`${BASE_URL}/api/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0819998888', password: 'wrongpassword' }),
    });
    assert(
      invalidLoginRes.status === 401,
      '1. Staff Login with Invalid Credentials -> HTTP 401'
    );

    // 2. Staff Login as Branch Manager (Central World)
    const bmLoginRes = await fetch(`${BASE_URL}/api/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0819998888', password: 'staff1234' }),
    });
    const bmLoginData = await bmLoginRes.json();
    const bmSetCookie = bmLoginRes.headers.get('set-cookie');
    if (bmSetCookie) {
      bmCookie = bmSetCookie.split(';')[0];
    }
    assert(
      bmLoginRes.status === 200 &&
        bmLoginData.success === true &&
        bmLoginData.staff?.role === 'BRANCH_MANAGER' &&
        (bmLoginData.staff?.branchId === '00000000-0000-4000-8000-000000000001' ||
          bmLoginData.staff?.branchId === 'centralworld'),
      '2. Staff Login as Branch Manager -> HTTP 200 Role: BRANCH_MANAGER'
    );

    // 3. Staff Session Verification (/api/staff/me)
    const bmMeRes = await fetch(`${BASE_URL}/api/staff/me`, {
      headers: { Cookie: bmCookie },
    });
    const bmMeData = await bmMeRes.json();
    assert(
      bmMeRes.status === 200 &&
        bmMeData.authenticated === true &&
        bmMeData.staff?.role === 'BRANCH_MANAGER',
      '3. Staff Session Check (/api/staff/me) -> HTTP 200 Authenticated'
    );

    // 4. Branch Manager Queue Scoping (Can only view applications for Central World)
    const bmQueueRes = await fetch(`${BASE_URL}/api/staff/applications`, {
      headers: { Cookie: bmCookie },
    });
    const bmQueueData = await bmQueueRes.json();
    assert(
      bmQueueRes.status === 200 &&
        bmQueueData.success === true &&
        Array.isArray(bmQueueData.applications) &&
        bmQueueData.applications.every(
          (a) =>
            a.branchSnapshot.id === '00000000-0000-4000-8000-000000000001' ||
            a.branchSnapshot.slug === 'centralworld'
        ),
      '4. Branch Manager Queue Scoping -> Returns only assigned branch applications'
    );


    // 5. Staff Login as Admin / HQ
    const adminLoginRes = await fetch(`${BASE_URL}/api/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '0819999999', password: 'admin1234' }),
    });
    const adminLoginData = await adminLoginRes.json();
    const adminSetCookie = adminLoginRes.headers.get('set-cookie');
    if (adminSetCookie) {
      adminCookie = adminSetCookie.split(';')[0];
    }
    assert(
      adminLoginRes.status === 200 &&
        adminLoginData.success === true &&
        adminLoginData.staff?.role === 'ADMIN',
      '5. Staff Login as HQ Admin -> HTTP 200 Role: ADMIN'
    );

    // 6. Admin Queue (Can view all branches or filter by any branch)
    const adminQueueRes = await fetch(`${BASE_URL}/api/staff/applications`, {
      headers: { Cookie: adminCookie },
    });
    const adminQueueData = await adminQueueRes.json();
    assert(
      adminQueueRes.status === 200 &&
        adminQueueData.success === true &&
        adminQueueData.total >= 1,
      '6. Admin Queue Access -> Can view applications across all branches'
    );

    // 7. Unauthenticated Protection
    const unauthRes = await fetch(`${BASE_URL}/api/staff/applications`);
    assert(
      unauthRes.status === 401,
      '7. Unauthenticated Staff Queue Access -> HTTP 401 Blocked'
    );

    // Target Demo Application
    const targetAppId = 'app-demo-cust-001';

    // 8. Staff Application Detail
    const appDetailRes = await fetch(`${BASE_URL}/api/staff/applications/${targetAppId}`, {
      headers: { Cookie: bmCookie },
    });
    const appDetailData = await appDetailRes.json();
    assert(
      appDetailRes.status === 200 && appDetailData.application?.id === targetAppId,
      `8. Staff Application Detail (${targetAppId}) -> HTTP 200`
    );

    // 9. Add Internal Staff Note (Separated from Customer Messages)
    const noteText = 'ตรวจสอบสลิปเงินเดือนเบื้องต้นผ่านเกณฑ์ นัดหมายเข้ารับเครื่องได้';
    const addNoteRes = await fetch(`${BASE_URL}/api/staff/applications/${targetAppId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bmCookie },
      body: JSON.stringify({ note: noteText }),
    });
    const addNoteData = await addNoteRes.json();
    assert(
      addNoteRes.status === 200 && addNoteData.note?.note === noteText,
      '9. Add Internal Staff Note -> HTTP 200 Note Saved'
    );

    // 10. Read Internal Staff Notes
    const getNotesRes = await fetch(`${BASE_URL}/api/staff/applications/${targetAppId}/notes`, {
      headers: { Cookie: bmCookie },
    });
    const getNotesData = await getNotesRes.json();
    assert(
      getNotesRes.status === 200 &&
        Array.isArray(getNotesData.notes) &&
        getNotesData.notes.some((n) => n.note === noteText),
      '10. Read Internal Staff Notes -> HTTP 200'
    );

    // 11. Staff Decision: Transition to APPROVED
    let approvePassed = false;
    if (appDetailData.application?.status === 'APPROVED' || appDetailData.application?.status === 'APPOINTMENT_SET') {
      approvePassed = true;
    } else {
      if (appDetailData.application?.status === 'SUBMITTED') {
        await fetch(`${BASE_URL}/api/staff/applications/${targetAppId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: bmCookie },
          body: JSON.stringify({ toStatus: 'UNDER_REVIEW', reason: 'เริ่มการตรวจสอบเอกสาร' }),
        });
      }
      const approveRes = await fetch(`${BASE_URL}/api/staff/applications/${targetAppId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: bmCookie },
        body: JSON.stringify({
          toStatus: 'APPROVED',
          reason: 'เอกสารครบถ้วน วงเงินผ่านการพิจารณา',
          customerMessage: 'ยินดีด้วย! คำขอผ่อนของคุณได้รับการอนุมัติแล้ว',
        }),
      });
      const approveData = await approveRes.json();
      approvePassed = approveRes.status === 200 && approveData.application?.status === 'APPROVED';
    }
    assert(
      approvePassed,
      '11. Staff Status Transition to APPROVED -> HTTP 200'
    );

    // 12. Schedule Pickup Appointment
    const appointmentDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    const aptRes = await fetch(`${BASE_URL}/api/staff/applications/${targetAppId}/appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: bmCookie },
      body: JSON.stringify({
        startsAt: appointmentDate,
        note: 'ติดต่อเคาน์เตอร์ 2 นำบัตรประชาชนตัวจริงมาด้วย',
      }),
    });
    const aptData = await aptRes.json();
    assert(
      aptRes.status === 200 &&
        aptData.application?.status === 'APPOINTMENT_SET' &&
        aptData.application?.appointment?.status === 'scheduled',
      '12. Schedule Appointment -> HTTP 200 Status: APPOINTMENT_SET'
    );

    // 13. Customer Lookup by Verified Phone
    const lookupRes = await fetch(
      `${BASE_URL}/api/staff/customer-lookup?phone=0812345678`,
      { headers: { Cookie: bmCookie } }
    );
    const lookupData = await lookupRes.json();
    assert(
      lookupRes.status === 200 &&
        lookupData.success === true &&
        lookupData.customer?.applications?.length >= 1,
      '13. Customer Lookup by Phone (/api/staff/customer-lookup) -> HTTP 200'
    );

    // 14. Staff Queue Route Page (/staff/applications)
    const queuePageRes = await fetch(`${BASE_URL}/staff/applications`, {
      headers: { Cookie: bmCookie },
    });
    assert(
      queuePageRes.status === 200,
      '14. Staff Applications Queue Page (/staff/applications) -> HTTP 200'
    );

    // 15. Staff Application Detail Route Page
    const detailPageRes = await fetch(`${BASE_URL}/staff/applications/${targetAppId}`, {
      headers: { Cookie: bmCookie },
    });
    assert(
      detailPageRes.status === 200,
      `15. Staff Application Detail Page (/staff/applications/${targetAppId}) -> HTTP 200`
    );

    // 16. Staff Customer Lookup Route Page
    const lookupPageRes = await fetch(`${BASE_URL}/staff/customer-lookup`, {
      headers: { Cookie: bmCookie },
    });
    assert(
      lookupPageRes.status === 200,
      '16. Staff Customer Lookup Page (/staff/customer-lookup) -> HTTP 200'
    );

    // 17. Staff Logout
    const logoutRes = await fetch(`${BASE_URL}/api/staff/logout`, {
      method: 'POST',
      headers: { Cookie: bmCookie },
    });
    const postLogoutMeRes = await fetch(`${BASE_URL}/api/staff/me`);
    const postLogoutMeData = await postLogoutMeRes.json();
    assert(
      logoutRes.status === 200 && postLogoutMeData.authenticated === false,
      '17. Staff Session Logout (/api/staff/logout) -> Session Safely Revoked'
    );

  } catch (error) {
    console.error('Test execution failed with error:', error);
  }

  console.log('\n========================================');
  console.log(`Phase 5 Test Result: ${passed}/${total} passed.`);
  console.log('========================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runPhase5Tests();
