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

test('Image Preprocessing Test Suite (Phase 5)', async (t) => {
  const server = app.listen(0);

  // Setup user, photo, and products in SQLite
  const testEmail = `preprocess_test_${Date.now()}@example.com`;
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const userResult = insertUser.run(testEmail, 'fake_hash', 'Preprocess Model');
  const userId = Number(userResult.lastInsertRowid);
  const token = jwt.sign({ userId, email: testEmail }, config.jwtSecret, { expiresIn: '1h' });

  // Insert user photo
  const insertPhoto = db.prepare('INSERT INTO user_photos (user_id, image_url, cloudinary_public_id, is_active) VALUES (?, ?, ?, 1)');
  const photoResult = insertPhoto.run(userId, 'http://localhost:5000/uploads/model_portrait.jpg', 'tryiton/user_photos/sample_model');
  const photoId = Number(photoResult.lastInsertRowid);

  // Insert product garment
  const insertProduct = db.prepare(`
    INSERT INTO products (user_id, title, category, source_type, image_url, cloudinary_public_id)
    VALUES (?, ?, ?, 'upload', ?, ?)
  `);
  const productResult = insertProduct.run(userId, 'Silk Evening Dress', 'dress', 'http://localhost:5000/uploads/dress.jpg', 'tryiton/products/silk_dress');
  const productId = Number(productResult.lastInsertRowid);

  t.after(() => {
    server.close();
  });

  await t.test('1. Validate User Photo returns 200 and image quality checks', async () => {
    const res = await jsonRequest(server, '/api/preprocess/validate-user-photo', 'POST', token, {
      userPhotoId: photoId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.isValid, true);
    assert.strictEqual(res.body.data.checks.imageAccessible, true);
    assert.strictEqual(res.body.data.checks.personDetected, true);
    assert.ok(res.body.data.preparedUrl);
  });

  await t.test('2. Validate non-existent photo returns 422', async () => {
    const res = await jsonRequest(server, '/api/preprocess/validate-user-photo', 'POST', token, {
      userPhotoId: 999999,
    });

    assert.strictEqual(res.statusCode, 422);
  });

  await t.test('3. Prepare Garment Image returns 200 and maps category target region', async () => {
    const res = await jsonRequest(server, '/api/preprocess/prepare-garment', 'POST', token, {
      productId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.data.isValid, true);
    assert.strictEqual(res.body.data.category, 'dress');
    assert.strictEqual(res.body.data.targetRegion, 'dresses');
    assert.strictEqual(res.body.data.checks.backgroundIsolated, true);
    assert.ok(res.body.data.preparedUrl);
  });

  await t.test('4. Prepare Dual Try-On Pair stages session in SQLite', async () => {
    const res = await jsonRequest(server, '/api/preprocess/prepare-pair', 'POST', token, {
      userPhotoId: photoId,
      productId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.data.sessionId);
    assert.strictEqual(res.body.data.status, 'staged');
    assert.ok(res.body.data.preparedUserImage);
    assert.ok(res.body.data.preparedGarmentImage);

    // Verify session in SQLite
    const session = db.prepare('SELECT * FROM tryon_sessions WHERE id = ?').get(res.body.data.sessionId);
    assert.strictEqual(session.user_id, userId);
    assert.strictEqual(session.product_id, productId);
    assert.strictEqual(session.status, 'staged');
  });

  await t.test('5. Missing parameters for prepare-pair returns 400 Bad Request', async () => {
    const res = await jsonRequest(server, '/api/preprocess/prepare-pair', 'POST', token, {
      userPhotoId: photoId,
      // missing productId
    });

    assert.strictEqual(res.statusCode, 400);
  });
});
