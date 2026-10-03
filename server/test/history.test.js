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

test('Try-On History Test Suite (Phase 8)', async (t) => {
  const server = app.listen(0);

  // Setup user, photo, products, and multiple try-on sessions
  const testEmail = `history_test_${Date.now()}@example.com`;
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const userResult = insertUser.run(testEmail, 'fake_hash', 'Wardrobe Collector');
  const userId = Number(userResult.lastInsertRowid);
  const token = jwt.sign({ userId, email: testEmail }, config.jwtSecret, { expiresIn: '1h' });

  // Insert garment
  const insertProduct = db.prepare(`
    INSERT INTO products (user_id, title, category, source_type, image_url, cloudinary_public_id)
    VALUES (?, ?, ?, 'upload', ?, ?)
  `);
  const prodRes = insertProduct.run(userId, 'Embroidered Silk Kurta', 'kurta', 'http://localhost:5000/uploads/kurta.jpg', 'tryiton/products/kurta');
  const productId = Number(prodRes.lastInsertRowid);

  // Insert 2 sessions
  const insertSession = db.prepare(`
    INSERT INTO tryon_sessions (
      user_id, product_id, user_image_url, user_image_public_id,
      product_image_url, product_image_public_id, result_image_url,
      result_public_id, status, transformation_params
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?)
  `);

  const s1 = insertSession.run(
    userId, productId,
    'http://localhost:5000/uploads/u1.jpg', 'u1',
    'http://localhost:5000/uploads/kurta.jpg', 'kurta',
    'http://localhost:5000/uploads/result1.jpg', 'res1',
    JSON.stringify({ engine: 'cloudinary', fidelity: 0.98 })
  );
  const session1Id = Number(s1.lastInsertRowid);

  const s2 = insertSession.run(
    userId, productId,
    'http://localhost:5000/uploads/u1.jpg', 'u1',
    'http://localhost:5000/uploads/kurta.jpg', 'kurta',
    'http://localhost:5000/uploads/result2.jpg', 'res2',
    JSON.stringify({ engine: 'cloudinary', fidelity: 0.95 })
  );
  const session2Id = Number(s2.lastInsertRowid);

  t.after(() => {
    server.close();
  });

  await t.test('1. Fetch all user try-on history returns array of sessions', async () => {
    const res = await jsonRequest(server, '/api/history', 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.sessions));
    assert.strictEqual(res.body.sessions.length, 2);
    assert.strictEqual(res.body.sessions[0].garmentTitle, 'Embroidered Silk Kurta');
    assert.strictEqual(res.body.sessions[0].status, 'completed');
  });

  await t.test('2. Fetch single history session by ID returns session details', async () => {
    const res = await jsonRequest(server, `/api/history/${session1Id}`, 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.session.id, session1Id);
    assert.strictEqual(res.body.session.resultImageUrl, 'http://localhost:5000/uploads/result1.jpg');
    assert.strictEqual(res.body.session.transformationDetails.fidelity, 0.98);
  });

  await t.test('3. Delete single try-on session removes record from SQLite', async () => {
    const res = await jsonRequest(server, `/api/history/${session1Id}`, 'DELETE', token);

    assert.strictEqual(res.statusCode, 200);
    const dbRow = db.prepare('SELECT id FROM tryon_sessions WHERE id = ?').get(session1Id);
    assert.strictEqual(dbRow, undefined);
  });

  await t.test('4. Fetch history after deletion shows remaining session', async () => {
    const res = await jsonRequest(server, '/api/history', 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.sessions.length, 1);
    assert.strictEqual(res.body.sessions[0].id, session2Id);
  });

  await t.test('5. Clear all history empties user history records', async () => {
    const res = await jsonRequest(server, '/api/history/clear-all', 'POST', token);

    assert.strictEqual(res.statusCode, 200);
    const remaining = db.prepare('SELECT id FROM tryon_sessions WHERE user_id = ?').all(userId);
    assert.strictEqual(remaining.length, 0);
  });

  await t.test('6. Unauthorized request without token returns 401', async () => {
    const res = await jsonRequest(server, '/api/history', 'GET', null);

    assert.strictEqual(res.statusCode, 401);
  });
});
