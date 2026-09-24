async function verify() {
  const tests = [
    { url: 'http://localhost:3000/stores', expectedStatus: 200, expectText: 'ค้นหาสาขา MeePro' },
    { url: 'http://localhost:3000/stores/centralworld', expectedStatus: 200, expectText: 'Flagship Store CentralWorld' },
    { url: 'http://localhost:3000/stores/unknown-store', expectedStatus: 200, expectText: 'สาขานี้ไม่มีให้บริการ' },
    { url: 'http://localhost:3000/branches', expectedStatus: 307, redirect: '/stores' },
    { url: 'http://localhost:3000/branches/centralworld', expectedStatus: 307, redirect: '/stores/centralworld' },
    { url: 'http://localhost:3000/location', expectedStatus: 307, redirect: '/stores' },
    { url: 'http://localhost:3000/location/centralworld', expectedStatus: 307, redirect: '/stores/centralworld' },
    { url: 'http://localhost:3000/api/stores', expectedStatus: 200, isJson: true },
    { url: 'http://localhost:3000/api/stores/centralworld', expectedStatus: 200, isJson: true },
    { url: 'http://localhost:3000/api/stores/nonexistent', expectedStatus: 404, isJson: true },
    { url: 'http://localhost:3000/services', expectedStatus: 200, expectText: 'บริการครบวงจรเพื่อคนรักสมาร์ตโฟน' },
    { url: 'http://localhost:3000/faq', expectedStatus: 200, expectText: 'คำถามที่พบบ่อย' },
    { url: 'http://localhost:3000/privacy', expectedStatus: 200, expectText: 'นโยบายการคุ้มครองข้อมูลส่วนบุคคล' },
    { url: 'http://localhost:3000/terms', expectedStatus: 200, expectText: 'ข้อกำหนดและเงื่อนไขการให้บริการ' },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { redirect: 'manual' });
      let ok = res.status === t.expectedStatus;
      if (t.redirect) {
        const loc = res.headers.get('location');
        ok = ok && loc === t.redirect;
      }
      if (t.expectText) {
        const body = await res.text();
        ok = ok && body.includes(t.expectText);
      }
      if (t.isJson) {
        const json = await res.json();
        ok = ok && json !== null;
      }
      if (ok) {
        console.log(`✓ PASS: ${t.url} -> ${res.status}`);
        passed++;
      } else {
        console.error(`✗ FAIL: ${t.url} status: ${res.status}, expected: ${t.expectedStatus}`);
      }
    } catch (err) {
      console.error(`✗ ERROR: ${t.url} -> ${err.message}`);
    }
  }
  console.log(`\nResult: ${passed}/${tests.length} tests passed.`);
  if (passed !== tests.length) process.exit(1);
}

verify();
