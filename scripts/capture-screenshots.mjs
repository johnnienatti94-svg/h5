// scripts/capture-screenshots.mjs
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const SCREENSHOT_DIR = path.resolve('docs/screenshots');

const targets = [
  { name: 'storefront-desktop.png', url: 'http://localhost:3000/home', width: 1280, height: 900 },
  { name: 'storefront-mobile.png', url: 'http://localhost:3000/home', width: 390, height: 844 },
  { name: 'branch-dialog-desktop.png', url: 'http://localhost:3000/stores?branch=centralworld', width: 1280, height: 900 },
  { name: 'branch-dialog-mobile.png', url: 'http://localhost:3000/stores?branch=centralworld', width: 390, height: 844 },
  { name: 'product-detail-desktop.png', url: 'http://localhost:3000/products/iphone-16-pro', width: 1280, height: 900 },
  { name: 'product-detail-mobile.png', url: 'http://localhost:3000/products/iphone-16-pro', width: 390, height: 844 },
  { name: 'application-mobile.png', url: 'http://localhost:3000/apply', width: 390, height: 844 },
  { name: 'visual-cms-desktop.png', url: 'http://localhost:3000/admin/page-builder', width: 1280, height: 900 },
  { name: 'staff-queue-desktop.png', url: 'http://localhost:3000/staff/applications', width: 1280, height: 900 },
  { name: 'admin-dashboard-desktop.png', url: 'http://localhost:3000/admin/pages', width: 1280, height: 900 }
];

async function captureAll() {
  console.log('Capturing specification screenshots with MS Edge headless...');
  for (const target of targets) {
    const outPath = path.join(SCREENSHOT_DIR, target.name);
    const args = [
      '--headless',
      '--disable-gpu',
      `--window-size=${target.width},${target.height}`,
      `--screenshot=${outPath}`,
      target.url
    ];
    try {
      await execFileAsync(EDGE_PATH, args, { timeout: 15000 });
      console.log(`✓ Captured: ${target.name} (${target.width}x${target.height})`);
    } catch (err) {
      console.error(`✗ Failed ${target.name}:`, err.message);
    }
  }
  console.log('Finished capturing screenshots.');
}

captureAll();
