async function verifyPhase3() {
  console.log('--- Starting Phase 3 Catalog & Offers Verification ---\n');

  const tests = [
    {
      name: '1. Catalog Page (/products)',
      url: 'http://localhost:3000/products',
      expectedStatus: 200,
      mustInclude: ['สินค้าทั้งหมด', 'iPhone 16 Pro', 'Samsung Galaxy S25 Ultra'],
    },
    {
      name: '2. Catalog Category Filter (?category=smartphone)',
      url: 'http://localhost:3000/products?category=smartphone',
      expectedStatus: 200,
      mustInclude: ['iPhone 16 Pro'],
    },
    {
      name: '3. Catalog Condition Filter (?condition=used)',
      url: 'http://localhost:3000/products?condition=used',
      expectedStatus: 200,
      mustInclude: ['มือสองสภาพ 98%'],
    },
    {
      name: '4. Product Detail Page (/products/iphone-16-pro)',
      url: 'http://localhost:3000/products/iphone-16-pro',
      expectedStatus: 200,
      mustInclude: [
        'iPhone 16 Pro',
        'ผ่อน 0% 10 เดือน',
        'ความพร้อมจำหน่ายที่สาขา',
        'สมัครผ่อนสินค้าเครื่องนี้',
        'ข้อมูลจำเพาะทางเทคนิค',
      ],
    },
    {
      name: '5. Product Detail Page (/products/samsung-galaxy-s25-ultra)',
      url: 'http://localhost:3000/products/samsung-galaxy-s25-ultra',
      expectedStatus: 200,
      mustInclude: ['Samsung Galaxy S25 Ultra', 'Galaxy AI', 'Snapdragon 8 Elite'],
    },
    {
      name: '6. Invalid Product Slug Graceful Unavailable State',
      url: 'http://localhost:3000/products/nonexistent-model',
      expectedStatus: 200,
      mustInclude: ['ไม่พบสินค้าที่คุณต้องการ', 'กลับไปเลือกชมสินค้าทั้งหมด'],
    },
    {
      name: '7. Legacy /catalog redirect to /products',
      url: 'http://localhost:3000/catalog',
      expectedStatus: 307,
      redirectPrefix: '/products',
    },
    {
      name: '8. Products API (/api/products)',
      url: 'http://localhost:3000/api/products',
      expectedStatus: 200,
      validator: (json) => {
        if (!json.success || !Array.isArray(json.data.products)) return false;
        if (json.data.products.length === 0) return false;
        if (!json.data.availableCategories || json.data.availableCategories.length === 0) return false;
        if (!json.data.availableBrands || json.data.availableBrands.length === 0) return false;
        return true;
      },
    },
    {
      name: '9. Single Product API (/api/products/iphone-16-pro)',
      url: 'http://localhost:3000/api/products/iphone-16-pro',
      expectedStatus: 200,
      validator: (json) => {
        if (!json.success || !json.data.product) return false;
        const p = json.data.product;
        // Verify variants
        if (!Array.isArray(p.variants) || p.variants.length === 0) return false;
        // Verify versioned offers & math
        if (!Array.isArray(p.offers) || p.offers.length === 0) return false;
        for (const offer of p.offers) {
          const expectedTotal =
            offer.downPaymentMinor +
            offer.installmentCount * offer.installmentAmountMinor +
            offer.feesTotalMinor;
          if (offer.totalPayableMinor !== expectedTotal) {
            console.error('Math mismatch in offer:', offer);
            return false;
          }
        }
        // Verify branch availability structure
        if (!p.branchAvailability || Object.keys(p.branchAvailability).length === 0) return false;
        return true;
      },
    },
    {
      name: '10. Product API 404 on Unknown Slug',
      url: 'http://localhost:3000/api/products/unknown-phone-xyz',
      expectedStatus: 404,
      validator: (json) => json.success === false && json.error?.code === 'PRODUCT_NOT_FOUND',
    },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { redirect: 'manual' });
      let ok = res.status === t.expectedStatus;

      if (t.redirectPrefix) {
        const loc = res.headers.get('location') || '';
        ok = ok && loc.startsWith(t.redirectPrefix);
      }

      if (t.mustInclude) {
        const text = await res.text();
        for (const str of t.mustInclude) {
          if (!text.includes(str)) {
            ok = false;
            console.error(`  Missing required string "${str}" in ${t.url}`);
          }
        }
      }

      if (t.validator) {
        const json = await res.json();
        if (!t.validator(json)) {
          ok = false;
          console.error(`  Validator failed for ${t.url}`);
        }
      }

      if (ok) {
        console.log(`✓ PASS: ${t.name} -> HTTP ${res.status}`);
        passed++;
      } else {
        console.error(`✗ FAIL: ${t.name} -> status: ${res.status} (expected ${t.expectedStatus})`);
      }
    } catch (err) {
      console.error(`✗ ERROR: ${t.name} -> ${err.message}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Phase 3 Test Result: ${passed}/${tests.length} passed.`);
  console.log(`========================================\n`);

  if (passed !== tests.length) process.exit(1);
}

verifyPhase3();
