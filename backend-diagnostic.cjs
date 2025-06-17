#!/usr/bin/env node

const http = require('http');
const https = require('https');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000';
const API_EXTERNAL = 'https://workspace.a0c55713-a01e-4091-b0f7-e63eca936281-00-p0ydoco8gilf.janeway.replit.dev';

console.log('🔍 Backend API Diagnostic Starting...\n');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Check if server is running
async function testServerHealth() {
  console.log('1. 🏥 Testing Server Health...');
  
  try {
    const response = await makeRequest(`${API_BASE}/api/properties`);
    console.log(`   ✅ Server responding - Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log(`   📊 Properties endpoint working - Found ${Array.isArray(response.data) ? response.data.length : 'unknown'} properties`);
    }
    
    return response.status < 400;
  } catch (error) {
    console.log(`   ❌ Server not responding: ${error.message}`);
    
    // Try external URL
    try {
      const externalResponse = await makeRequest(`${API_EXTERNAL}/api/properties`);
      console.log(`   ✅ External server responding - Status: ${externalResponse.status}`);
      return externalResponse.status < 400;
    } catch (externalError) {
      console.log(`   ❌ External server also not responding: ${externalError.message}`);
      return false;
    }
  }
}

// Test 2: Check authentication endpoints
async function testAuthentication() {
  console.log('\n2. 🔐 Testing Authentication...');
  
  try {
    // Test login endpoint exists
    const loginResponse = await makeRequest(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });
    
    console.log(`   📝 Login endpoint responding - Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 401) {
      console.log('   ✅ Authentication working (correctly rejecting invalid credentials)');
    } else if (loginResponse.status === 200) {
      console.log('   ⚠️  Login succeeded with test credentials - check default accounts');
    }
    
    // Test session endpoint
    const sessionResponse = await makeRequest(`${API_BASE}/api/auth/session`);
    console.log(`   🎟️  Session endpoint - Status: ${sessionResponse.status}`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ Authentication test failed: ${error.message}`);
    return false;
  }
}

// Test 3: Check CRUD operations (requires auth)
async function testCRUDOperations() {
  console.log('\n3. 🔧 Testing CRUD Operations...');
  
  // Test GET all properties
  try {
    const getResponse = await makeRequest(`${API_BASE}/api/properties`);
    console.log(`   📖 GET /api/properties - Status: ${getResponse.status}`);
    
    if (getResponse.status === 200 && Array.isArray(getResponse.data)) {
      const properties = getResponse.data;
      console.log(`   📊 Found ${properties.length} properties`);
      
      if (properties.length > 0) {
        const testProperty = properties[0];
        console.log(`   🏠 Test property ID: ${testProperty.id}`);
        
        // Test GET single property
        const singleResponse = await makeRequest(`${API_BASE}/api/properties/${testProperty.id}`);
        console.log(`   📖 GET /api/properties/${testProperty.id} - Status: ${singleResponse.status}`);
        
        // Test PATCH (will fail without auth, but should return 401 not 404)
        const patchResponse = await makeRequest(`${API_BASE}/api/properties/${testProperty.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Test Update' })
        });
        console.log(`   ✏️  PATCH /api/properties/${testProperty.id} - Status: ${patchResponse.status} (expect 401)`);
        
        // Test DELETE (will fail without auth, but should return 401 not 404)
        const deleteResponse = await makeRequest(`${API_BASE}/api/properties/${testProperty.id}`, {
          method: 'DELETE'
        });
        console.log(`   🗑️  DELETE /api/properties/${testProperty.id} - Status: ${deleteResponse.status} (expect 401)`);
      }
    }
    
    // Test POST (create) - should fail without auth
    const postResponse = await makeRequest(`${API_BASE}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Property',
        description: 'Test Description',
        price: 100000,
        city: 'Test City'
      })
    });
    console.log(`   ➕ POST /api/properties - Status: ${postResponse.status} (expect 401)`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ CRUD operations test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Check file upload endpoints
async function testFileUpload() {
  console.log('\n4. 📁 Testing File Upload Endpoints...');
  
  try {
    // Test upload endpoint without files (should fail with 400 or 401)
    const uploadResponse = await makeRequest(`${API_BASE}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log(`   📤 POST /api/properties (multipart) - Status: ${uploadResponse.status}`);
    
    // Check if upload directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    const uploadsExists = fs.existsSync(uploadsDir);
    console.log(`   📂 Upload directory exists: ${uploadsExists ? '✅' : '❌'}`);
    
    if (uploadsExists) {
      const stats = fs.statSync(uploadsDir);
      console.log(`   🔒 Upload directory permissions: ${(stats.mode & parseInt('777', 8)).toString(8)}`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ File upload test failed: ${error.message}`);
    return false;
  }
}

// Test 5: Check CORS configuration
async function testCORS() {
  console.log('\n5. 🌐 Testing CORS Configuration...');
  
  try {
    const corsResponse = await makeRequest(`${API_BASE}/api/properties`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log(`   🔗 OPTIONS request - Status: ${corsResponse.status}`);
    console.log(`   🔒 CORS headers present: ${corsResponse.headers['access-control-allow-origin'] ? '✅' : '❌'}`);
    
    if (corsResponse.headers['access-control-allow-origin']) {
      console.log(`   🌍 Allowed origins: ${corsResponse.headers['access-control-allow-origin']}`);
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ CORS test failed: ${error.message}`);
    return false;
  }
}

// Test 6: Environment and configuration check
async function testConfiguration() {
  console.log('\n6. ⚙️  Testing Configuration...');
  
  // Check environment variables
  const requiredEnvVars = ['DATABASE_URL'];
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    console.log(`   ${envVar}: ${value ? '✅ Set' : '❌ Missing'}`);
  });
  
  // Check if production mode
  const nodeEnv = process.env.NODE_ENV;
  console.log(`   NODE_ENV: ${nodeEnv || 'development'}`);
  
  // Check database connectivity
  try {
    const healthResponse = await makeRequest(`${API_BASE}/api/health`);
    console.log(`   🏥 Health endpoint - Status: ${healthResponse.status}`);
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
  }
  
  return true;
}

// Main diagnostic function
async function runDiagnostic() {
  console.log('🚀 Starting comprehensive backend diagnostic...\n');
  
  const results = {
    serverHealth: await testServerHealth(),
    authentication: await testAuthentication(),
    crudOperations: await testCRUDOperations(),
    fileUpload: await testFileUpload(),
    cors: await testCORS(),
    configuration: await testConfiguration()
  };
  
  console.log('\n📊 Diagnostic Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Backend is functioning correctly.');
    console.log('\n💡 If frontend issues persist, check:');
    console.log('   • Frontend API URL configuration');
    console.log('   • Session cookie settings');
    console.log('   • Browser network tab for specific errors');
  } else {
    console.log('\n⚠️  Some tests failed. Check the specific errors above.');
    console.log('\n🔧 Recommended fixes:');
    
    if (!results.serverHealth) {
      console.log('   • Restart the server: npm run dev');
      console.log('   • Check port conflicts');
    }
    
    if (!results.authentication) {
      console.log('   • Verify session configuration');
      console.log('   • Check database connectivity');
    }
    
    if (!results.fileUpload) {
      console.log('   • Check upload directory permissions');
      console.log('   • Verify multer configuration');
    }
  }
  
  console.log('\n🔍 For detailed debugging:');
  console.log('   • Check server logs in terminal');
  console.log('   • Open browser dev tools → Network tab');
  console.log('   • Test admin login with correct credentials');
}

// Run the diagnostic
runDiagnostic().catch(console.error);