import test from 'node:test';
import assert from 'node:assert';
import app from '../app.js';

test('GET /api/health returns 200 and expected status object', async () => {
  // Start server on an ephemeral port for testing
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/health`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(typeof data.timestamp, 'string');
    assert.strictEqual(typeof data.uptime, 'string');
    assert.strictEqual(data.services.server, 'healthy');
    assert.strictEqual(typeof data.services.database, 'string');
  } finally {
    server.close();
  }
});

test('GET / returns 200 with API info', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.healthEndpoint, '/api/health');
  } finally {
    server.close();
  }
});

test('GET /unknown-route returns 404', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/unknown-route`);
    const data = await res.json();

    assert.strictEqual(res.status, 404);
    assert.strictEqual(data.status, 'fail');
  } finally {
    server.close();
  }
});
