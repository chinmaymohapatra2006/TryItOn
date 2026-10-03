const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');
const db = require('../src/db');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

// Helper to make JSON request
function jsonRequest(server, path, method, token, body = null) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request({
      hostname: 'localhost',
      port,
      path,
      method,
      headers,
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          const json = responseBody ? JSON.parse(responseBody) : null;
          resolve({ statusCode: res.statusCode, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test('Try-On Result & End-to-End Flow Test Suite (Phase 7)', async (t) => {
  const server = app.listen(0);

  // Setup user, photo, and products
  const testEmail = `result_test_${Date.now()}@example.com`;
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const userResult = insertUser.run(testEmail, 'fake_hash', 'Fashion Tester');
  const userId = Number(userResult.lastInsertRowid);
  const token = jwt.sign({ userId, email: testEmail }, config.jwtSecret, { expiresIn: '1h' });

  // Insert user photo
  const insertPhoto = db.prepare('INSERT INTO user_photos (user_id, image_url, cloudinary_public_id, is_active) VALUES (?, ?, ?, 1)');
  const photoResult = insertPhoto.run(userId, 'http://localhost:5000/uploads/portrait_user.jpg', 'tryiton/user_photos/portrait_user');
  const photoId = Number(photoResult.lastInsertRowid);

  // Insert garment product
  const insertProduct = db.prepare(`
    INSERT INTO products (user_id, title, category, source_type, image_url, cloudinary_public_id)
    VALUES (?, ?, ?, 'upload', ?, ?)
  `);
  const productResult = insertProduct.run(userId, 'Velvet Trench Coat', 'jacket', 'http://localhost:5000/uploads/trench_coat.jpg', 'tryiton/products/trench_coat');
  const productId = Number(productResult.lastInsertRowid);

  let createdSessionId = null;

  t.after(() => {
    server.close();
  });

  await t.test('1. End-to-end Virtual Try-On Generation returns 200 with result payload', async () => {
    const res = await jsonRequest(server, '/api/tryon/generate', 'POST', token, {
      userPhotoId: photoId,
      productId: productId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.result);
    assert.strictEqual(res.body.result.status, 'completed');
    assert.ok(res.body.result.resultImageUrl);
    assert.strictEqual(res.body.result.garmentTitle, 'Velvet Trench Coat');
    createdSessionId = res.body.result.sessionId;
  });

  await t.test('2. Regenerate Try-On session re-runs transformation successfully', async () => {
    const res = await jsonRequest(server, '/api/tryon/regenerate', 'POST', token, {
      sessionId: createdSessionId,
      options: { seed: 42, fitMode: 'relaxed' },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.result);
    assert.strictEqual(res.body.result.sessionId, createdSessionId);
    assert.strictEqual(res.body.result.status, 'completed');
    assert.ok(res.body.result.resultImageUrl);
  });

  await t.test('3. Regenerating with invalid sessionId returns 422', async () => {
    const res = await jsonRequest(server, '/api/tryon/regenerate', 'POST', token, {
      sessionId: 999999,
    });

    assert.strictEqual(res.statusCode, 422);
  });

  await t.test('4. Regenerating without sessionId returns 400 Validation Error', async () => {
    const res = await jsonRequest(server, '/api/tryon/regenerate', 'POST', token, {});

    assert.strictEqual(res.statusCode, 400);
  });

  await t.test('5. Verify full session metadata retrieval', async () => {
    const res = await jsonRequest(server, `/api/tryon/session/${createdSessionId}`, 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.session.sessionId, createdSessionId);
    assert.strictEqual(res.body.session.status, 'completed');
    assert.strictEqual(res.body.session.garmentTitle, 'Velvet Trench Coat');
    assert.ok(res.body.session.userImageUrl);
    assert.ok(res.body.session.productImageUrl);
    assert.ok(res.body.session.resultImageUrl);
  });
});
