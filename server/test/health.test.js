const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

test('Health Check API endpoint returns 200 and status ok', async (t) => {
  const server = app.listen(0);
  const port = server.address().port;

  await new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/api/health`, (res) => {
      assert.strictEqual(res.statusCode, 200);
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          assert.strictEqual(json.status, 'ok');
          assert.strictEqual(json.database, 'connected');
          assert.strictEqual(typeof json.timestamp, 'string');
          server.close(() => resolve());
        } catch (err) {
          server.close(() => reject(err));
        }
      });
    }).on('error', (err) => {
      server.close(() => reject(err));
    });
  });
});
