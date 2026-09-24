#!/usr/bin/env node

/**
 * MeePro Admin & Staff API Server-Side Authorization Test Suite
 * Validates Section 10 Requirements:
 * A. Unauthenticated mutation request -> HTTP 401 Unauthorized
 * B. Authenticated user without permission -> HTTP 403 Forbidden
 * C. Authorized user (ADMIN / HQ) -> Success (200 / 201)
 * D. Existing public/read endpoints -> HTTP 200 OK (no regression)
 * E. Existing staff workflows -> Scoped & validated (no regression)
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

let totalPassed = 0;
let totalFailed = 0;

function pass(name, msg) {
  console.log(`  ✅ [PASS] ${name}: ${msg}`);
  totalPassed++;
}

function fail(name, msg) {
  console.error(`  ❌ [FAIL] ${name}: ${msg}`);
  totalFailed++;
}

async function runSecurityTests() {
  console.log('================================================================');
  console.log('🔒 MeePro Admin & Staff API Server-Side Authorization Tests');
  console.log(`Target: ${BASE_URL}`);
  console.log('================================================================\n');

  // Test credentials:
  const UNAUTH_HEADERS = { 'Content-Type': 'application/json' };
  const PC_STAFF_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer dev-pcstaff-token',
  };
  const BM_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer dev-manager-token',
  };
  const ADMIN_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer dev-admin-token',
  };
  const HQ_HEADERS = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer dev-hq-token',
  };

  // -------------------------------------------------------------------------
  // 1. /api/admin/branches (POST, PUT, DELETE)
  // -------------------------------------------------------------------------
  console.log('▶ [1/5] Branch Management Authorization (/api/admin/branches)');

  // 1.1 Unauthenticated POST -> 401
  const bUnauth = await fetch(`${BASE_URL}/api/admin/branches`, {
    method: 'POST',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ name: 'Hacker Branch' }),
  });
  if (bUnauth.status === 401) {
    pass('POST /api/admin/branches (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('POST /api/admin/branches (Unauth)', `Expected 401, got ${bUnauth.status}`);
  }

  // 1.2 Unauthorized POST (PC_STAFF) -> 403
  const bPcStaff = await fetch(`${BASE_URL}/api/admin/branches`, {
    method: 'POST',
    headers: PC_STAFF_HEADERS,
    body: JSON.stringify({ name: 'PC Staff Branch' }),
  });
  if (bPcStaff.status === 403) {
    pass('POST /api/admin/branches (PC_STAFF)', 'Rejected with 403 Forbidden');
  } else {
    fail('POST /api/admin/branches (PC_STAFF)', `Expected 403, got ${bPcStaff.status}`);
  }

  // 1.3 Unauthorized POST (BRANCH_MANAGER) -> 403
  const bBm = await fetch(`${BASE_URL}/api/admin/branches`, {
    method: 'POST',
    headers: BM_HEADERS,
    body: JSON.stringify({ name: 'BM Branch' }),
  });
  if (bBm.status === 403) {
    pass('POST /api/admin/branches (BRANCH_MANAGER)', 'Rejected with 403 Forbidden');
  } else {
    fail('POST /api/admin/branches (BRANCH_MANAGER)', `Expected 403, got ${bBm.status}`);
  }

  // 1.4 Authorized POST (ADMIN) -> 201
  const testBranchPayload = {
    name: 'สาขาทดสอบความปลอดภัย HQ',
    slug: `test-sec-branch-${Date.now()}`,
    province: 'กรุงเทพมหานคร',
    region: 'กรุงเทพและปริมณฑล',
    fullAddress: '999 ถนนพระราม 1 แขวงปทุมวัน กรุงเทพมหานคร 10330',
    displayPhone: '02-999-8888',
    openingHours: ['จันทร์ - อาทิตย์: 10:00 - 21:00'],
  };
  const bAdmin = await fetch(`${BASE_URL}/api/admin/branches`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify(testBranchPayload),
  });
  const bAdminData = await bAdmin.json();
  const createdBranchId = bAdminData.data?.id;
  if (bAdmin.status === 201 && createdBranchId) {
    pass('POST /api/admin/branches (ADMIN)', `Branch created successfully (ID: ${createdBranchId})`);
  } else {
    fail('POST /api/admin/branches (ADMIN)', `Expected 201, got ${bAdmin.status}`);
  }

  // 1.5 Unauthenticated PUT / DELETE -> 401
  const bPutUnauth = await fetch(`${BASE_URL}/api/admin/branches/${createdBranchId}`, {
    method: 'PUT',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ name: 'Tampered Name' }),
  });
  if (bPutUnauth.status === 401) {
    pass('PUT /api/admin/branches/[id] (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('PUT /api/admin/branches/[id] (Unauth)', `Expected 401, got ${bPutUnauth.status}`);
  }

  const bDelUnauth = await fetch(`${BASE_URL}/api/admin/branches/${createdBranchId}`, {
    method: 'DELETE',
    headers: UNAUTH_HEADERS,
  });
  if (bDelUnauth.status === 401) {
    pass('DELETE /api/admin/branches/[id] (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('DELETE /api/admin/branches/[id] (Unauth)', `Expected 401, got ${bDelUnauth.status}`);
  }

  // 1.6 Authorized PUT (HQ) -> 200
  const bPutHq = await fetch(`${BASE_URL}/api/admin/branches/${createdBranchId}`, {
    method: 'PUT',
    headers: HQ_HEADERS,
    body: JSON.stringify({ name: 'สาขาทดสอบความปลอดภัย (แก้ไขโดย HQ)' }),
  });
  if (bPutHq.status === 200) {
    pass('PUT /api/admin/branches/[id] (HQ)', 'Branch updated successfully');
  } else {
    fail('PUT /api/admin/branches/[id] (HQ)', `Expected 200, got ${bPutHq.status}`);
  }

  // 1.7 Authorized DELETE (ADMIN) -> 200
  const bDelAdmin = await fetch(`${BASE_URL}/api/admin/branches/${createdBranchId}`, {
    method: 'DELETE',
    headers: ADMIN_HEADERS,
  });
  if (bDelAdmin.status === 200) {
    pass('DELETE /api/admin/branches/[id] (ADMIN)', 'Branch deleted successfully');
  } else {
    fail('DELETE /api/admin/branches/[id] (ADMIN)', `Expected 200, got ${bDelAdmin.status}`);
  }

  // -------------------------------------------------------------------------
  // 2. /api/admin/products (POST, PUT, DELETE, REORDER)
  // -------------------------------------------------------------------------
  console.log('\n▶ [2/5] Product Management Authorization (/api/admin/products)');

  // 2.1 Unauthenticated POST -> 401
  const pUnauth = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ name: 'Hacker Phone' }),
  });
  if (pUnauth.status === 401) {
    pass('POST /api/admin/products (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('POST /api/admin/products (Unauth)', `Expected 401, got ${pUnauth.status}`);
  }

  // 2.2 Unauthorized POST (PC_STAFF) -> 403
  const pPcStaff = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: PC_STAFF_HEADERS,
    body: JSON.stringify({ name: 'PC Staff Phone' }),
  });
  if (pPcStaff.status === 403) {
    pass('POST /api/admin/products (PC_STAFF)', 'Rejected with 403 Forbidden');
  } else {
    fail('POST /api/admin/products (PC_STAFF)', `Expected 403, got ${pPcStaff.status}`);
  }

  // 2.3 Authorized POST (ADMIN) -> 201
  const testProductPayload = {
    name: `สมาร์ทโฟนรุ่นทดสอบ E2E Security ${Date.now()}`,
    brandSlug: 'apple',
    categorySlug: 'smartphones',
    summary: 'สินค้าทดสอบการจำกัดสิทธิ์ API',
    description: 'รายละเอียดสินค้าทดสอบความปลอดภัย',
    basePriceBaht: 29900,
    monthlyFromBaht: 2990,
  };
  const pAdmin = await fetch(`${BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify(testProductPayload),
  });
  const pAdminData = await pAdmin.json();
  const createdProductId = pAdminData.product?.id;
  if (pAdmin.status === 201 && createdProductId) {
    pass('POST /api/admin/products (ADMIN)', `Product created successfully (ID: ${createdProductId})`);
  } else {
    fail('POST /api/admin/products (ADMIN)', `Expected 201, got ${pAdmin.status}`);
  }

  // 2.4 Unauthenticated PUT & REORDER -> 401
  const pPutUnauth = await fetch(`${BASE_URL}/api/admin/products/${createdProductId}`, {
    method: 'PUT',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ name: 'Tampered Product' }),
  });
  if (pPutUnauth.status === 401) {
    pass('PUT /api/admin/products/[id] (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('PUT /api/admin/products/[id] (Unauth)', `Expected 401, got ${pPutUnauth.status}`);
  }

  const pReorderUnauth = await fetch(`${BASE_URL}/api/admin/products/reorder`, {
    method: 'PUT',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ action: 'move', id: createdProductId, direction: 'up' }),
  });
  if (pReorderUnauth.status === 401) {
    pass('PUT /api/admin/products/reorder (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('PUT /api/admin/products/reorder (Unauth)', `Expected 401, got ${pReorderUnauth.status}`);
  }

  // 2.5 Unauthorized REORDER (BRANCH_MANAGER) -> 403
  const pReorderBm = await fetch(`${BASE_URL}/api/admin/products/reorder`, {
    method: 'PUT',
    headers: BM_HEADERS,
    body: JSON.stringify({ action: 'move', id: createdProductId, direction: 'up' }),
  });
  if (pReorderBm.status === 403) {
    pass('PUT /api/admin/products/reorder (BRANCH_MANAGER)', 'Rejected with 403 Forbidden');
  } else {
    fail('PUT /api/admin/products/reorder (BRANCH_MANAGER)', `Expected 403, got ${pReorderBm.status}`);
  }

  // 2.6 Authorized PUT & DELETE (ADMIN) -> 200
  const pPutAdmin = await fetch(`${BASE_URL}/api/admin/products/${createdProductId}`, {
    method: 'PUT',
    headers: ADMIN_HEADERS,
    body: JSON.stringify({ summary: 'อัปเดตคำอธิบายสินค้าเรียบร้อย' }),
  });
  if (pPutAdmin.status === 200) {
    pass('PUT /api/admin/products/[id] (ADMIN)', 'Product updated successfully');
  } else {
    fail('PUT /api/admin/products/[id] (ADMIN)', `Expected 200, got ${pPutAdmin.status}`);
  }

  const pDelAdmin = await fetch(`${BASE_URL}/api/admin/products/${createdProductId}`, {
    method: 'DELETE',
    headers: ADMIN_HEADERS,
  });
  if (pDelAdmin.status === 200) {
    pass('DELETE /api/admin/products/[id] (ADMIN)', 'Product deleted successfully');
  } else {
    fail('DELETE /api/admin/products/[id] (ADMIN)', `Expected 200, got ${pDelAdmin.status}`);
  }

  // -------------------------------------------------------------------------
  // 3. /api/offers (POST, PUT, DELETE)
  // -------------------------------------------------------------------------
  console.log('\n▶ [3/5] Offer Management Authorization (/api/offers)');

  // 3.1 Unauthenticated POST -> 401
  const oUnauth = await fetch(`${BASE_URL}/api/offers`, {
    method: 'POST',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ name: 'Hacker 0% Deal' }),
  });
  if (oUnauth.status === 401) {
    pass('POST /api/offers (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('POST /api/offers (Unauth)', `Expected 401, got ${oUnauth.status}`);
  }

  // 3.2 Unauthorized POST (PC_STAFF) -> 403
  const oPcStaff = await fetch(`${BASE_URL}/api/offers`, {
    method: 'POST',
    headers: PC_STAFF_HEADERS,
    body: JSON.stringify({ name: 'PC Staff Offer' }),
  });
  if (oPcStaff.status === 403) {
    pass('POST /api/offers (PC_STAFF)', 'Rejected with 403 Forbidden');
  } else {
    fail('POST /api/offers (PC_STAFF)', `Expected 403, got ${oPcStaff.status}`);
  }

  // 3.3 Authorized POST (ADMIN) -> 201
  const testOfferPayload = {
    name: 'โปรโมชันพิเศษ ผ่อน 0% นาน 10 เดือน (ทดสอบความปลอดภัย)',
    months: 10,
    interestRatePercent: 0,
    minDownPaymentPercent: 0,
  };
  const oAdmin = await fetch(`${BASE_URL}/api/offers`, {
    method: 'POST',
    headers: ADMIN_HEADERS,
    body: JSON.stringify(testOfferPayload),
  });
  const oAdminData = await oAdmin.json();
  const createdOfferId = oAdminData.offer?.id;
  if (oAdmin.status === 201 && createdOfferId) {
    pass('POST /api/offers (ADMIN)', `Offer created successfully (ID: ${createdOfferId})`);
  } else {
    fail('POST /api/offers (ADMIN)', `Expected 201, got ${oAdmin.status}`);
  }

  // 3.4 Unauthenticated PUT & DELETE -> 401
  const oPutUnauth = await fetch(`${BASE_URL}/api/offers/${createdOfferId}`, {
    method: 'PUT',
    headers: UNAUTH_HEADERS,
    body: JSON.stringify({ name: 'Tampered Offer' }),
  });
  if (oPutUnauth.status === 401) {
    pass('PUT /api/offers/[id] (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('PUT /api/offers/[id] (Unauth)', `Expected 401, got ${oPutUnauth.status}`);
  }

  const oDelUnauth = await fetch(`${BASE_URL}/api/offers/${createdOfferId}`, {
    method: 'DELETE',
    headers: UNAUTH_HEADERS,
  });
  if (oDelUnauth.status === 401) {
    pass('DELETE /api/offers/[id] (Unauth)', 'Rejected with 401 Unauthorized');
  } else {
    fail('DELETE /api/offers/[id] (Unauth)', `Expected 401, got ${oDelUnauth.status}`);
  }

  // 3.5 Authorized DELETE (ADMIN) -> 200
  const oDelAdmin = await fetch(`${BASE_URL}/api/offers/${createdOfferId}`, {
    method: 'DELETE',
    headers: ADMIN_HEADERS,
  });
  if (oDelAdmin.status === 200) {
    pass('DELETE /api/offers/[id] (ADMIN)', 'Offer deleted successfully');
  } else {
    fail('DELETE /api/offers/[id] (ADMIN)', `Expected 200, got ${oDelAdmin.status}`);
  }

  // -------------------------------------------------------------------------
  // 4. Staff Application Role Boundaries (PC_STAFF vs BM/HQ/Admin)
  // -------------------------------------------------------------------------
  console.log('\n▶ [4/5] Staff Application Mutation Boundaries');

  // Find an application ID to test with
  const qRes = await fetch(`${BASE_URL}/api/staff/applications`, {
    headers: { Authorization: 'Bearer dev-admin-token' },
  });
  const qData = await qRes.json();
  const testAppId = qData.applications?.[0]?.id || 'app-demo-cust-001';

  // 4.1 PC_STAFF attempting status update -> 403 Forbidden
  const pcStatusRes = await fetch(`${BASE_URL}/api/staff/applications/${testAppId}/status`, {
    method: 'POST',
    headers: PC_STAFF_HEADERS,
    body: JSON.stringify({ toStatus: 'APPROVED' }),
  });
  if (pcStatusRes.status === 403) {
    pass('POST /api/staff/applications/[id]/status (PC_STAFF)', 'Rejected with 403 Forbidden');
  } else {
    fail('POST /api/staff/applications/[id]/status (PC_STAFF)', `Expected 403, got ${pcStatusRes.status}`);
  }

  // 4.2 PC_STAFF attempting appointment schedule -> 403 Forbidden
  const pcAptRes = await fetch(`${BASE_URL}/api/staff/applications/${testAppId}/appointment`, {
    method: 'POST',
    headers: PC_STAFF_HEADERS,
    body: JSON.stringify({ startsAt: new Date(Date.now() + 86400000).toISOString() }),
  });
  if (pcAptRes.status === 403) {
    pass('POST /api/staff/applications/[id]/appointment (PC_STAFF)', 'Rejected with 403 Forbidden');
  } else {
    fail('POST /api/staff/applications/[id]/appointment (PC_STAFF)', `Expected 403, got ${pcAptRes.status}`);
  }

  // -------------------------------------------------------------------------
  // 5. Public / Read Endpoints Non-Regression
  // -------------------------------------------------------------------------
  console.log('\n▶ [5/5] Public & Read Endpoints Non-Regression');

  const sPublic = await fetch(`${BASE_URL}/api/stores`);
  if (sPublic.status === 200) {
    pass('GET /api/stores', 'Public store listing accessible (HTTP 200)');
  } else {
    fail('GET /api/stores', `Expected 200, got ${sPublic.status}`);
  }

  const pPublic = await fetch(`${BASE_URL}/api/products`);
  if (pPublic.status === 200) {
    pass('GET /api/products', 'Public product catalog accessible (HTTP 200)');
  } else {
    fail('GET /api/products', `Expected 200, got ${pPublic.status}`);
  }

  const oPublic = await fetch(`${BASE_URL}/api/offers`);
  if (oPublic.status === 200) {
    pass('GET /api/offers', 'Public installment plans accessible (HTTP 200)');
  } else {
    fail('GET /api/offers', `Expected 200, got ${oPublic.status}`);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🔒 Security Verification Summary: ${totalPassed} Passed, ${totalFailed} Failed`);
  console.log('================================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runSecurityTests().catch((err) => {
  console.error('Fatal error during security tests:', err);
  process.exit(1);
});
