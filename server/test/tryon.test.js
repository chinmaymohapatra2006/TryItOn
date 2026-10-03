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

test('Cloudinary AI Try-On Integration Test Suite (Phase 6)', async (t) => {
  const server = app.listen(0);

  // Setup user, photos, and different garment products
  const testEmail = `tryon_test_${Date.now()}@example.com`;
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const userResult = insertUser.run(testEmail, 'fake_hash', 'AI Fashionista');
  const userId = Number(userResult.lastInsertRowid);
  const token = jwt.sign({ userId, email: testEmail }, config.jwtSecret, { expiresIn: '1h' });

  // Insert user photo
  const insertPhoto = db.prepare('INSERT INTO user_photos (user_id, image_url, cloudinary_public_id, is_active) VALUES (?, ?, ?, 1)');
  const photoResult = insertPhoto.run(userId, 'http://localhost:5000/uploads/model_fullbody.jpg', 'tryiton/user_photos/model_fullbody');
  const photoId = Number(photoResult.lastInsertRowid);

  // Insert Dress Product
  const insertProduct = db.prepare(`
    INSERT INTO products (user_id, title, category, source_type, image_url, cloudinary_public_id)
    VALUES (?, ?, ?, 'upload', ?, ?)
  `);
  const dressResult = insertProduct.run(userId, 'Boho Floral Midi Dress', 'dress', 'http://localhost:5000/uploads/boho_dress.jpg', 'tryiton/products/boho_dress');
  const dressId = Number(dressResult.lastInsertRowid);

  // Insert Jacket Product
  const jacketResult = insertProduct.run(userId, 'Vintage Leather Biker Jacket', 'jacket', 'http://localhost:5000/uploads/leather_jacket.jpg', 'tryiton/products/leather_jacket');
  const jacketId = Number(jacketResult.lastInsertRowid);

  // Insert Shirt Product
  const shirtResult = insertProduct.run(userId, 'Oxford Casual Cotton Shirt', 'top', 'http://localhost:5000/uploads/oxford_shirt.jpg', 'tryiton/products/oxford_shirt');
  const shirtId = Number(shirtResult.lastInsertRowid);

  let createdSessionId = null;

  t.after(() => {
    server.close();
  });

  await t.test('1. Generate AI Try-On with Dress returns 200 and completed result', async () => {
    const res = await jsonRequest(server, '/api/tryon/generate', 'POST', token, {
      userPhotoId: photoId,
      productId: dressId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.result);
    assert.strictEqual(res.body.result.status, 'completed');
    assert.ok(res.body.result.resultImageUrl);
    assert.strictEqual(res.body.result.garmentTitle, 'Boho Floral Midi Dress');
    assert.strictEqual(res.body.result.garmentCategory, 'dress');
    assert.strictEqual(res.body.result.transformationDetails.preserveFace, true);
    assert.strictEqual(res.body.result.transformationDetails.preserveIdentity, true);
    createdSessionId = res.body.result.sessionId;

    // Verify record in SQLite
    const session = db.prepare('SELECT * FROM tryon_sessions WHERE id = ?').get(createdSessionId);
    assert.strictEqual(session.status, 'completed');
    assert.strictEqual(session.user_id, userId);
    assert.strictEqual(session.product_id, dressId);
  });

  await t.test('2. Generate AI Try-On with Jacket returns 200 and completed result', async () => {
    const res = await jsonRequest(server, '/api/tryon/generate', 'POST', token, {
      userPhotoId: photoId,
      productId: jacketId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.result.status, 'completed');
    assert.strictEqual(res.body.result.garmentTitle, 'Vintage Leather Biker Jacket');
  });

  await t.test('3. Generate AI Try-On with Shirt/Top returns 200', async () => {
    const res = await jsonRequest(server, '/api/tryon/generate', 'POST', token, {
      userPhotoId: photoId,
      productId: shirtId,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.result.status, 'completed');
    assert.strictEqual(res.body.result.garmentTitle, 'Oxford Casual Cotton Shirt');
  });

  await t.test('4. Fetch Try-On Session details by ID returns 200', async () => {
    const res = await jsonRequest(server, `/api/tryon/session/${createdSessionId}`, 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.session.sessionId, createdSessionId);
    assert.strictEqual(res.body.session.status, 'completed');
    assert.strictEqual(res.body.session.garmentTitle, 'Boho Floral Midi Dress');
  });

  await t.test('5. Missing parameters for tryon generation returns 400', async () => {
    const res = await jsonRequest(server, '/api/tryon/generate', 'POST', token, {
      userPhotoId: photoId,
      // missing productId
    });

    assert.strictEqual(res.statusCode, 400);
  });

  await t.test('6. Non-existent product ID returns 422', async () => {
    const res = await jsonRequest(server, '/api/tryon/generate', 'POST', token, {
      userPhotoId: photoId,
      productId: 999999,
    });

    assert.strictEqual(res.statusCode, 422);
  });
});
