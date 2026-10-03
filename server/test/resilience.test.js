const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const db = require('../src/db');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

let server;
let baseUrl;

let userA = { email: `resilience_userA_${Date.now()}@test.com`, password: 'password123' };
let userB = { email: `resilience_userB_${Date.now()}@test.com`, password: 'password123' };
let tokenA;
let tokenB;
let userAPhotoId;
let userAProductId;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;

  // Register User A
  const resA = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userA),
  });
  const dataA = await resA.json();
  tokenA = dataA.token;

  // Register User B
  const resB = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userB),
  });
  const dataB = await resB.json();
  tokenB = dataB.token;

  // Create User A photo
  const photoRes = await fetch(`${baseUrl}/api/photos/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    },
    body: '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="image"; filename="model.jpg"\r\nContent-Type: image/jpeg\r\n\r\nFakeImageBinaryContent1234567890\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--',
  });
  const photoData = await photoRes.json();
  userAPhotoId = photoData.photo?.id;

  // Create User A product
  const prodRes = await fetch(`${baseUrl}/api/products/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenA}`,
      'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    },
    body: '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="image"; filename="garment.jpg"\r\nContent-Type: image/jpeg\r\n\r\nFakeGarmentBinary123456\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="title"\r\n\r\nSilk Shirt\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="category"\r\n\r\ntop\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--',
  });
  const prodData = await prodRes.json();
  userAProductId = prodData.product?.id;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('End-to-End Resilience & Failure Mode Test Suite (Phase 11)', () => {

  // 1. SQL Injection Resilience
  test('1. SQL Injection attempt in login fields is safely handled without errors', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "' OR 1=1 --",
        password: "' OR '1'='1",
      }),
    });
    assert.strictEqual(res.status, 401, 'Should return 401 Unauthorized for SQL injection payload');
    const data = await res.json();
    assert.strictEqual(data.error, 'Unauthorized');
  });

  // 2. Cross-User Access Control
  test('2. User B cannot access or run try-on using User A’s private photo', async () => {
    // User B tries to preprocess User A's photo
    const res = await fetch(`${baseUrl}/api/preprocess/validate-user-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenB}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userPhotoId: userAPhotoId }),
    });

    assert.strictEqual(res.status, 422, 'Should reject access to other user photo with 422');
  });

  // 3. User B cannot inspect User A's try-on sessions
  test('3. User B cannot delete or inspect User A’s try-on sessions', async () => {
    // Generate session for User A
    const genRes = await fetch(`${baseUrl}/api/tryon/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPhotoId: userAPhotoId,
        productId: userAProductId,
      }),
    });
    assert.strictEqual(genRes.status, 200);
    const genData = await genRes.json();
    const sessionId = genData.result.sessionId;

    // User B attempts to fetch User A's session
    const fetchRes = await fetch(`${baseUrl}/api/history/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` },
    });
    assert.strictEqual(fetchRes.status, 404, 'User B must not be able to find User A session');

    // User B attempts to delete User A's session
    const delRes = await fetch(`${baseUrl}/api/history/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` },
    });
    assert.strictEqual(delRes.status, 404, 'User B must not be able to delete User A session');
  });

  // 4. Missing Authorization Header Resilience
  test('4. Endpoints reject missing, malformed, or blank Bearer tokens cleanly', async () => {
    const res1 = await fetch(`${baseUrl}/api/photos`);
    assert.strictEqual(res1.status, 401, 'No auth header -> 401');

    const res2 = await fetch(`${baseUrl}/api/photos`, {
      headers: { 'Authorization': 'Bearer ' },
    });
    assert.strictEqual(res2.status, 401, 'Blank Bearer token -> 401');

    const res3 = await fetch(`${baseUrl}/api/photos`, {
      headers: { 'Authorization': 'Basic invalidbase64' },
    });
    assert.strictEqual(res3.status, 401, 'Non-Bearer scheme -> 401');

    const res4 = await fetch(`${baseUrl}/api/photos`, {
      headers: { 'Authorization': 'Bearer garbage.invalid.token' },
    });
    assert.strictEqual(res4.status, 401, 'Invalid JWT structure -> 401 Unauthorized');
  });

  // 5. Scraper Resilience against Malformed & Inaccessible URLs
  test('5. Scraper handles garbage URL strings with structured error responses', async () => {
    const res = await fetch(`${baseUrl}/api/products/extract-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'not-a-valid-url-format' }),
    });

    assert.strictEqual(res.status, 400, 'Invalid URL format must return 400 Bad Request');
    const data = await res.json();
    assert.ok(data.message.toLowerCase().includes('http'));
  });


  // 6. Handling Try-On when assets are subsequently deleted
  test('6. Try-On handles scenario when photo is deleted before generation', async () => {
    // Delete photo
    await fetch(`${baseUrl}/api/photos/${userAPhotoId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` },
    });

    // Attempt try-on with deleted photo
    const res = await fetch(`${baseUrl}/api/tryon/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userPhotoId: userAPhotoId,
        productId: userAProductId,
      }),
    });

    assert.strictEqual(res.status, 422, 'Must return 422 unprocessable entity for deleted photo');
  });

  // 7. Clear-all on empty history returns 200 OK without errors
  test('7. Clearing empty history succeeds idempotently', async () => {
    const res1 = await fetch(`${baseUrl}/api/history/clear-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` },
    });
    assert.strictEqual(res1.status, 200);

    const res2 = await fetch(`${baseUrl}/api/history/clear-all`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` },
    });
    assert.strictEqual(res2.status, 200);
  });
});
