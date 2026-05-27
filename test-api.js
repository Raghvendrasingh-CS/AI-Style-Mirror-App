const { predictFit } = require('./fit-ml-engine.js');
const http = require('http');

// --- 1. UNIT TEST SUITE ---
function runUnitTests() {
  console.log('=== Running Unit Tests on ML Fit Engine ===');
  
  const testCases = [
    {
      name: 'Goal Input Case (Slightly Tight)',
      body: { chest: 38, waist: 32, hip: 36, shoulder: 18, height: 175 },
      garment: { chest: 39, waist: 33, length: 70, fit_type: 'slim', fabric_stretch: 0.2 },
      expected: { fit_percentage: 94, fit_label: 'Slightly Tight', tightness_score: -6 }
    },
    {
      name: 'Too Tight Boundary Case',
      body: { chest: 45, waist: 40, hip: 42, shoulder: 18, height: 175 },
      garment: { chest: 39, waist: 34, length: 70, fit_type: 'slim', fabric_stretch: 0.0 },
      expected: { fit_label: 'Too Tight' }
    },
    {
      name: 'Too Loose Boundary Case',
      body: { chest: 30, waist: 25, hip: 32, shoulder: 18, height: 175 },
      garment: { chest: 45, waist: 40, length: 70, fit_type: 'regular', fabric_stretch: 0.0 },
      expected: { fit_label: 'Too Loose' }
    },
    {
      name: 'Perfect Fit Case',
      body: { chest: 38, waist: 32, hip: 36, shoulder: 18, height: 175 },
      garment: { chest: 40, waist: 34, length: 70, fit_type: 'slim', fabric_stretch: 0.2 },
      expected: { fit_label: 'Perfect Fit' }
    }
  ];

  let passed = 0;
  testCases.forEach(tc => {
    const result = predictFit(tc.body, tc.garment);
    console.log(`\nTest Case: ${tc.name}`);
    console.log(`Input Body:`, tc.body);
    console.log(`Input Garment:`, tc.garment);
    console.log(`Prediction:`, result);
    
    let match = true;
    for (const key in tc.expected) {
      if (result[key] !== tc.expected[key]) {
        console.error(`  FAIL: Expected key '${key}' to be '${tc.expected[key]}', got '${result[key]}'`);
        match = false;
      }
    }
    if (match) {
      console.log(`  PASS`);
      passed++;
    }
  });

  console.log(`\nUnit Tests Result: ${passed}/${testCases.length} Passed`);
  return passed === testCases.length;
}

// --- 2. INTEGRATION TEST SUITE (HTTP API) ---
function runIntegrationTests() {
  console.log('\n=== Running Integration Tests against Local HTTP Server ===');
  console.log('Sending request to http://localhost:3000/predict-fit ...');

  const postData = JSON.stringify({
    body: { chest: 38, waist: 32, hip: 36, shoulder: 18, height: 175 },
    garment: { chest: 39, waist: 33, length: 70, fit_type: 'slim', fabric_stretch: 0.2 }
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/predict-fit',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const responseData = JSON.parse(rawData);
        console.log('API Response:', responseData);
        if (res.statusCode === 200 && responseData.fit_percentage === 94 && responseData.fit_label === 'Slightly Tight') {
          console.log('  PASS: HTTP response matches goal specifications!');
          process.exit(0);
        } else {
          console.error(`  FAIL: HTTP response did not match goal specifications. Code: ${res.statusCode}`);
          process.exit(1);
        }
      } catch (e) {
        console.error('  FAIL: Failed to parse JSON response.', e);
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`  FAIL: Problem with request (is server running on port 3000?). Error: ${e.message}`);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}

// Run tests
const unitPass = runUnitTests();
if (!unitPass) {
  process.exit(1);
}

// Check if server is running or run only unit tests if not requested otherwise
if (process.argv.includes('--integration')) {
  runIntegrationTests();
} else {
  console.log('\nUnit tests completed successfully. Run with --integration flag to test against running server.');
  process.exit(0);
}
