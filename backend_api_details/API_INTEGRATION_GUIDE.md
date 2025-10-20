# API Integration Guide - Best Practices & Examples

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Flow](#authentication-flow)
3. [Integration Examples](#integration-examples)
4. [Best Practices](#best-practices)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [SDKs & Libraries](#sdks--libraries)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Step 1: Obtain API Credentials

1. Register a user account at `/auth/register`
2. Verify email address
3. Login at `/auth/login` to get access token

### Step 2: Make Your First Request

```python
import requests

# 1. Login
login_response = requests.post(
    "https://api.yourdomain.com/auth/login",
    json={
        "email": "your-email@example.com",
        "password": "YourPassword123!"
    }
)

access_token = login_response.json()["access_token"]

# 2. Get your profile
profile_response = requests.get(
    "https://api.yourdomain.com/profile/me",
    headers={"Authorization": f"Bearer {access_token}"}
)

print(profile_response.json())
```

---

## Authentication Flow

### Complete Authentication Flow Diagram

```
User Application                   API Server
     |                                 |
     |---(1) POST /auth/login--------->|
     |    (email, password)             |
     |                                  |
     |<--(2) 200 OK---------------------|
     |    (access_token, refresh_token) |
     |                                  |
     |---(3) GET /profile/me----------->|
     |    (Authorization: Bearer token) |
     |                                  |
     |<--(4) 200 OK---------------------|
     |    (user profile)                |
     |                                  |
     |  ... token expires after 30 min  |
     |                                  |
     |---(5) POST /auth/refresh-------->|
     |    (refresh_token)               |
     |                                  |
     |<--(6) 200 OK---------------------|
     |    (new access_token)            |
```

### Python Complete Implementation

```python
import requests
import time
from datetime import datetime, timedelta

class UserAPIClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.access_token = None
        self.refresh_token = None
        self.token_expires_at = None
    
    def login(self, email, password):
        """Login and store tokens"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
            self.refresh_token = data["refresh_token"]
            
            # Calculate expiry time
            expires_in = data.get("expires_in", 1800)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
            
            return data["user"]
        else:
            raise Exception(f"Login failed: {response.json()}")
    
    def refresh_access_token(self):
        """Refresh access token using refresh token"""
        response = requests.post(
            f"{self.base_url}/auth/refresh",
            headers={"Authorization": f"Bearer {self.refresh_token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.access_token = data["access_token"]
            
            expires_in = data.get("expires_in", 1800)
            self.token_expires_at = datetime.now() + timedelta(seconds=expires_in)
        else:
            # Refresh failed, need to login again
            raise Exception("Token refresh failed - please login again")
    
    def get_headers(self):
        """Get headers with valid access token"""
        # Check if token is about to expire (within 5 minutes)
        if self.token_expires_at and datetime.now() >= self.token_expires_at - timedelta(minutes=5):
            self.refresh_access_token()
        
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
    
    def get_profile(self):
        """Get current user profile"""
        response = requests.get(
            f"{self.base_url}/profile/me",
            headers=self.get_headers()
        )
        return response.json()
    
    def update_profile(self, first_name=None, last_name=None):
        """Update user profile"""
        data = {}
        if first_name:
            data["first_name"] = first_name
        if last_name:
            data["last_name"] = last_name
        
        response = requests.put(
            f"{self.base_url}/profile/me",
            headers=self.get_headers(),
            json=data
        )
        return response.json()

# Usage
client = UserAPIClient("https://api.yourdomain.com")

# Login
user = client.login("user@example.com", "Password123!")
print(f"Logged in as: {user['email']}")

# Get profile
profile = client.get_profile()
print(f"Profile: {profile}")

# Update profile
updated = client.update_profile(first_name="John", last_name="Smith")
print(f"Updated: {updated}")
```

---

## Integration Examples

### Example 1: User Registration Flow

```python
import requests

class UserRegistration:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def register_user(self, email, password, first_name, last_name):
        """
        Register a new user
        
        Returns:
            dict: Registration response with user_id
        """
        try:
            response = requests.post(
                f"{self.base_url}/auth/register",
                json={
                    "email": email,
                    "password": password,
                    "first_name": first_name,
                    "last_name": last_name
                }
            )
            
            if response.status_code == 201:
                return {
                    "success": True,
                    "data": response.json()
                }
            elif response.status_code == 409:
                # User already exists
                return {
                    "success": False,
                    "error": "User with this email already exists"
                }
            elif response.status_code == 422:
                # Validation errors
                errors = response.json().get("errors", [])
                return {
                    "success": False,
                    "validation_errors": errors
                }
            else:
                return {
                    "success": False,
                    "error": response.json().get("message", "Registration failed")
                }
        
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Network error: {str(e)}"
            }
    
    def verify_email(self, token):
        """
        Verify email with token from email
        
        Args:
            token: Verification token from email
        """
        response = requests.post(
            f"{self.base_url}/auth/verify-email",
            json={"token": token}
        )
        
        if response.status_code == 200:
            return {"success": True, "message": "Email verified successfully"}
        else:
            error = response.json()
            return {"success": False, "error": error.get("message")}

# Usage
registration = UserRegistration("https://api.yourdomain.com")

result = registration.register_user(
    email="newuser@example.com",
    password="SecurePass123!",
    first_name="Jane",
    last_name="Doe"
)

if result["success"]:
    print(f"Registration successful! User ID: {result['data']['user_id']}")
    print("Please check your email for verification link")
else:
    print(f"Registration failed: {result['error']}")
    if "validation_errors" in result:
        for error in result["validation_errors"]:
            print(f"  - {error['field']}: {error['message']}")
```

### Example 2: Admin User Management

```python
import requests

class AdminAPI:
    def __init__(self, base_url, admin_token):
        self.base_url = base_url
        self.admin_token = admin_token
    
    def get_headers(self):
        return {
            "Authorization": f"Bearer {self.admin_token}",
            "Content-Type": "application/json"
        }
    
    def list_users(self, page=1, limit=20, role=None, is_active=None):
        """List all users with filtering"""
        params = {"page": page, "limit": limit}
        if role:
            params["role"] = role
        if is_active is not None:
            params["is_active"] = is_active
        
        response = requests.get(
            f"{self.base_url}/admin/users",
            headers=self.get_headers(),
            params=params
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to list users: {response.json()}")
    
    def create_user(self, email, password, first_name, last_name, role="user"):
        """Create a new user (admin-created users are pre-verified)"""
        response = requests.post(
            f"{self.base_url}/admin/users",
            headers=self.get_headers(),
            json={
                "email": email,
                "password": password,
                "first_name": first_name,
                "last_name": last_name,
                "role": role
            }
        )
        
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"Failed to create user: {response.json()}")
    
    def update_user(self, user_id, **updates):
        """Update user fields"""
        response = requests.put(
            f"{self.base_url}/admin/users/{user_id}",
            headers=self.get_headers(),
            json=updates
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to update user: {response.json()}")
    
    def delete_user(self, user_id):
        """Delete a user"""
        response = requests.delete(
            f"{self.base_url}/admin/users/{user_id}",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to delete user: {response.json()}")
    
    def approve_user(self, user_id):
        """Approve user account"""
        response = requests.post(
            f"{self.base_url}/admin/users/{user_id}/approve",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to approve user: {response.json()}")

# Usage
admin = AdminAPI("https://api.yourdomain.com", admin_access_token)

# List all active users
active_users = admin.list_users(is_active=True, limit=50)
print(f"Found {len(active_users)} active users")

# Create a new user
new_user = admin.create_user(
    email="employee@company.com",
    password="TempPass123!",
    first_name="Employee",
    last_name="One",
    role="user"
)
print(f"Created user: {new_user['user_id']}")

# Update user role
updated = admin.update_user(new_user['user_id'], role="admin")
print(f"Updated to admin role")

# Approve user
approval = admin.approve_user(new_user['user_id'])
print(f"User approved")
```

### Example 3: GDPR Data Export

```python
import requests
import json

def export_user_data(access_token, format="json"):
    """
    Export all user data for GDPR compliance
    
    Args:
        access_token: User's access token
        format: "json" or "csv"
    
    Returns:
        Saved file path
    """
    response = requests.post(
        "https://api.yourdomain.com/gdpr/export/my-data",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "format": format,
            "include_audit_logs": True,
            "include_metadata": True
        }
    )
    
    if response.status_code == 200:
        # Get filename from Content-Disposition header
        content_disposition = response.headers.get('Content-Disposition', '')
        filename = content_disposition.split('filename=')[1].strip('"')
        
        # Save file
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        export_id = response.headers.get('X-Export-ID')
        record_count = response.headers.get('X-Record-Count')
        
        print(f"Data exported successfully!")
        print(f"Export ID: {export_id}")
        print(f"Records: {record_count}")
        print(f"Saved to: {filename}")
        
        return filename
    else:
        raise Exception(f"Export failed: {response.json()}")

# Usage
filename = export_user_data(user_access_token, format="json")

# Parse exported data
with open(filename, 'r') as f:
    exported_data = json.load(f)

print(f"User: {exported_data['personal_data']['user_profile']['email']}")
print(f"Categories: {', '.join(exported_data['metadata']['categories'])}")
```

### Example 4: Audit Log Querying

```python
import requests
from datetime import datetime, timedelta

class AuditAPI:
    def __init__(self, base_url, auditor_token):
        self.base_url = base_url
        self.auditor_token = auditor_token
    
    def get_headers(self):
        return {"Authorization": f"Bearer {self.auditor_token}"}
    
    def query_logs(self, action=None, user_id=None, start_date=None, 
                   end_date=None, severity=None, page=1, limit=50):
        """
        Query audit logs with filters
        
        Args:
            action: Filter by action type (e.g., "USER_LOGIN")
            user_id: Filter by user ID
            start_date: Start date (ISO 8601 format)
            end_date: End date (ISO 8601 format)
            severity: Filter by severity (info/warning/error/critical)
            page: Page number
            limit: Results per page
        """
        params = {"page": page, "limit": limit}
        
        if action:
            params["action"] = action
        if user_id:
            params["user_id"] = user_id
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        if severity:
            params["severity"] = severity
        
        response = requests.get(
            f"{self.base_url}/audit/logs",
            headers=self.get_headers(),
            params=params
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Query failed: {response.json()}")
    
    def get_summary(self):
        """Get audit log summary statistics"""
        response = requests.get(
            f"{self.base_url}/audit/summary",
            headers=self.get_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Failed to get summary: {response.json()}")

# Usage
audit = AuditAPI("https://api.yourdomain.com", auditor_access_token)

# Query last 24 hours of login events
end_date = datetime.utcnow()
start_date = end_date - timedelta(days=1)

logs = audit.query_logs(
    action="USER_LOGIN",
    start_date=start_date.isoformat() + "Z",
    end_date=end_date.isoformat() + "Z",
    limit=100
)

print(f"Found {logs['total']} login events in last 24 hours")
for entry in logs['items']:
    print(f"{entry['timestamp']}: {entry['user_id']} from {entry['ip_address']}")

# Get summary statistics
summary = audit.get_summary()
print(f"\nAudit Summary:")
print(f"Total entries: {summary['total_entries']}")
print(f"By action: {summary['by_action']}")
print(f"By severity: {summary['by_severity']}")
```

---

## Best Practices

### 1. Token Management

✅ **DO:**

- Store tokens securely (encrypted storage, keychain, environment variables)
- Implement automatic token refresh before expiry
- Clear tokens on logout
- Use HTTPS for all API calls

❌ **DON'T:**

- Store tokens in localStorage (XSS vulnerability)
- Hard-code tokens in source code
- Share tokens between users
- Log tokens in console/files

### 2. Error Handling

✅ **DO:**

```python
def api_call_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                # Rate limited - wait and retry
                retry_after = int(response.headers.get('Retry-After', 60))
                time.sleep(retry_after)
                continue
            elif response.status_code >= 500:
                # Server error - retry
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                # Client error - don't retry
                raise Exception(f"API error: {response.json()}")
        
        except requests.exceptions.Timeout:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)
    
    raise Exception("Max retries exceeded")
```

### 3. Rate Limiting Compliance

```python
import time
from collections import deque

class RateLimiter:
    def __init__(self, max_calls, time_window):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = deque()
    
    def wait_if_needed(self):
        now = time.time()
        
        # Remove calls outside time window
        while self.calls and self.calls[0] < now - self.time_window:
            self.calls.popleft()
        
        # Wait if limit reached
        if len(self.calls) >= self.max_calls:
            sleep_time = self.calls[0] + self.time_window - now
            if sleep_time > 0:
                time.sleep(sleep_time)
                self.calls.popleft()
        
        self.calls.append(now)

# Usage
limiter = RateLimiter(max_calls=10, time_window=60)  # 10 calls per minute

for i in range(20):
    limiter.wait_if_needed()
    # Make API call
    response = requests.get("https://api.yourdomain.com/profile/me", headers=headers)
```

### 4. Request Validation

```python
def validate_email(email):
    """Validate email format before API call"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password meets requirements"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

# Usage
email = "user@example.com"
password = "WeakPass"

if not validate_email(email):
    print("Invalid email format")
else:
    valid, message = validate_password(password)
    if not valid:
        print(f"Invalid password: {message}")
    else:
        # Proceed with registration
        register_user(email, password)
```

### 5. Logging and Monitoring

```python
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def api_call_with_logging(url, method="GET", **kwargs):
    """Make API call with comprehensive logging"""
    request_id = kwargs.get('headers', {}).get('X-Request-ID', 'N/A')
    
    logger.info(f"API Request: {method} {url} (Request ID: {request_id})")
    
    try:
        response = requests.request(method, url, **kwargs)
        
        logger.info(
            f"API Response: {response.status_code} "
            f"(Request ID: {request_id}, Duration: {response.elapsed.total_seconds()}s)"
        )
        
        return response
    
    except requests.exceptions.RequestException as e:
        logger.error(f"API Error: {str(e)} (Request ID: {request_id})")
        raise
```

---

## Troubleshooting

### Common Issues

#### Issue 1: 401 Unauthorized

**Symptom:** Getting 401 errors on authenticated endpoints

**Solutions:**

1. Check token is included: `Authorization: Bearer <token>`
2. Verify token hasn't expired (30-minute lifetime)
3. Try refreshing token with `/auth/refresh`
4. If refresh fails, login again

#### Issue 2: 422 Validation Error

**Symptom:** Getting validation errors on registration/update

**Solutions:**

1. Check error response for field-specific errors
2. Verify password meets requirements (8+ chars, uppercase, lowercase, digit)
3. Ensure email format is valid
4. Check field lengths (names: 1-100 chars)

#### Issue 3: 429 Rate Limit Exceeded

**Symptom:** Too many requests error

**Solutions:**

1. Check `Retry-After` header for wait time
2. Implement exponential backoff
3. Cache frequently accessed data
4. Review rate limits for endpoint

#### Issue 4: 500 Internal Server Error

**Symptom:** Server error responses

**Solutions:**

1. Check `request_id` in error response
2. Retry with exponential backoff
3. Contact support with request_id if persistent

---

## Testing

### Unit Testing Example

```python
import unittest
from unittest.mock import Mock, patch
import requests

class TestUserAPI(unittest.TestCase):
    def setUp(self):
        self.base_url = "https://api.yourdomain.com"
        self.client = UserAPIClient(self.base_url)
    
    @patch('requests.post')
    def test_login_success(self, mock_post):
        # Mock successful login response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "access_token": "test_token",
            "refresh_token": "refresh_token",
            "expires_in": 1800,
            "user": {
                "user_id": "usr_123",
                "email": "test@example.com"
            }
        }
        mock_post.return_value = mock_response
        
        # Test login
        user = self.client.login("test@example.com", "password")
        
        self.assertEqual(user["user_id"], "usr_123")
        self.assertEqual(self.client.access_token, "test_token")
    
    @patch('requests.post')
    def test_login_invalid_credentials(self, mock_post):
        # Mock failed login
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.json.return_value = {
            "error_code": "INVALID_CREDENTIALS",
            "message": "Invalid email or password"
        }
        mock_post.return_value = mock_response
        
        # Test login failure
        with self.assertRaises(Exception) as context:
            self.client.login("test@example.com", "wrong_password")
        
        self.assertIn("Login failed", str(context.exception))

if __name__ == '__main__':
    unittest.main()
```

---

## SDKs & Libraries

### Recommended Libraries

**Python:**

- `requests` - HTTP client
- `python-jose` - JWT handling
- `python-dotenv` - Environment variable management

**JavaScript/TypeScript:**

- `axios` - HTTP client
- `jsonwebtoken` - JWT handling
- `dotenv` - Environment variables

**Java:**

- `OkHttp` - HTTP client
- `JWT` - JWT library
- `Gson` - JSON parsing

---

**API Documentation Complete!**

For support, contact: support@yourdomain.com  
API Status: https://status.yourdomain.com
