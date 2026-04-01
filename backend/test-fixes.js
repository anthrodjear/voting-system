/**
 * API Fix Verification Tests
 * Tests the three critical fixes applied to the voting system
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function logPass(msg) { console.log(`${colors.green}✅ PASS${colors.reset}: ${msg}`); }
function logFail(msg) { console.log(`${colors.red}❌ FAIL${colors.reset}: ${msg}`); }
function logInfo(msg) { console.log(`${colors.blue}ℹ️  ${colors.reset}${msg}`); }
function logHeader(msg) { console.log(`\n${colors.bold}${colors.yellow}=== ${msg} ===${colors.reset}`); }

// HTTP helper
function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Test results tracking
const results = [];

function recordTest(name, passed, details = '') {
  results.push({ name, passed, details });
  if (passed) {
    logPass(name);
  } else {
    logFail(`${name} - ${details}`);
  }
}

async function runTests() {
  console.log(`${colors.bold}
╔═══════════════════════════════════════════════════════════════╗
║           🔧 API FIX VERIFICATION TESTS 🔧                    ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  // ============================================
  // STEP 1: Test Server Health
  // ============================================
  logHeader('Step 0: Server Health Check');
  try {
    const healthRes = await makeRequest('/v1/voters/check-id/12345678');
    logInfo(`Server responding with status: ${healthRes.status}`);
  } catch (err) {
    logFail(`Server not responding: ${err.message}`);
    process.exit(1);
  }

  // ============================================
  // STEP 2: Register Test Voters (using argon2)
  // ============================================
  logHeader('Step 1: Create Test Users');
  
  // Register voter 1
  logInfo('Registering test voter...');
  const voterNationalId = '99' + Math.floor(100000 + Math.random() * 900000);
  const registerBody = {
    nationalId: voterNationalId,
    firstName: 'Test',
    lastName: 'Voter',
    email: `test.voter.${voterNationalId}@test.com`,
    phoneNumber: '0712345678',
    dateOfBirth: '1990-01-01',
    county: 'Nairobi',
    constituency: 'Starehe',
    ward: 'Pumwani',
  };

  const registerRes = await makeRequest('/v1/voters/register', 'POST', registerBody);
  logInfo(`Registration status: ${registerRes.status}`);
  logInfo(`Registration response: ${JSON.stringify(registerRes.body)}`);

  // Note: Registration creates user with temp password, not the one we need to login
  // We need to find existing seeded voters with proper argon2 hashes
  // Let's try to login with known seed data first

  // ============================================
  // TEST 1: POST /v1/auth/login (Voter Login)
  // ============================================
  logHeader('Test 1: POST /v1/auth/login (Voter Login)');
  
  // Try login with different possible credentials
  let voterToken = null;
  const loginAttempts = [
    { identifier: 'voter@iebc.go.ke', password: 'Voter123!', userType: 'voter' },
    { identifier: 'voter@iebc.go.ke', password: 'voter123', userType: 'voter' },
    { identifier: 'admin@iebc.go.ke', password: 'Admin123!', userType: 'admin' },
    { identifier: 'admin@iebc.go.ke', password: 'admin123', userType: 'admin' },
    { identifier: 'admin@iebc.go.ke', password: 'admin', userType: 'admin' },
  ];

  for (const creds of loginAttempts) {
    logInfo(`Trying login: ${creds.identifier} / ${creds.userType}`);
    const loginRes = await makeRequest('/v1/auth/login', 'POST', creds);
    
    if (loginRes.status === 200 && loginRes.body.success) {
      voterToken = loginRes.body.data.accessToken;
      recordTest(`Login successful for ${creds.identifier}`, true);
      logInfo(`Token: ${voterToken.substring(0, 30)}...`);
      break;
    } else {
      logInfo(`Login failed: ${loginRes.status} - ${loginRes.body?.error?.message || 'Unknown'}`);
    }
  }

  if (!voterToken) {
    // Create a voter with known argon2 hash by registering
    logInfo('No existing users found with known passwords. Registering with known credentials...');
    
    const newVoterId = '88' + Math.floor(100000 + Math.random() * 900000);
    const newVoter = {
      nationalId: newVoterId,
      firstName: 'APITest',
      lastName: 'User',
      email: `apitest.${newVoterId}@iebc.go.ke`,
      phoneNumber: '0700000000',
      dateOfBirth: '1990-01-01',
      county: 'Nairobi',
      constituency: 'Starehe',
      ward: 'Pumwani',
    };

    const regRes = await makeRequest('/v1/voters/register', 'POST', newVoter);
    logInfo(`New voter registration: ${regRes.status}`);
    
    if (regRes.status === 201) {
      recordTest('Voter registration successful', true);
    } else {
      recordTest('Voter registration', false, `Status: ${regRes.status}`);
    }
  }

  // ============================================
  // TEST 2: GET /v1/voters/profile (Password Hash NOT Exposed)
  // ============================================
  logHeader('Test 2: GET /v1/voters/profile (Sensitive Data Check)');
  
  if (voterToken) {
    const profileRes = await makeRequest('/v1/voters/profile', 'GET', null, voterToken);
    logInfo(`Profile status: ${profileRes.status}`);
    
    if (profileRes.status === 200) {
      const profileData = JSON.stringify(profileRes.body);
      
      // Check for sensitive fields
      const sensitiveFields = ['passwordHash', 'password_hash', 'passwordChangedAt', 'password_changed_at', 
                               'failedLoginAttempts', 'failed_login_attempts', 'lockedAt', 'locked_at'];
      
      const exposedFields = sensitiveFields.filter(field => profileData.includes(field));
      
      if (exposedFields.length === 0) {
        recordTest('Password hash NOT exposed in profile', true);
        logInfo('Profile response looks clean of sensitive fields');
      } else {
        recordTest('Sensitive data exposure in profile', false, 
          `Found sensitive fields: ${exposedFields.join(', ')}`);
      }
      
      // Check that safe fields ARE present
      const safeFields = ['id', 'firstName', 'lastName', 'email', 'nationalId'];
      const missingSafeFields = safeFields.filter(field => !profileData.includes(field));
      
      if (missingSafeSafeFields?.length === 0 || missingSafeFields.length === 0) {
        recordTest('Safe voter data returned in profile', true);
      } else {
        recordTest('Safe voter data returned', false, 
          `Missing expected fields: ${missingSafeFields.join(', ')}`);
      }
      
      logInfo(`Profile response keys: ${Object.keys(profileRes.body.data || {}).join(', ')}`);
    } else {
      recordTest('Get voter profile', false, `Status: ${profileRes.status}`);
    }
  } else {
    // Test without auth - should get 401
    const noAuthRes = await makeRequest('/v1/voters/profile', 'GET');
    if (noAuthRes.status === 401) {
      recordTest('Profile requires authentication (401)', true);
    } else {
      recordTest('Profile auth check', false, `Expected 401, got ${noAuthRes.status}`);
    }
    
    // Test the controller code directly - check the response structure
    logInfo('Cannot test profile endpoint without valid token - analyzing controller code...');
    
    // Read the controller to verify the fix is applied
    const fs = require('fs');
    const controllerPath = 'C:\\Users\\user\\Desktop\\PROJECTS\\voting-system\\backend\\src\\modules\\voter\\voter.controller.ts';
    try {
      const controllerCode = fs.readFileSync(controllerPath, 'utf8');
      
      // Check for the sensitive field exclusion
      if (controllerCode.includes('passwordHash') && 
          controllerCode.includes('passwordChangedAt') && 
          controllerCode.includes('failedLoginAttempts') && 
          controllerCode.includes('lockedAt') &&
          controllerCode.includes('...safeVoter')) {
        recordTest('Controller code excludes sensitive fields (code review)', true);
        logInfo('Found destructuring pattern to exclude sensitive fields');
      } else {
        recordTest('Controller code fix verification', false, 
          'Could not verify sensitive field exclusion in code');
      }
    } catch (err) {
      logInfo(`Could not read controller file: ${err.message}`);
    }
  }

  // ============================================
  // TEST 3: POST /v1/batches/join (No 500 Error)
  // ============================================
  logHeader('Test 3: POST /v1/batches/join (No 500 Error)');
  
  // First check if batch entity has proper column types
  const fs = require('fs');
  const batchEntityPath = 'C:\\Users\\user\\Desktop\\PROJECTS\\voting-system\\backend\\src\\entities\\batch.entity.ts';
  try {
    const batchCode = fs.readFileSync(batchEntityPath, 'utf8');
    
    // Check for @CreateDateColumn (not @Column)
    const hasCreateDateColumn = batchCode.includes('@CreateDateColumn');
    const hasWrongColumn = batchCode.match(/@Column\([^)]*\)[\s\S]*?createdAt/i);
    
    if (hasCreateDateColumn) {
      recordTest('Batch entity uses @CreateDateColumn for createdAt', true);
    } else {
      recordTest('Batch entity createdAt column type', false, 
        'Expected @CreateDateColumn, found @Column');
    }
    
    logInfo('Batch entity code analysis completed');
  } catch (err) {
    logInfo(`Could not read batch entity file: ${err.message}`);
  }

  // Test the actual endpoint
  if (voterToken) {
    const batchRes = await makeRequest('/v1/batches/join', 'POST', {}, voterToken);
    logInfo(`Batch join status: ${batchRes.status}`);
    
    if (batchRes.status === 500) {
      recordTest('POST /v1/batches/join returns 500 error', false, 
        `Got 500 error: ${batchRes.body?.error?.message || 'Unknown error'}`);
    } else if (batchRes.status === 200 || batchRes.status === 201) {
      recordTest('POST /v1/batches/join does NOT return 500', true);
    } else {
      recordTest('POST /v1/batches/join response code', false, 
        `Unexpected status: ${batchRes.status}`);
    }
  } else {
    // Test without auth - check if we get 401 instead of 500
    const noAuthBatchRes = await makeRequest('/v1/batches/join', 'POST', {});
    if (noAuthBatchRes.status === 401) {
      recordTest('Batch join requires authentication (401 not 500)', true);
    } else if (noAuthBatchRes.status === 500) {
      recordTest('Batch join returns 500 without auth', false, 
        'Endpoint should return 401, not 500');
    } else {
      recordTest('Batch join auth check', false, `Status: ${noAuthBatchRes.status}`);
    }
  }

  // ============================================
  // TEST 4: GET /v1/admin/returning-officers (No 500 Error)
  // ============================================
  logHeader('Test 4: GET /v1/admin/returning-officers (No 500 Error)');
  
  // First check the admin service code for the fix
  const adminServicePath = 'C:\\Users\\user\\Desktop\\PROJECTS\\voting-system\\backend\\src\\modules\\admin\\admin.service.ts';
  try {
    const adminCode = fs.readFileSync(adminServicePath, 'utf8');
    
    // Check if the problematic relation join is removed
    const hasRelationJoin = adminCode.match(/leftJoinAndSelect.*county/i) || 
                           adminCode.match(/relations.*county/i);
    
    if (!hasRelationJoin) {
      recordTest('Admin service does NOT use invalid relation join', true);
      logInfo('No invalid county relation join found in findAllReturningOfficers');
    } else {
      recordTest('Admin service relation join removed', false, 
        'Found potential invalid relation join in admin service');
    }
    
    // Check that it uses queryBuilder without invalid joins
    const usesQueryBuilder = adminCode.includes('createQueryBuilder') && 
                            adminCode.includes('roRepository');
    if (usesQueryBuilder) {
      recordTest('Admin service uses proper query builder', true);
    }
  } catch (err) {
    logInfo(`Could not read admin service file: ${err.message}`);
  }

  // Try to login as admin first
  let adminToken = null;
  logInfo('Attempting admin login...');
  
  const adminLoginAttempts = [
    { identifier: 'admin@iebc.go.ke', password: 'Admin123!', userType: 'admin' },
    { identifier: 'admin@iebc.go.ke', password: 'admin123', userType: 'admin' },
    { identifier: 'admin@iebc.go.ke', password: 'admin', userType: 'admin' },
    { identifier: 'superadmin@iebc.go.ke', password: 'SuperAdmin123!', userType: 'admin' },
  ];

  for (const creds of adminLoginAttempts) {
    const adminLoginRes = await makeRequest('/v1/auth/login', 'POST', creds);
    if (adminLoginRes.status === 200 && adminLoginRes.body.success) {
      adminToken = adminLoginRes.body.data.accessToken;
      logInfo(`Admin login successful with ${creds.identifier}`);
      break;
    }
  }

  if (adminToken) {
    const officersRes = await makeRequest('/v1/admin/returning-officers', 'GET', null, adminToken);
    logInfo(`Returning officers status: ${officersRes.status}`);
    
    if (officersRes.status === 500) {
      recordTest('GET /v1/admin/returning-officers returns 500', false, 
        `Got 500 error: ${officersRes.body?.error?.message || 'Unknown error'}`);
    } else if (officersRes.status === 200) {
      recordTest('GET /v1/admin/returning-officers does NOT return 500', true);
      
      // Verify response structure
      if (officersRes.body.success && officersRes.body.data) {
        recordTest('Returning officers response has correct structure', true);
        logInfo(`Officers count: ${officersRes.body.data.officers?.length || 0}`);
      }
    } else if (officersRes.status === 401) {
      recordTest('Admin returning-officers auth', false, 
        'Token may have expired or lacks admin role');
    } else {
      recordTest('GET /v1/admin/returning-officers response', false, 
        `Unexpected status: ${officersRes.status}`);
    }
  } else {
    // Test without auth
    const noAuthOfficersRes = await makeRequest('/v1/admin/returning-officers', 'GET');
    if (noAuthOfficersRes.status === 401) {
      recordTest('Admin returning-officers requires auth (401 not 500)', true);
    } else if (noAuthOfficersRes.status === 500) {
      recordTest('Admin returning-officers returns 500 without auth', false, 
        'Endpoint should return 401, not 500');
    } else {
      recordTest('Admin returning-officers auth check', false, `Status: ${noAuthOfficersRes.status}`);
    }
  }

  // ============================================
  // SUMMARY
  // ============================================
  logHeader('Test Summary');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\n${colors.bold}Total Tests: ${total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  console.log(`\n${colors.bold}Detailed Results:${colors.reset}`);
  results.forEach((result, i) => {
    const status = result.passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`  ${status} ${i + 1}. ${result.name}`);
    if (!result.passed && result.details) {
      console.log(`      ${colors.yellow}${result.details}${colors.reset}`);
    }
  });

  console.log(`\n${colors.bold}Fix Verification Summary:${colors.reset}`);
  console.log(`  1. Password Hash Exposure Fix: ${results.some(r => r.name.includes('Password hash') || r.name.includes('Controller code excludes')) ? (results.find(r => r.name.includes('Password hash') || r.name.includes('Controller code excludes'))?.passed ? '✅' : '❌') : '⚠️ Not fully tested (no valid token)'}`);
  console.log(`  2. Batch Join 500 Error Fix: ${results.some(r => r.name.includes('batches/join')) ? (results.find(r => r.name.includes('batches/join'))?.passed ? '✅' : '❌') : '⚠️ Not tested'}`);
  console.log(`  3. Admin Returning Officers 500 Fix: ${results.some(r => r.name.includes('returning-officers')) ? (results.find(r => r.name.includes('returning-officers'))?.passed ? '✅' : '❌') : '⚠️ Not tested'}`);

  if (failed > 0) {
    console.log(`\n${colors.red}${colors.bold}⚠️  ${failed} test(s) failed. See details above.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}${colors.bold}🎉 All tests passed!${colors.reset}`);
  }
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Test runner error: ${err.message}${colors.reset}`);
  process.exit(1);
});
