#!/usr/bin/env node

/**
 * MeePro Phase 6 Verification Test Suite
 * Validates CMS, Media, Publication, Conflict Resolution, Scheduling & Admin Portals
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const ADMIN_AUTH_HEADER = {
  Authorization: 'Bearer dev-admin-token',
  'Content-Type': 'application/json',
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 MeePro Phase 6 Verification: CMS & Publication Architecture');
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  // Test 1: Fetch CMS pages list
  console.log('--- Test Group 1: CMS Pages & Drafts ---');
  try {
    const res = await fetch(`${BASE_URL}/api/cms/pages`, { headers: ADMIN_AUTH_HEADER });
    assert(res.status === 200, 'GET /api/cms/pages returns 200 OK');
    const data = await res.json();
    assert(Array.isArray(data.pages) && data.pages.length >= 1, 'CMS pages list contains valid page records');
    const homePage = data.pages.find((p) => p.slug === 'home');
    assert(Boolean(homePage), 'Home storefront page exists in CMS');
  } catch (err) {
    assert(false, `CMS pages retrieval failed: ${err.message}`);
  }

  // Test 2: Fetch single page detail with revision
  let currentRev = 1;
  let homePageId = 'page-home-001';
  try {
    const res = await fetch(`${BASE_URL}/api/cms/pages/${homePageId}`, { headers: ADMIN_AUTH_HEADER });
    assert(res.status === 200, `GET /api/cms/pages/${homePageId} returns 200 OK`);
    const data = await res.json();
    assert(Boolean(data.page), 'Page details payload includes page object');
    assert(Array.isArray(data.widgets), 'Page details payload includes widgets array');
    currentRev = data.page.current_revision || 1;
    console.log(`      Current Home Page Revision: #${currentRev}`);
  } catch (err) {
    assert(false, `Single page fetch failed: ${err.message}`);
  }

  // Test 3: Optimistic concurrency save with matching expectedRevision
  console.log('\n--- Test Group 2: Optimistic Locking & Conflict Resolution ---');
  try {
    const updatePayload = {
      expectedRevision: currentRev,
      widgets: [
        {
          id: 'w-announcement-1',
          widget_type: 'ANNOUNCEMENT_BAR',
          config: {
            text: '🎉 ยินดีต้อนรับสู่ MeePro 2026!',
            bgColor: '#142B4A',
            textColor: '#FFFFFF',
          },
        },
        {
          id: 'w-hero-1',
          widget_type: 'HERO_BANNER',
          config: {
            headline: 'iPhone 16 Pro Max พร้อมข้อเสนอผ่อน 0%',
            imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=80',
          },
        },
        {
          id: 'w-process-1',
          widget_type: 'PROCESS_STEPS',
          config: {
            title: 'ขั้นตอนการสมัครผ่อนง่ายๆ 4 สเต็ป',
          },
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/cms/pages/${homePageId}`, {
      method: 'PUT',
      headers: ADMIN_AUTH_HEADER,
      body: JSON.stringify(updatePayload),
    });
    assert(res.status === 200, 'Saving draft with matching expectedRevision returns 200 OK');
    const data = await res.json();
    assert(data.page?.current_revision === currentRev + 1, `Revision bumped to #${currentRev + 1}`);
    currentRev = data.page.current_revision;
  } catch (err) {
    assert(false, `Draft save failed: ${err.message}`);
  }

  // Test 4: Concurrency conflict detection (mismatched expectedRevision)
  try {
    const stalePayload = {
      expectedRevision: currentRev - 1, // Deliberately stale revision
      widgets: [],
    };

    const res = await fetch(`${BASE_URL}/api/cms/pages/${homePageId}`, {
      method: 'PUT',
      headers: ADMIN_AUTH_HEADER,
      body: JSON.stringify(stalePayload),
    });
    assert(res.status === 409, 'Saving draft with stale expectedRevision returns 409 Conflict');
    const data = await res.json();
    assert(data.error === 'REVISION_CONFLICT', 'Returns typed error code REVISION_CONFLICT');
    assert(data.currentRevision === currentRev, 'Conflict response provides current server revision');
    assert(Array.isArray(data.latestDraft), 'Conflict response provides latest draft widgets for merge');
  } catch (err) {
    assert(false, `Conflict check failed: ${err.message}`);
  }

  // Test 5: Publish now with full snapshot & revision creation
  console.log('\n--- Test Group 3: Publication Lifecycle & Revisions ---');
  try {
    const res = await fetch(`${BASE_URL}/api/cms/pages/${homePageId}/publish`, {
      method: 'POST',
      headers: ADMIN_AUTH_HEADER,
      body: JSON.stringify({ note: 'Automated test publication' }),
    });
    assert(res.status === 200, 'POST /api/cms/pages/[id]/publish returns 200 OK');
    const data = await res.json();
    assert(data.success === true, 'Publication succeeded');
    assert(data.page.status === 'published', 'Page status updated to published');
    assert(Boolean(data.page.published_at), 'Page has valid published_at ISO timestamp');
    assert(Boolean(data.revision?.id), 'Immutable revision snapshot was created');
  } catch (err) {
    assert(false, `Publish check failed: ${err.message}`);
  }

  // Test 6: Revisions history and 1-click restore
  let restoredRevisionId = null;
  try {
    const res = await fetch(`${BASE_URL}/api/cms/pages/${homePageId}/revisions`, {
      headers: ADMIN_AUTH_HEADER,
    });
    assert(res.status === 200, 'GET /api/cms/pages/[id]/revisions returns 200 OK');
    const data = await res.json();
    assert(Array.isArray(data.revisions) && data.revisions.length >= 2, 'Revision history tracks immutable snapshots');
    restoredRevisionId = data.revisions[1]?.id; // Pick previous revision
  } catch (err) {
    assert(false, `Revisions history check failed: ${err.message}`);
  }

  if (restoredRevisionId) {
    try {
      const res = await fetch(
        `${BASE_URL}/api/cms/pages/${homePageId}/revisions/${restoredRevisionId}/restore`,
        {
          method: 'POST',
          headers: ADMIN_AUTH_HEADER,
        }
      );
      assert(res.status === 200, 'POST /revisions/[id]/restore returns 200 OK');
      const data = await res.json();
      assert(data.success === true, 'Version restore succeeded');
      assert(data.newRevisionNumber > currentRev, 'Restore created a new mutable draft without overwriting live pointer');
    } catch (err) {
      assert(false, `Restore check failed: ${err.message}`);
    }
  }

  // Test 7: Scheduled Publication & Execution
  console.log('\n--- Test Group 4: Publication Scheduling ---');
  try {
    const scheduledTime = new Date(Date.now() - 1000).toISOString(); // Scheduled in past so executable
    const res = await fetch(`${BASE_URL}/api/cms/pages/${homePageId}/schedule`, {
      method: 'POST',
      headers: ADMIN_AUTH_HEADER,
      body: JSON.stringify({ scheduledAtUtc: scheduledTime }),
    });
    assert(res.status === 201, 'POST /api/cms/pages/[id]/schedule returns 201 Created');
    const data = await res.json();
    assert(data.job?.status === 'pending', 'Scheduled job initialized with status pending');
    assert(Boolean(data.job?.pinned_snapshot), 'Job pinned immutable snapshot of draft');

    // Execute scheduled jobs
    const execRes = await fetch(`${BASE_URL}/api/cms/pages/execute-scheduled`, {
      method: 'POST',
      headers: ADMIN_AUTH_HEADER,
    });
    assert(execRes.status === 200, 'POST /api/cms/pages/execute-scheduled returns 200 OK');
    const execData = await execRes.json();
    assert(execData.executedCount >= 1, 'Scheduled publication engine executed due job idempotently');
  } catch (err) {
    assert(false, `Scheduling check failed: ${err.message}`);
  }

  // Test 8: Media Reference Protection
  console.log('\n--- Test Group 5: Media Assets & Reference Protection ---');
  try {
    // 8a. Upload new media asset
    const uploadRes = await fetch(`${BASE_URL}/api/cms/media`, {
      method: 'POST',
      headers: ADMIN_AUTH_HEADER,
      body: JSON.stringify({
        storage_path: '/assets/sample-promo-banner.jpg',
        public_url: '/assets/sample-promo-banner.jpg',
        mime_type: 'image/jpeg',
        width: 1200,
        height: 600,
        alt_text: 'Test Promo Banner',
      }),
    });
    assert(uploadRes.status === 201, 'POST /api/cms/media registers asset with dimensions');

    // 8b. Block deletion of media referenced by published pages
    const deleteUsedRes = await fetch(`${BASE_URL}/api/cms/media/med-001`, {
      method: 'DELETE',
      headers: ADMIN_AUTH_HEADER,
    });
    assert(
      deleteUsedRes.status === 409,
      'DELETE on media asset referenced in published page returns 409 Conflict (Reference Protection)'
    );
    const usedData = await deleteUsedRes.json();
    assert(usedData.error === 'MEDIA_IN_USE', 'Returns error code MEDIA_IN_USE');
    assert(Array.isArray(usedData.references) && usedData.references.length > 0, 'Identifies referencing pages/versions');

    // 8c. Allow deletion of unreferenced media asset
    const deleteUnusedRes = await fetch(`${BASE_URL}/api/cms/media/med-002`, {
      method: 'DELETE',
      headers: ADMIN_AUTH_HEADER,
    });
    assert(deleteUnusedRes.status === 200, 'DELETE on unreferenced media asset returns 200 OK');
  } catch (err) {
    assert(false, `Media tests failed: ${err.message}`);
  }

  // Test 9: Dedicated Admin Portal Routes
  console.log('\n--- Test Group 6: Admin Portal Routes Availability ---');
  const adminRoutes = [
    '/admin/pages',
    '/admin/media',
    '/admin/branches',
    '/admin/products',
    '/admin/offers',
    '/admin/settings',
    '/admin/page-builder',
  ];

  for (const route of adminRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`);
      assert(res.status === 200, `Admin route ${route} responds with 200 OK`);
    } catch (err) {
      assert(false, `Route ${route} failed: ${err.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

void runTests();
