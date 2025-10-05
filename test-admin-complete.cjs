const http = require('http');

async function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
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

async function registerAdmin() {
    try {
        console.log('📝 Attempting to register admin user...');
        
        const userData = JSON.stringify({
            email: 'admin@example.com',
            password: 'admin123',
            first_name: 'Admin',
            last_name: 'User',
            is_superuser: true
        });
        
        const options = {
            hostname: '127.0.0.1',
            port: 8000,
            path: '/api/v1/auth/register',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(userData),
                'Origin': 'http://localhost:5174'
            }
        };
        
        const response = await makeRequest(options, userData);
        console.log(`POST http://127.0.0.1:8000/api/v1/auth/register`);
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        
        if (response.status === 200) {
            console.log('✅ Admin user registered successfully');
            return true;
        } else if (response.status === 409 || (response.data && response.data.detail && response.data.detail.includes('already exists'))) {
            console.log('ℹ️ Admin user already exists');
            return true;
        } else {
            console.log('❌ Admin registration failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Admin registration error:', error.message);
        return false;
    }
}

async function testAdminLogin() {
    try {
        console.log('🔐 Testing admin login...');
        
        const loginData = JSON.stringify({
            email: 'admin@example.com',
            password: 'admin123'
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
            return true;
        } else {
            console.log('❌ Admin login failed');
            return false;
        }
    } catch (error) {
        console.error('❌ Admin login error:', error.message);
        return false;
    }
}

async function runTest() {
    console.log('🧪 Admin User Registration & Login Test');
    console.log('=====================================');
    
    // First try to register admin (in case it doesn't exist)
    const registered = await registerAdmin();
    
    if (registered) {
        console.log('\\n⏳ Waiting 2 seconds for user to be fully created...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Then try to login
        const loginSuccess = await testAdminLogin();
        
        if (loginSuccess) {
            console.log('\\n🎉 Admin authentication is working!');
        } else {
            console.log('\\n❌ Admin authentication failed even after registration.');
            console.log('   This suggests an issue with the authentication logic.');
        }
    } else {
        console.log('\\n❌ Could not register admin user. Check backend logs.');
    }
}

runTest();
