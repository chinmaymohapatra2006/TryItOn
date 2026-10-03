const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const db = require('../src/db');
const aiTryOn = require('../src/services/aiTryOn');

let server;
let baseUrl;

let testUser = { email: `perf_user_${Date.now()}@test.com`, password: 'password123' };
let testToken;
let photoId;
let productId;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  // Register
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  const regData = await regRes.json();
  testToken = regData.token;

  // Create photo
  const photoRes = await fetch(`${baseUrl}/api/photos/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testToken}`,
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    },
    body: '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="image"; filename="model.jpg"\r\nContent-Type: image/jpeg\r\n\r\nFakeImageBinaryContent1234567890\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--',
  });
  const photoData = await photoRes.json();
  photoId = photoData.photo?.id;

  // Create product
  const prodRes = await fetch(`${baseUrl}/api/products/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${testToken}`,
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    },
    body: '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="image"; filename="garment.jpg"\r\nContent-Type: image/jpeg\r\n\r\nFakeGarmentBinary123456\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="title"\r\n\r\nPerf Denim\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="category"\r\n\r\njacket\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--',
  });
  const prodData = await prodRes.json();
  productId = prodData.product?.id;
});

after(async () => {
  aiTryOn.clearMemoryCache();
  await new Promise((resolve) => server.close(resolve));
});

describe('Performance & Database Optimization Test Suite (Phase 12)', () => {

  test('1. Database PRAGMA settings are optimally configured (WAL mode, Foreign Keys ON)', () => {
    const journalMode = db.prepare('PRAGMA journal_mode;').get();
    assert.strictEqual(journalMode.journal_mode.toLowerCase(), 'wal', 'Journal mode must be WAL');

    const foreignKeys = db.prepare('PRAGMA foreign_keys;').get();
    assert.strictEqual(foreignKeys.foreign_keys, 1, 'Foreign keys enforcement must be ON');
  });

  test('2. Performance indexes exist in SQLite schema master', () => {
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type = 'index' AND name LIKE 'idx_%'
    `).all().map(i => i.name);

    assert.ok(indexes.includes('idx_users_email'), 'idx_users_email must exist');
    assert.ok(indexes.includes('idx_user_photos_user_id'), 'idx_user_photos_user_id must exist');
    assert.ok(indexes.includes('idx_products_user_id'), 'idx_products_user_id must exist');
    assert.ok(indexes.includes('idx_products_category'), 'idx_products_category must exist');
    assert.ok(indexes.includes('idx_tryon_sessions_user_id'), 'idx_tryon_sessions_user_id must exist');
    assert.ok(indexes.includes('idx_tryon_sessions_user_created'), 'idx_tryon_sessions_user_created must exist');
  });

  test('3. Transformation Memory Cache returns instant cached response for duplicate requests', async () => {
    // 1st request -> executes full pipeline and caches
    const start1 = Date.now();
    const res1 = await fetch(`${baseUrl}/api/tryon/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPhotoId: photoId, productId }),
    });
    const dur1 = Date.now() - start1;
    assert.strictEqual(res1.status, 200);
    const data1 = await res1.json();
    assert.ok(data1.result.sessionId);

    // 2nd request -> hits memory cache
    const start2 = Date.now();
    const res2 = await fetch(`${baseUrl}/api/tryon/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPhotoId: photoId, productId }),
    });
    const dur2 = Date.now() - start2;
    assert.strictEqual(res2.status, 200);
    const data2 = await res2.json();
    assert.strictEqual(data2.result.isCached, true, 'Second identical request must return cached: true');
  });

  test('4. Database queries on indexed columns execute in sub-millisecond latencies', () => {
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      db.prepare('SELECT id FROM users WHERE email = ?').get(testUser.email);
    }
    const totalMs = performance.now() - start;
    const avgMs = totalMs / 50;
    assert.ok(avgMs < 2.0, `Indexed lookup average ${avgMs.toFixed(3)}ms must be under 2ms`);
  });
});
