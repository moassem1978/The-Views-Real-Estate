#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('=== Backend Connectivity Test ===\n');

// Test URLs
const testUrls = [
  'http://localhost:5000/api/properties',
  'https://workspace.a0c55713-a01e-4091-b0f7-e63eca936281-00-p0ydoco8gilf.janeway.replit.dev/api/properties',
  'https://theviewsconsultancy.com/api/properties'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = 5000;
    
    console.log(`Testing: ${url}`);
    
    const req = protocol.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`✅ Properties found: ${json.data ? json.data.length : 'N/A'}`);
          console.log(`✅ Response structure: ${Object.keys(json).join(', ')}\n`);
          resolve({ success: true, status: res.statusCode, data: json });
        } catch (e) {
          console.log(`❌ Status: ${res.statusCode}`);
          console.log(`❌ Invalid JSON response`);
          console.log(`❌ Raw response: ${data.substring(0, 200)}...\n`);
          resolve({ success: false, status: res.statusCode, error: 'Invalid JSON' });
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Connection failed: ${error.message}`);
      console.log(`❌ Error code: ${error.code}\n`);
      resolve({ success: false, error: error.message, code: error.code });
    });

    req.on('timeout', () => {
      console.log(`❌ Request timeout after ${timeout}ms\n`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });

    req.setTimeout(timeout);
  });
}

async function runTests() {
  console.log('Testing backend connectivity...\n');
  
  for (const url of testUrls) {
    await testUrl(url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }

  console.log('=== Test Summary ===');
  console.log('1. localhost:5000 - Internal server test');
  console.log('2. Replit URL - External deployment test');
  console.log('3. theviewsconsultancy.com - Production domain test');
  console.log('\nIf localhost works but external URLs fail, check:');
  console.log('- Port forwarding configuration');
  console.log('- DNS settings for custom domain');
  console.log('- SSL certificate status');
}

runTests().catch(console.error);