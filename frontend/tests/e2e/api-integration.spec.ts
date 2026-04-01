import { test, expect } from '@playwright/test';

test.describe('API Integration Tests - Direct API calls only', () => {
  test('TEST 1: Login with voter credentials', async ({ request }) => {
    console.log('\n=== TEST 1: LOGIN FLOW ===');

    const response = await request.post('http://localhost:3001/v1/auth/login', {
      data: {
        identifier: 'voter@iebc.go.ke',
        password: 'Voter123!',
        userType: 'voter'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));

    if (response.status() === 200) {
      console.log('\n[PASS] Login successful');
      console.log('Token received:', body.data?.accessToken?.substring(0, 50) + '...');
    } else {
      console.log('\n[FAIL] Login failed:', body.error?.message);
    }
  });

  test('TEST 2: Login with admin credentials', async ({ request }) => {
    console.log('\n=== TEST 2: ADMIN LOGIN ===');

    const response = await request.post('http://localhost:3001/v1/auth/login', {
      data: {
        identifier: 'admin@iebc.go.ke',
        password: 'Admin123!',
        userType: 'admin'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));
  });

  test('TEST 3: Login with RO credentials', async ({ request }) => {
    console.log('\n=== TEST 3: RETURNING OFFICER LOGIN ===');

    const response = await request.post('http://localhost:3001/v1/auth/login', {
      data: {
        identifier: 'ro@iebc.go.ke',
        password: 'RO123!',
        userType: 'ro'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));
  });

  test('TEST 4: Register new voter', async ({ request }) => {
    console.log('\n=== TEST 4: NEW VOTER REGISTRATION ===');

    const uniqueId = '88' + Math.floor(100000 + Math.random() * 900000);
    const response = await request.post('http://localhost:3001/v1/voters/register', {
      data: {
        nationalId: uniqueId,
        firstName: 'API',
        lastName: 'Test',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0712345678',
        email: `apitest.${uniqueId}@test.com`,
        county: 'Nairobi',
        constituency: 'Starehe',
        ward: 'Pumwani'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));

    if (response.status() === 201) {
      console.log('\n[PASS] Registration successful');
      console.log('Voter ID:', body.data?.voterId);
    } else {
      console.log('\n[INFO] Registration response:', body.error?.message || 'User may already exist');
    }
  });

  test('TEST 5: Try to register duplicate voter', async ({ request }) => {
    console.log('\n=== TEST 5: DUPLICATE REGISTRATION ===');

    const response = await request.post('http://localhost:3001/v1/voters/register', {
      data: {
        nationalId: '99999999',
        firstName: 'Duplicate',
        lastName: 'Test',
        dateOfBirth: '1990-01-01',
        phoneNumber: '0700000001'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(409);
  });

  test('TEST 6: Login with invalid credentials', async ({ request }) => {
    console.log('\n=== TEST 6: INVALID CREDENTIALS ===');

    const response = await request.post('http://localhost:3001/v1/auth/login', {
      data: {
        identifier: 'invalid@email.com',
        password: 'wrongpassword',
        userType: 'voter'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.message).toContain('Invalid credentials');
  });

  test('TEST 7: Login without userType', async ({ request }) => {
    console.log('\n=== TEST 7: LOGIN WITHOUT USER TYPE ===');

    const response = await request.post('http://localhost:3001/v1/auth/login', {
      data: {
        identifier: 'voter@iebc.go.ke',
        password: 'Voter123!'
      }
    });

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));
  });

  test('TEST 8: Protected route without token', async ({ request }) => {
    console.log('\n=== TEST 8: PROTECTED ROUTE ACCESS ===');

    const response = await request.get('http://localhost:3001/v1/auth/me');

    console.log('Status:', response.status());
    const body = await response.json();
    console.log('Response:', JSON.stringify(body, null, 2));

    expect(response.status()).toBe(401);
  });

  test('TEST 9: Protected route with token after login', async ({ request }) => {
    console.log('\n=== TEST 9: PROTECTED ROUTE WITH TOKEN ===');

    const loginResponse = await request.post('http://localhost:3001/v1/auth/login', {
      data: {
        identifier: 'voter@iebc.go.ke',
        password: 'Voter123!',
        userType: 'voter'
      }
    });

    const loginBody = await loginResponse.json();

    if (loginBody.data?.accessToken) {
      const token = loginBody.data.accessToken;

      const meResponse = await request.get('http://localhost:3001/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Status:', meResponse.status());
      const meBody = await meResponse.json();
      console.log('Response:', JSON.stringify(meBody, null, 2));

      if (meResponse.status() === 200) {
        console.log('[PASS] Successfully authenticated with token');
      }
    } else {
      console.log('[FAIL] Could not get token - login failed');
    }
  });

  test('TEST 10: Health check', async ({ request }) => {
    console.log('\n=== TEST 10: HEALTH CHECK ===');

    const response = await request.get('http://localhost:3001/v1/health');

    console.log('Status:', response.status());
    expect(response.status()).toBe(200);
  });
});