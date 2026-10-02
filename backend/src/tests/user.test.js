import test from 'node:test';
import assert from 'node:assert';
import app from '../app.js';

test('User Authentication & Persistence: Full workflow (register, login, measurements, avatar, looks)', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    const uniqueEmail = `fashion_user_${Date.now()}@example.com`;
    const password = 'SecurePassword2026!';

    // 1. REGISTER
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password,
        name: 'Aria Sharma'
      })
    });
    const regData = await regRes.json();
    assert.strictEqual(regRes.status, 201);
    assert.strictEqual(regData.status, 'success');
    assert.ok(regData.token);
    assert.strictEqual(regData.data.user.email, uniqueEmail);
    // Security check: Never return password_hash to client
    assert.strictEqual(regData.data.user.password_hash, undefined);

    // 2. LOGIN
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
        password
      })
    });
    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginData.status, 'success');
    assert.ok(loginData.token);
    const authToken = loginData.token;

    // 3. RETRIEVE INITIAL EMPTY PROFILE
    const profileRes = await fetch(`${baseUrl}/user/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileRes.json();
    assert.strictEqual(profileRes.status, 200);
    assert.strictEqual(profileData.data.user.name, 'Aria Sharma');

    // 4. SAVE MEASUREMENTS
    const saveMeasRes = await fetch(`${baseUrl}/user/measurements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        height: 172.5,
        shoulderWidth: 41.0,
        chest: 92.0,
        waist: 72.0,
        hip: 96.0,
        armLength: 61.0,
        legLength: 82.0
      })
    });
    const saveMeasData = await saveMeasRes.json();
    assert.strictEqual(saveMeasRes.status, 200);
    assert.strictEqual(saveMeasData.status, 'success');
    assert.strictEqual(saveMeasData.data.height, 172.5);

    // 5. RETRIEVE MEASUREMENTS
    const getMeasRes = await fetch(`${baseUrl}/user/measurements`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const getMeasData = await getMeasRes.json();
    assert.strictEqual(getMeasRes.status, 200);
    assert.strictEqual(getMeasData.data.height, 172.5);
    assert.strictEqual(getMeasData.data.chest, 92.0);

    // 6. SAVE AVATAR CONFIGURATION
    const saveAvatarRes = await fetch(`${baseUrl}/user/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        modelGender: 'female',
        modelUrl: '/models/female.glb',
        posePreset: 'a-pose',
        poseData: { leftArmZ: 1.1, rightArmZ: -1.1, rotationY: 0.5 }
      })
    });
    const saveAvatarData = await saveAvatarRes.json();
    assert.strictEqual(saveAvatarRes.status, 200);
    assert.strictEqual(saveAvatarData.status, 'success');
    assert.strictEqual(saveAvatarData.data.pose_preset, 'a-pose');

    // 7. RETRIEVE AVATAR CONFIGURATION
    const getAvatarRes = await fetch(`${baseUrl}/user/avatar`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const getAvatarData = await getAvatarRes.json();
    assert.strictEqual(getAvatarRes.status, 200);
    assert.strictEqual(getAvatarData.data.pose_preset, 'a-pose');
    assert.strictEqual(getAvatarData.data.pose_data.rotationY, 0.5);

    // 8. SAVE SELECTED COSTUME & LOOK
    const saveLookRes = await fetch(`${baseUrl}/user/looks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        costumeId: 'kurta-female',
        lookName: 'Diwali Festive Glamour',
        colorway: '#d97706',
        customParameters: {
          fit: 'custom-fitted',
          fabric: 'silk'
        }
      })
    });
    const saveLookData = await saveLookRes.json();
    assert.strictEqual(saveLookRes.status, 201);
    assert.strictEqual(saveLookData.status, 'success');
    assert.strictEqual(saveLookData.data.costume_id, 'kurta-female');
    assert.strictEqual(saveLookData.data.look_name, 'Diwali Festive Glamour');

    // 9. RETRIEVE SAVED LOOKS
    const getLooksRes = await fetch(`${baseUrl}/user/looks`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const getLooksData = await getLooksRes.json();
    assert.strictEqual(getLooksRes.status, 200);
    assert.strictEqual(getLooksData.count, 1);
    assert.strictEqual(getLooksData.data[0].costume_id, 'kurta-female');

    // 10. RETRIEVE LOOK BY ID
    const lookId = saveLookData.data.id;
    const getLookByIdRes = await fetch(`${baseUrl}/user/looks/${lookId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const getLookByIdData = await getLookByIdRes.json();
    assert.strictEqual(getLookByIdRes.status, 200);
    assert.strictEqual(getLookByIdData.data.look_name, 'Diwali Festive Glamour');
    assert.strictEqual(getLookByIdData.data.colorway, '#d97706');

  } finally {
    server.close();
  }
});

test('Security & Auth Guard: Rejects invalid or expired JWT token', async () => {
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    const res = await fetch(`${baseUrl}/user/profile`, {
      headers: { 'Authorization': 'Bearer invalid_garbage_token_here' }
    });
    assert.strictEqual(res.status, 401);
  } finally {
    server.close();
  }
});
