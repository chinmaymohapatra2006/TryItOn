const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');
const db = require('../src/db');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

// Helper to make multipart/form-data upload request
function uploadProductRequest(server, token, fields, file) {
  const port = server.address().port;
  const boundary = `----WebKitFormBoundary${Date.now()}`;

  let bodyBuffers = [];

  // Add text fields
  for (const [key, value] of Object.entries(fields)) {
    const fieldHeader = `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`;
    bodyBuffers.push(Buffer.from(fieldHeader, 'utf8'));
  }

  // Add file
  if (file) {
    const fileHeader = `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldName}"; filename="${file.filename}"\r\nContent-Type: ${file.mimeType}\r\n\r\n`;
    bodyBuffers.push(Buffer.from(fileHeader, 'utf8'));
    bodyBuffers.push(file.content);
    bodyBuffers.push(Buffer.from('\r\n', 'utf8'));
  }

  bodyBuffers.push(Buffer.from(`--${boundary}--\r\n`, 'utf8'));
  const bodyBuffer = Buffer.concat(bodyBuffers);

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port,
      path: '/api/products/upload',
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

test('Product Input System Test Suite (Phase 4)', async (t) => {
  const server = app.listen(0);

  // Mock server to simulate shopping website for Method B testing
  const dummyImageBytes = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0xFF, 0xD9]);
  
  const mockShopServer = http.createServer((req, res) => {
    if (req.url === '/product/floral-dress') {
      const port = mockShopServer.address().port;
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Vintage Floral Summer Dress | Boutique Store</title>
            <meta property="og:title" content="Vintage Floral Summer Dress" />
            <meta property="og:image" content="http://localhost:${port}/images/dress.jpg" />
            <meta property="og:description" content="Elegant floral print summer dress" />
          </head>
          <body>
            <h1>Vintage Floral Summer Dress</h1>
            <img src="http://localhost:${port}/images/dress.jpg" alt="Dress" />
          </body>
        </html>
      `);
    } else if (req.url === '/images/dress.jpg') {
      res.writeHead(200, { 'Content-Type': 'image/jpeg' });
      res.end(dummyImageBytes);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  await new Promise((resolve) => mockShopServer.listen(0, resolve));
  const mockShopPort = mockShopServer.address().port;

  // Create test user & token
  const testEmail = `product_test_${Date.now()}@example.com`;
  const insertUser = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  const userResult = insertUser.run(testEmail, 'fake_hash', 'Garment Shopper');
  const userId = Number(userResult.lastInsertRowid);
  const token = jwt.sign({ userId, email: testEmail }, config.jwtSecret, { expiresIn: '1h' });

  let methodAProductId = null;
  let methodBProductId = null;

  t.after(() => {
    server.close();
    mockShopServer.close();
  });

  // METHOD A TESTS
  await t.test('1. Method A: Upload garment image file returns 201 and stores in SQLite', async () => {
    const dummyJpg = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0xFF, 0xD9]);
    
    const res = await uploadProductRequest(server, token, {
      title: 'Classic Denim Jacket',
      category: 'outerwear',
    }, {
      fieldName: 'image',
      filename: 'denim_jacket.jpg',
      mimeType: 'image/jpeg',
      content: dummyJpg,
    });

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.product);
    assert.strictEqual(res.body.product.title, 'Classic Denim Jacket');
    assert.strictEqual(res.body.product.category, 'outerwear');
    assert.strictEqual(res.body.product.sourceType, 'upload');
    methodAProductId = res.body.product.id;

    // Verify SQLite
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(methodAProductId);
    assert.strictEqual(row.title, 'Classic Denim Jacket');
    assert.strictEqual(row.user_id, userId);
  });

  await t.test('2. Method A: Upload invalid non-image file returns 400', async () => {
    const res = await uploadProductRequest(server, token, {
      title: 'Bad File',
    }, {
      fieldName: 'image',
      filename: 'script.js',
      mimeType: 'application/javascript',
      content: Buffer.from('console.log(123)'),
    });

    assert.strictEqual(res.statusCode, 400);
  });

  // METHOD B TESTS
  await t.test('3. Method B: Extract garment from shopping URL returns 201 and saves product', async () => {
    const testUrl = `http://localhost:${mockShopPort}/product/floral-dress`;

    const res = await jsonRequest(server, '/api/products/extract-url', 'POST', token, {
      url: testUrl,
      category: 'dress',
    });

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.product);
    assert.strictEqual(res.body.product.title, 'Vintage Floral Summer Dress');
    assert.strictEqual(res.body.product.category, 'dress');
    assert.strictEqual(res.body.product.sourceType, 'url');
    assert.strictEqual(res.body.product.sourceUrl, testUrl);
    methodBProductId = res.body.product.id;

    // Verify SQLite
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(methodBProductId);
    assert.strictEqual(row.source_type, 'url');
    assert.strictEqual(row.source_url, testUrl);
  });

  await t.test('4. Method B: Invalid URL format returns 400', async () => {
    const res = await jsonRequest(server, '/api/products/extract-url', 'POST', token, {
      url: 'not-a-valid-url',
    });

    assert.strictEqual(res.statusCode, 400);
  });

  await t.test('5. Method B: Unreachable URL returns 422 Extraction Failed', async () => {
    const res = await jsonRequest(server, '/api/products/extract-url', 'POST', token, {
      url: 'http://localhost:59999/nonexistent-item',
    });

    assert.strictEqual(res.statusCode, 422);
  });

  // PRODUCT LISTING & MANAGEMENT TESTS
  await t.test('6. Fetch user products returns list containing uploaded and URL-extracted items', async () => {
    const res = await jsonRequest(server, '/api/products', 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.products));
    assert.strictEqual(res.body.products.length >= 2, true);
  });

  await t.test('7. Fetch single product by ID returns product details', async () => {
    const res = await jsonRequest(server, `/api/products/${methodAProductId}`, 'GET', token);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.product.id, methodAProductId);
  });

  await t.test('8. Delete product removes product from SQLite', async () => {
    const res = await jsonRequest(server, `/api/products/${methodAProductId}`, 'DELETE', token);

    assert.strictEqual(res.statusCode, 200);
    const deleted = db.prepare('SELECT id FROM products WHERE id = ?').get(methodAProductId);
    assert.strictEqual(deleted, undefined);
  });
});
