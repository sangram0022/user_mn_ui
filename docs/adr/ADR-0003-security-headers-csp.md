# ADR-0003: Implement Content Security Policy and Security Headers

## Status
**Accepted** - October 2025

## Context

Web applications face numerous security threats including XSS (Cross-Site Scripting), clickjacking, MIME-type sniffing attacks, and information leakage. Without proper security headers, the application is vulnerable to these common attack vectors.

We needed a comprehensive security strategy that:

1. Protects against XSS attacks
2. Prevents clickjacking
3. Enforces HTTPS usage
4. Controls browser features and permissions
5. Limits information exposure
6. Maintains compatibility with modern development tools (HMR, dev tools)

## Decision

We will implement a **comprehensive security headers strategy** with:

### 1. Content Security Policy (CSP)
- **Nonce-based CSP** for inline scripts
- Environment-specific policies (strict for production, relaxed for development)
- Report-only mode for testing

### 2. Security Headers
- **HSTS** (HTTP Strict Transport Security)
- **X-Frame-Options**
- **X-Content-Type-Options**
- **Referrer-Policy**
- **Permissions-Policy**
- **Cross-Origin Policies**

### Implementation Structure

```typescript
src/infrastructure/security/
├── csp.ts                  # CSP configuration and generation
├── headers.ts              # Security headers management
├── SecurityProvider.tsx    # React context for security
└── index.ts               # Public exports
```

### Key Features

1. **Nonce Generation**: Cryptographically secure nonces for each request
2. **Environment Detection**: Different policies for dev/prod
3. **Easy Configuration**: Centralized, type-safe configuration
4. **React Integration**: Context provider for accessing security settings
5. **Testing Support**: Validation utilities for security headers

## Consequences

### Positive

- ✅ **XSS Protection**: Nonce-based CSP significantly reduces XSS attack surface
- ✅ **Clickjacking Prevention**: X-Frame-Options and frame-ancestors prevent clickjacking
- ✅ **HTTPS Enforcement**: HSTS forces HTTPS connections
- ✅ **Feature Control**: Permissions-Policy disables unnecessary browser features
- ✅ **Information Protection**: Referrer-Policy controls referrer information leakage
- ✅ **Developer Experience**: Dev-friendly policies don't break HMR
- ✅ **Type Safety**: Full TypeScript support with interfaces
- ✅ **Testability**: Easy to test and validate security configuration

### Negative

- ❌ **Complexity**: Adds configuration complexity to the project
- ❌ **Browser Compatibility**: Some older browsers don't support all headers
- ❌ **Debugging Difficulty**: CSP violations can be hard to debug initially
- ❌ **Third-party Integration**: May break some third-party scripts
- ❌ **Performance**: Minimal overhead for nonce generation

### Neutral

- ⚪ **Maintenance**: Requires periodic review and updates
- ⚪ **Documentation**: Needs clear documentation for team

## Security Headers Implemented

### Content-Security-Policy
```typescript
{
  'default-src': ["'self'"],
  'script-src': ["'self'", "'nonce-{random}'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://api.yourservice.com"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"]
}
```

### Strict-Transport-Security
```
max-age=31536000; includeSubDomains; preload
```

### X-Frame-Options
```
DENY
```

### X-Content-Type-Options
```
nosniff
```

### Referrer-Policy
```
strict-origin-when-cross-origin
```

### Permissions-Policy
```
geolocation=(), microphone=(), camera=(), payment=(), usb=()
```

### Cross-Origin Policies
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
```

## Usage Examples

### In React Application
```typescript
import { SecurityProvider, useNonce } from '@infrastructure/security'

function App() {
  return (
    <SecurityProvider>
      <YourApp />
    </SecurityProvider>
  )
}

function InlineScriptComponent() {
  const nonce = useNonce()
  
  return (
    <script nonce={nonce}>
      // Your inline script
    </script>
  )
}
```

### Server-Side (if applicable)
```typescript
import { getSecurityHeaders, getCSPHeader, generateNonce } from '@infrastructure/security'

const nonce = generateNonce()
const securityHeaders = getSecurityHeaders()
const cspHeader = getCSPHeader(nonce)

response.setHeader('Content-Security-Policy', cspHeader)
Object.entries(securityHeaders).forEach(([key, value]) => {
  response.setHeader(key, value)
})
```

## Alternatives Considered

### 1. No Security Headers
**Why not chosen**: Leaves application vulnerable to common attacks. Not acceptable for production.

### 2. Basic CSP Without Nonces
**Why not chosen**: Would require 'unsafe-inline', significantly reducing CSP effectiveness.

### 3. Static CSP Only
**Why not chosen**: Less flexible, harder to manage across environments.

### 4. Third-Party Security Service
**Why not chosen**: Adds dependency and cost. Can implement effectively in-house.

## Migration Plan

1. ✅ **Phase 1**: Implement infrastructure (CSP, headers modules)
2. ✅ **Phase 2**: Add SecurityProvider to React app
3. ⏳ **Phase 3**: Test in report-only mode
4. ⏳ **Phase 4**: Enable in production
5. ⏳ **Phase 5**: Monitor CSP violations and refine

## Monitoring and Testing

### CSP Violation Reporting
```typescript
// Configure report endpoint
const cspWithReporting = getCSPReportOnlyHeader(
  nonce,
  'https://your-report-endpoint.com/csp-violations'
)
```

### Validation in Tests
```typescript
import { validateSecurityHeaders } from '@infrastructure/security'

test('should have all required security headers', () => {
  const validation = validateSecurityHeaders(response.headers)
  expect(validation.isValid).toBe(true)
  expect(validation.missing).toHaveLength(0)
})
```

## References

- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)
- [HSTS Preload List](https://hstspreload.org/)

## Review Schedule

This ADR should be reviewed:
- ❑ Every 6 months for updates to best practices
- ❑ When new security vulnerabilities are discovered
- ❑ When browser support changes significantly
- ❑ When adding new third-party integrations

---

**Last Updated**: October 11, 2025
**Next Review**: April 2026
