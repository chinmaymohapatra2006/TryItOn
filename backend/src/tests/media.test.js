import test from 'node:test';
import assert from 'node:assert';
import app from '../app.js';

const VALID_KEY = process.env.MEDIA_UPLOAD_API_KEY || 'tryiton_secure_media_token_2026';

test('Media API: GET /api/media returns list of media assets', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/media`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'success');
    assert.ok(Array.isArray(data.data));
    assert.ok(data.data.length > 0);
    assert.ok(data.data[0].thumbnail_url);
  } finally {
    server.close();
  }
});

test('Media API: GET /api/media/status returns Cloudinary status', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    const res = await fetch(`http://localhost:${port}/api/media/status`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.ok(typeof data.cloudinary.configured === 'boolean');
    assert.strictEqual(data.cloudinary.supportsThumbnails, true);
  } finally {
    server.close();
  }
});

test('Media Security: POST /api/media/upload blocks unauthorized requests (401)', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. Without auth header
    const resNoAuth = await fetch(`http://localhost:${port}/api/media/upload`, {
      method: 'POST',
    });
    assert.strictEqual(resNoAuth.status, 401);

    // 2. With invalid auth header
    const resBadAuth = await fetch(`http://localhost:${port}/api/media/upload`, {
      method: 'POST',
      headers: {
        'x-api-key': 'malicious_invalid_key_123',
      },
    });
    assert.strictEqual(resBadAuth.status, 401);
  } finally {
    server.close();
  }
});

test('Media Upload & Retrieval: End-to-end authorized upload generates thumbnails and stores metadata without exposing credentials', async () => {
  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1x1 transparent PNG pixel
    const pngPixelBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const formData = new FormData();
    const blob = new Blob([pngPixelBuffer], { type: 'image/png' });
    formData.append('file', blob, 'test_costume.png');
    formData.append('category', 'costume');
    formData.append('costumeId', 'test-costume-1');
    formData.append('title', 'Test Costume Asset');

    const uploadRes = await fetch(`http://localhost:${port}/api/media/upload`, {
      method: 'POST',
      headers: {
        'x-api-key': VALID_KEY,
      },
      body: formData,
    });

    const uploadResult = await uploadRes.json();
    assert.strictEqual(uploadRes.status, 201);
    assert.strictEqual(uploadResult.status, 'success');

    const asset = uploadResult.data;
    assert.ok(asset.id);
    assert.ok(asset.thumbnail_url);
    assert.strictEqual(asset.category, 'costume');
    assert.strictEqual(asset.metadata.costumeId, 'test-costume-1');

    // Security check: ensure API secrets/keys are never exposed in JSON output
    assert.strictEqual(asset.api_secret, undefined);
    assert.strictEqual(asset.apiKey, undefined);

    // Verify asset retrieval by ID
    const fetchRes = await fetch(`http://localhost:${port}/api/media/${asset.id}`);
    const fetchResult = await fetchRes.json();
    assert.strictEqual(fetchRes.status, 200);
    assert.strictEqual(fetchResult.data.id, asset.id);
    assert.strictEqual(fetchResult.data.thumbnail_url, asset.thumbnail_url);
  } finally {
    server.close();
  }
});
