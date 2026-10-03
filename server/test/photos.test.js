const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');
const db = require('../src/db');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

// Helper to make multipart/form-data upload request
function uploadFileRequest(server, token, fieldName, filename, fileContent, mimeType) {
  const port = server.address().port;
  const boundary = `----WebKitFormBoundary${Date.now()}`;

  const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;

  const bodyBuffer = Buffer.concat([
    Buffer.from(header, 'utf8'),
    Buffer.isBuffer(fileContent) ? fileContent : Buffer.from(fileContent, 'utf8'),
    Buffer.from(footer, 'utf8'),
  ]);

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port,
      path: '/api/photos/upload',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
        'Authorization': `Bearer ${token}`,
      },
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
    req.write(bodyBuffer);
    req.end();
  });
}

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

test('User Photo System Test Suite (Phase 3)', async (t) => {
  const server = app.listen(0);

  // Create test user in SQLite and generate token
  const testEmail = `photo_test_${Date.now()}@example.com`;
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const userResult = insertUser.run(testEmail, 'fake_hash', 'Photo Tester');
  const userId = Number(userResult.lastInsertRowid);
  const token = jwt.sign({ userId, email: testEmail }, config.jwtSecret, { expiresIn: '1h' });

  let uploadedPhotoId = null;

  t.after(() => {
    server.close();
  });

  await t.test('1. Upload valid JPG user photo returns 201 and stores in SQLite', async () => {
    // 1x1 dummy JPG buffer
    const dummyJpg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0xFF, 0xD9]);
    
    const res = await uploadFileRequest(server, token, 'image', 'model_portrait.jpg', dummyJpg, 'image/jpeg');

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.photo);
    assert.ok(res.body.photo.id);
    assert.ok(res.body.photo.imageUrl);
    assert.strictEqual(res.body.photo.isActive, true);
    uploadedPhotoId = res.body.photo.id;

    // Verify DB entry
    const dbRow = db.prepare('SELECT * FROM user_photos WHERE id = ?').get(uploadedPhotoId);
    assert.strictEqual(dbRow.user_id, userId);
  });

  await t.test('2. Upload valid PNG user photo returns 201', async () => {
    // 1x1 dummy PNG buffer
    const dummyPng = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89]);
    
    const res = await uploadFileRequest(server, token, 'image', 'user_photo.png', dummyPng, 'image/png');

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.photo);
    assert.strictEqual(res.body.photo.isActive, true);
  });

  await t.test('3. Upload with missing file returns 400 Bad Request', async () => {
    const port = server.address().port;
    const res = await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port,
        path: '/api/photos/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data; boundary=empty',
          'Authorization': `Bearer ${token}`,
        },
      }, (r) => {
        let body = '';
        r.on('data', (c) => body += c);
        r.on('end', () => resolve({ statusCode: r.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write('--empty--\r\n');
      req.end();
    });

    assert.strictEqual(res.statusCode, 400);
  });

  await t.test('4. Upload invalid non-image file (e.g. text/plain) returns 400 Validation Error', async () => {
    const res = await uploadFileRequest(server, token, 'image', 'document.txt', 'This is plain text not an image', 'text/plain');

    assert.strictEqual(res.statusCode, 400);
    assert.ok(res.body.message.includes('Invalid file type'));
  });

  await t.test('5. Fetch all user photos returns array', async () => {
    const res = await jsonRequest(server, '/api/photos', 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.photos));
    assert.strictEqual(res.body.photos.length >= 2, true);
  });

  await t.test('6. Fetch active user photo returns current active photo', async () => {
    const res = await jsonRequest(server, '/api/photos/active', 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.photo);
    assert.strictEqual(res.body.photo.isActive, true);
  });

  await t.test('7. Set active photo updates active state in SQLite', async () => {
    const res = await jsonRequest(server, `/api/photos/${uploadedPhotoId}/active`, 'PUT', token);

    assert.strictEqual(res.statusCode, 200);
    const activePhoto = db.prepare('SELECT id FROM user_photos WHERE user_id = ? AND is_active = 1').get(userId);
    assert.strictEqual(activePhoto.id, uploadedPhotoId);
  });

  await t.test('8. Delete user photo removes photo from SQLite', async () => {
    const res = await jsonRequest(server, `/api/photos/${uploadedPhotoId}`, 'DELETE', token);

    assert.strictEqual(res.statusCode, 200);
    const deletedRow = db.prepare('SELECT id FROM user_photos WHERE id = ?').get(uploadedPhotoId);
    assert.strictEqual(deletedRow, undefined);
  });
});
