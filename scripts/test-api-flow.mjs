// Automated integration test for Auth and Status API
import assert from 'assert';

async function run() {
  console.log('--- Starting Integration Test ---');
  const baseUrl = 'http://localhost:3000';

  // Helper to fetch CSRF token and cookie
  async function getCsrf() {
    const res = await fetch(`${baseUrl}/api/auth/csrf`);
    const data = await res.json();
    const setCookie = res.headers.get('set-cookie');
    assert(data.csrfToken, 'Should have csrfToken');
    return { csrfToken: data.csrfToken, cookie: setCookie };
  }

  // Helper to sign in
  async function login(username, password) {
    const { csrfToken, cookie } = await getCsrf();
    const body = new URLSearchParams({
      csrfToken,
      username,
      password,
      redirect: 'false',
      json: 'true',
    });

    const res = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie || '',
      },
      body: body.toString(),
      redirect: 'manual',
    });

    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
    const sessionCookie = cookies.map(c => c.split(';')[0]).join('; ');
    return sessionCookie;
  }

  // Test 1: Health check
  console.log('Test 1: Health check...');
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'ok', 'Health status should be ok');
  console.log('✓ Health check passed');

  // Test 2: Unauthenticated /api/status -> 401
  console.log('Test 2: Unauthenticated status access...');
  const unauthRes = await fetch(`${baseUrl}/api/status`);
  assert.strictEqual(unauthRes.status, 401, 'Should return 401 Unauthorized');
  console.log('✓ Unauthenticated request correctly blocked');

  // Test 3: Login User 1 (Alice)
  console.log('Test 3: User 1 login...');
  const user1Cookie = await login('user1', 'password123');
  assert(user1Cookie.includes('authjs.session-token') || user1Cookie.includes('next-auth.session-token'), 'Should have session token cookie');
  console.log('✓ User 1 login successful');

  // Test 4: User 1 fetches status
  console.log('Test 4: User 1 fetches /api/status...');
  const statusRes1 = await fetch(`${baseUrl}/api/status`, {
    headers: { Cookie: user1Cookie },
  });
  assert.strictEqual(statusRes1.status, 200, 'Should return 200');
  const statusData1 = await statusRes1.json();
  assert(statusData1.success, 'Response should be successful');
  assert.strictEqual(statusData1.data.users.length, 2, 'Should have exactly 2 users');
  console.log('✓ User 1 fetched 2 users:', statusData1.data.users.map(u => `${u.displayName}: ${u.currentStatus}`));

  // Test 5: User 1 updates status to "hit_me_up"
  console.log('Test 5: User 1 updates status to hit_me_up...');
  const updateRes1 = await fetch(`${baseUrl}/api/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: user1Cookie,
    },
    body: JSON.stringify({ status: 'hit_me_up' }),
  });
  assert.strictEqual(updateRes1.status, 200, 'Update status should return 200');
  const updateData1 = await updateRes1.json();
  assert.strictEqual(updateData1.data.currentStatus, 'hit_me_up', 'Current status should be hit_me_up');
  console.log('✓ User 1 status updated to:', updateData1.data.currentStatus);

  // Test 6: Invalid status rejection
  console.log('Test 6: Reject invalid status...');
  const invalidRes = await fetch(`${baseUrl}/api/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: user1Cookie,
    },
    body: JSON.stringify({ status: 'super_busy_invalid' }),
  });
  assert.strictEqual(invalidRes.status, 400, 'Invalid status should return 400');
  console.log('✓ Invalid status correctly rejected');

  // Test 7: User 2 login (Bob)
  console.log('Test 7: User 2 login...');
  const user2Cookie = await login('user2', 'password456');
  assert(user2Cookie.includes('authjs.session-token') || user2Cookie.includes('next-auth.session-token'), 'Should have session token cookie');
  console.log('✓ User 2 login successful');

  // Test 8: User 2 sees User 1 is "hit_me_up"
  console.log('Test 8: User 2 views status...');
  const statusRes2 = await fetch(`${baseUrl}/api/status`, {
    headers: { Cookie: user2Cookie },
  });
  const statusData2 = await statusRes2.json();
  const aliceStatus = statusData2.data.users.find(u => u.username === 'user1');
  assert.strictEqual(aliceStatus.currentStatus, 'hit_me_up', 'User 2 should see User 1 as hit_me_up');
  console.log(`✓ User 2 sees User 1 status as: ${aliceStatus.currentStatus} (updated: ${aliceStatus.statusUpdatedAt})`);

  // Test 9: User 2 updates status to "available"
  console.log('Test 9: User 2 updates status to available...');
  const updateRes2 = await fetch(`${baseUrl}/api/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: user2Cookie,
    },
    body: JSON.stringify({ status: 'available' }),
  });
  const updateData2 = await updateRes2.json();
  assert.strictEqual(updateData2.data.currentStatus, 'available', 'User 2 status should be available');
  console.log('✓ User 2 status updated to:', updateData2.data.currentStatus);

  // Test 10: User 1 sees User 2 is "available"
  console.log('Test 10: User 1 sees User 2 updated status...');
  const statusRes3 = await fetch(`${baseUrl}/api/status`, {
    headers: { Cookie: user1Cookie },
  });
  const statusData3 = await statusRes3.json();
  const bobStatus = statusData3.data.users.find(u => u.username === 'user2');
  assert.strictEqual(bobStatus.currentStatus, 'available', 'User 1 should see User 2 as available');
  console.log(`✓ User 1 sees User 2 status as: ${bobStatus.currentStatus}`);

  // Test 11: Invalid login
  console.log('Test 11: Invalid login rejection...');
  const badLoginCookie = await login('user1', 'wrongpassword');
  assert(!badLoginCookie.includes('session-token'), 'Bad login should not yield session token');
  console.log('✓ Invalid password correctly rejected');

  console.log('\n=========================================');
  console.log('🎉 ALL 11 INTEGRATION TESTS PASSED!');
  console.log('=========================================\n');
}

run().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
