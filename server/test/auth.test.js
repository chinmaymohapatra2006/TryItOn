const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

// Helper to make HTTP requests to the test server
function makeRequest(server, options, body = null) {
  const port = server.address().port;
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: 'localhost',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(reqOptions, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          const json = responseBody ? JSON.parse(responseBody) : null;
          resolve({ statusCode: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, raw: responseBody });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

test('Authentication Test Suite', async (t) => {
  const server = app.listen(0);
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let authToken = null;

  t.after(() => {
    server.close();
  });

  await t.test('1. Register new user returns 201 and JWT token', async () => {
    const res = await makeRequest(server, { path: '/api/auth/register', method: 'POST' }, {
      email: testEmail,
      password: testPassword,
      name: 'Test Fashionista',
    });

    assert.strictEqual(res.statusCode, 201);
    assert.ok(res.body.token, 'Token should be returned on registration');
    assert.strictEqual(res.body.user.email, testEmail);
    assert.strictEqual(res.body.user.name, 'Test Fashionista');
    assert.strictEqual(res.body.user.password_hash, undefined, 'Password hash should NEVER be returned in response');
    authToken = res.body.token;
  });

  await t.test('2. Registering with duplicate email returns 409 Conflict', async () => {
    const res = await makeRequest(server, { path: '/api/auth/register', method: 'POST' }, {
      email: testEmail,
      password: 'AnotherPassword456',
      name: 'Duplicate User',
    });

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.body.error, 'Conflict');
  });

  await t.test('3. Login with correct credentials returns 200 and token', async () => {
    const res = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: testEmail,
      password: testPassword,
    });

    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.token, 'Token should be returned on login');
    assert.strictEqual(res.body.user.email, testEmail);
  });

  await t.test('4. Login with incorrect password returns 401 Unauthorized', async () => {
    const res = await makeRequest(server, { path: '/api/auth/login', method: 'POST' }, {
      email: testEmail,
      password: 'WrongPassword999',
    });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Unauthorized');
  });

  await t.test('5. Access protected route /api/auth/me with valid token returns 200', async () => {
    const res = await makeRequest(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.user.email, testEmail);
    assert.strictEqual(res.body.user.name, 'Test Fashionista');
  });

  await t.test('6. Access protected route /api/auth/me without token returns 401', async () => {
    const res = await makeRequest(server, {
      path: '/api/auth/me',
      method: 'GET',
    });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.error, 'Unauthorized');
  });

  await t.test('7. Access protected route with invalid token returns 401', async () => {
    const res = await makeRequest(server, {
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid_token_string_here',
      },
    });

    assert.strictEqual(res.statusCode, 401);
  });
});
