import fs from 'fs';

async function verifyProductionDeployment() {
  const serverUrl = 'http://localhost:5000';
  const timestamp = Date.now();
  const prodUser = {
    name: 'Mira Kapoor',
    email: `mira_${timestamp}@production-tryiton.com`,
    password: 'ProductionPass2026!'
  };

  console.log('===============================================================');
  console.log('PHASE 12: POST-DEPLOYMENT PRODUCTION VERIFICATION TEST');
  console.log('===============================================================');

  // 1. Verify Production Static Delivery (Frontend SPA)
  console.log('\n[1/8] Verifying Production Frontend Delivery...');
  const dashRes = await fetch(`${serverUrl}/dashboard`, {
    headers: { 'Accept': 'text/html' }
  });
  const dashHtml = await dashRes.text();
  if (!dashHtml.includes('id="root"')) throw new Error('Root div missing from production HTML');
  console.log(' -> Production SPA delivered successfully for /dashboard (HTTP 200)');

  // 2. Verify 3D Assets Delivery & HTTP Cache Headers
  console.log('\n[2/8] Verifying 3D Asset Static Pipeline & Caching Headers...');
  const glbRes = await fetch(`${serverUrl}/costumes/jacket-female.glb`);
  if (glbRes.status !== 200) throw new Error('Costume GLB delivery failed');
  const cacheHeader = glbRes.headers.get('cache-control');
  console.log(` -> Jacket GLB delivered (HTTP 200, length: ${glbRes.headers.get('content-length')} bytes)`);
  console.log(` -> Cache-Control: ${cacheHeader}`);
  if (!cacheHeader || !cacheHeader.includes('max-age=31536000')) throw new Error('Missing production cache header');

  // 3. User Registration
  console.log('\n[3/8] Testing Production User Registration...');
  const regRes = await fetch(`${serverUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prodUser)
  });
  const regData = await regRes.json();
  if (regRes.status !== 201) throw new Error('Production registration failed');
  console.log(` -> Registered user: ${regData.data.user.name} with ID: ${regData.data.user.id}`);

  // 4. User Login & JWT Token
  console.log('\n[4/8] Testing Production User Login...');
  const loginRes = await fetch(`${serverUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: prodUser.email, password: prodUser.password })
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200) throw new Error('Production login failed');
  const token = loginData.token;
  console.log(' -> Authenticated. JWT token acquired.');

  // 5. Measurements Persistence
  console.log('\n[5/8] Testing Measurements Persistence...');
  const measPayload = {
    height: 171.0,
    shoulderWidth: 40.5,
    chest: 91.0,
    waist: 71.0,
    hip: 95.5,
    armLength: 60.5,
    legLength: 81.0
  };
  const measRes = await fetch(`${serverUrl}/api/user/measurements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(measPayload)
  });
  const measData = await measRes.json();
  if (measRes.status !== 200) throw new Error('Save measurements failed');
  console.log(` -> Measurements saved: Height ${measData.data.height} cm, Chest ${measData.data.chest} cm`);

  // 6. Avatar Configuration Persistence
  console.log('\n[6/8] Testing 3D Avatar Configuration Persistence...');
  const avatarPayload = {
    modelGender: 'female',
    modelUrl: '/models/female.glb',
    posePreset: 't-pose',
    poseData: { leftArmZ: 0, rightArmZ: 0, rotationY: 0 }
  };
  const avRes = await fetch(`${serverUrl}/api/user/avatar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(avatarPayload)
  });
  const avData = await avRes.json();
  if (avRes.status !== 200) throw new Error('Save avatar failed');
  console.log(` -> Avatar posture saved: Preset ${avData.data.pose_preset}`);

  // 7. Costume Selection & Fitting Engine
  console.log('\n[7/8] Testing Costume Selection & CostumeFitter Engine...');
  const { CostumeFitter } = await import('../frontend/src/services/CostumeFitter.js');
  const { getCostumeMetadata } = await import('../frontend/src/config/costumeMetadata.js');
  const costumeMeta = getCostumeMetadata('sherwani-female');
  const fitDims = CostumeFitter.calculateBodyDimensions(measPayload, costumeMeta);
  console.log(` -> Costume: Royal Brocade Sherwani [${costumeMeta.category}]`);
  console.log(` -> Body Profile Classified: ${fitDims.profile}`);
  console.log(` -> Calculated Chest Scale: ${fitDims.chestRatio.toFixed(3)}`);
  console.log(` -> Calculated Waist Scale: ${fitDims.waistRatio.toFixed(3)}`);

  // 8. Save Look & Verify Wardrobe Persistence
  console.log('\n[8/8] Testing Save Look & Wardrobe Retrieval...');
  const lookPayload = {
    costumeId: 'sherwani-female',
    lookName: 'Regal Wedding Brocade Look',
    colorway: '#b91c1c',
    customParameters: {
      measurements: measPayload,
      pose: avatarPayload.poseData,
      profile: fitDims.profile
    }
  };
  const lookRes = await fetch(`${serverUrl}/api/user/looks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(lookPayload)
  });
  const lookData = await lookRes.json();
  if (lookRes.status !== 201) throw new Error('Save look failed');
  console.log(` -> Look saved with ID: ${lookData.data.id} Title: ${lookData.data.look_name}`);

  // Retrieve looks list
  const getLooksRes = await fetch(`${serverUrl}/api/user/looks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const getLooksData = await getLooksRes.json();
  if (getLooksData.count !== 1 || getLooksData.data[0].costume_id !== 'sherwani-female') {
    throw new Error('Wardrobe retrieval mismatch');
  }
  console.log(' -> Wardrobe retrieval verified: 1 saved look retrieved successfully.');

  console.log('\n===============================================================');
  console.log('POST-DEPLOYMENT PRODUCTION VERIFICATION COMPLETED (100% PASS)');
  console.log('===============================================================');
}

verifyProductionDeployment().catch(err => {
  console.error('Production verification failed:', err);
  process.exit(1);
});
