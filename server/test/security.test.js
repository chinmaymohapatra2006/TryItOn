const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const scraperService = require('../src/services/scraper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../src/config');
const db = require('../src/db');

let server;
let baseUrl;

before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://localhost:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('Security & Production Hardening Test Suite (Phase 10)', () => {

  test('1. Helmet Security Headers are present on responses', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);

    // Verify key security headers set by helmet
    const contentTypeOptions = res.headers.get('x-content-type-options');
    assert.strictEqual(contentTypeOptions, 'nosniff', 'Should include X-Content-Type-Options: nosniff');

    const corp = res.headers.get('cross-origin-resource-policy');
    assert.strictEqual(corp, 'cross-origin', 'Should allow cross-origin resource policy for virtual tryon assets');
  });

  test('2. SSRF Protection correctly identifies and blocks forbidden internal hostnames & metadata IPs', () => {
    // Check forbidden IP detector directly
    assert.strictEqual(scraperService.isForbiddenAddress('169.254.169.254'), true, 'Should block AWS metadata IP');
    assert.strictEqual(scraperService.isForbiddenAddress('localhost'), true, 'Should block localhost');
    assert.strictEqual(scraperService.isForbiddenAddress('127.0.0.1'), true, 'Should block loopback IPv4');
    assert.strictEqual(scraperService.isForbiddenAddress('10.0.0.5'), true, 'Should block private 10.x.x.x');
    assert.strictEqual(scraperService.isForbiddenAddress('192.168.1.100'), true, 'Should block private 192.168.x.x');
    assert.strictEqual(scraperService.isForbiddenAddress('172.20.0.1'), true, 'Should block private 172.16-31.x.x');
    assert.strictEqual(scraperService.isForbiddenAddress('metadata.google.internal'), true, 'Should block GCP metadata');

    // Public domains should be allowed
    assert.strictEqual(scraperService.isForbiddenAddress('images.unsplash.com'), false, 'Should allow public domain');
    assert.strictEqual(scraperService.isForbiddenAddress('example.com'), false, 'Should allow public domain');
    assert.strictEqual(scraperService.isForbiddenAddress('cdn.shopify.com'), false, 'Should allow public domain');
  });

  test('3. Passwords in database are strictly hashed with bcrypt (never plain text)', async () => {
    const testEmail = `security_check_${Date.now()}@example.com`;
    const plainPassword = 'SuperSecurePassword123!';

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: plainPassword, name: 'Sec User' }),
    });
    assert.strictEqual(regRes.status, 201);

    const userInDb = db.prepare('SELECT password_hash FROM users WHERE email = ?').get(testEmail);
    assert.ok(userInDb, 'User must exist in DB');
    assert.notStrictEqual(userInDb.password_hash, plainPassword, 'Password must NOT be plain text');
    assert.ok(userInDb.password_hash.startsWith('$2'), 'Password hash must be a valid bcrypt hash');

    // Verify it validates with bcrypt.compare
    const match = await bcrypt.compare(plainPassword, userInDb.password_hash);
    assert.strictEqual(match, true);
  });

  test('4. Input sanitization prevents script injection in request bodies', async () => {
    const maliciousName = 'Test User <script>alert("xss")</script>';
    const testEmail = `xss_check_${Date.now()}@example.com`;

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'password123', name: maliciousName }),
    });
    assert.strictEqual(regRes.status, 201);

    const data = await regRes.json();
    assert.ok(!data.user.name.includes('<script>'), 'Script tag must be stripped by sanitizer');
  });

  test('5. JWT Tokens cannot be forged or decoded with wrong secret', () => {
    const fakeToken = jwt.sign({ userId: 999, email: 'hacker@example.com' }, 'wrong_secret_key_123');
    
    assert.throws(() => {
      jwt.verify(fakeToken, config.jwtSecret);
    }, /invalid signature/);
  });

  test('6. Non-existent routes return structured 404 response without leaking stack traces', async () => {
    const res = await fetch(`${baseUrl}/api/completely-unknown-route`);
    assert.strictEqual(res.status, 404);
    const data = await res.json();
    assert.strictEqual(data.error, 'Not Found');
  });
});
