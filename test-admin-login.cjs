const https = require('https');
const http = require('http');

// Test admin credentials that were working before
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';

console.log('🧪 Testing Admin Authentication');
console.log(`📧 Email: ${adminEmail}`);
console.log(`🔑 Password: ${adminPassword}`);

async function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const protocol = options.hostname === 'localhost' || options.hostname === '127.0.0.1' ? http : https;
        
        const req = protocol.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = responseData ? JSON.parse(responseData) : {};
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        data: parsed,
                        headers: res.headers
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        statusText: res.statusMessage,
                        data: responseData,
                        headers: res.headers
                    });
                }
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (data) {
            req.write(data);
        }
        
        req.end();
    });
}

async function testBackendConnection() {
    try {
        console.log('🔗 Testing backend connection...');
        
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/v1/auth/login',
            method: 'OPTIONS',
            headers: {
                'Origin': 'http://localhost:5174',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        };
        
        const response = await makeRequest(options);
        console.log(`OPTIONS http://127.0.0.1:8000/api/v1/auth/login`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Response: ${JSON.stringify(response.data)}`);
        
        if (response.status === 200) {
            console.log('✅ Backend is running and CORS is configured');
            return true;
        } else {
            console.log('❌ Backend connection failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Backend connection error:', error.message);
        return false;
    }
}

async function testAdminLogin() {
    try {
        console.log('🔐 Testing admin login...');
        
        const loginData = JSON.stringify({
            email: adminEmail,
            password: adminPassword
        });
        
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/v1/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData),
                'Origin': 'http://localhost:5174'
            }
        };
        
        const response = await makeRequest(options, loginData);
        console.log(`POST http://127.0.0.1:8000/api/v1/auth/login`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        
        if (response.status === 200 && response.data.access_token) {
            console.log('✅ Admin login successful!');
            console.log(`🎯 Access Token: ${response.data.access_token.substring(0, 20)}...`);
            return response.data;
        } else {
            console.log('❌ Admin login failed:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Admin login error:', error.message);
        return null;
    }
}

async function runTests() {
    const backendConnected = await testBackendConnection();
    
    if (backendConnected) {
        const loginResult = await testAdminLogin();
        
        if (loginResult) {
            console.log('🎉 All tests passed! Admin authentication is working.');
        } else {
            console.log('❌ Admin authentication failed. Check backend logs.');
        }
    } else {
        console.log('❌ Cannot proceed - backend not accessible');
    }
}

runTests();
