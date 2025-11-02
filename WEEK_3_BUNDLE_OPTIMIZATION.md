# Week 3: Bundle Optimization & CI/CD Setup

**Phase:** Performance Optimization & DevOps Integration  
**Duration:** Week 3  
**Focus:** Bundle analysis, optimization, and automated deployment pipeline

---

## 📊 Current Performance Baseline (Week 2 Results)

### Bundle Size Analysis (user_mn_ui)
```json
{
  "css": {
    "size": "215KB (210.72KB)",
    "budget": "51.2KB (50KB)",
    "status": "⚠️ OVER BUDGET by 164KB",
    "count": 2
  },
  "js": {
    "size": "1.46MB (1.39MB)",
    "budget": "307KB (300KB)",
    "status": "⚠️ OVER BUDGET by 1.15MB",
    "count": 20
  },
  "total": {
    "size": "2.09MB (1.99MB)",
    "budget": "819KB (800KB)",
    "status": "⚠️ OVER BUDGET by 1.27MB"
  }
}
```

### Performance Score: **8/100** ❌
- **Critical Issues:**
  - CSS oversized by 321%
  - JS oversized by 376%
  - Total bundle 255% over budget

---

## 🎯 Week 3 Objectives

### Task 8: Deep Performance Analysis
- [ ] Generate bundle visualization (treemap)
- [ ] Identify largest dependencies
- [ ] Analyze lazy loading opportunities
- [ ] Review component splitting strategy
- [ ] Measure load time impact

### Task 9: Bundle Optimization Implementation
- [ ] Code splitting optimization
- [ ] Dynamic imports for routes
- [ ] Tree shaking verification
- [ ] Dependency size reduction
- [ ] Asset optimization (images, fonts)
- [ ] CSS optimization and purging

### Task 10: CI/CD Pipeline Setup
- [ ] Configure GitLab CI/CD pipeline
- [ ] Set up quality gates (lint, test, coverage)
- [ ] Implement security scanning
- [ ] Configure automated deployment
- [ ] Set up performance monitoring

---

## 📈 Task 8: Deep Performance Analysis

### Step 1: Generate Bundle Visualization

```bash
# Build with analysis
npm run build
npm run analyze-bundle

# This generates: dist/bundle-analysis.html
# Open in browser to see interactive treemap
```

### Step 2: Analyze Dependencies

```bash
# Install bundle analyzer if not present
npm install -D vite-bundle-analyzer rollup-plugin-visualizer

# Check package sizes
npx vite-bundle-visualizer
```

### Step 3: Identify Optimization Targets

**Key Areas to Investigate:**
1. **Large Dependencies** (>50KB)
   - React ecosystem packages
   - UI libraries (lucide-react, recharts)
   - Date utilities (date-fns)
   - Form libraries (@tanstack/react-query)

2. **Duplicate Code**
   - Multiple versions of same package
   - Shared utilities not extracted

3. **Unused Code**
   - Dead code elimination
   - Unused exports
   - Unused CSS

4. **Asset Optimization**
   - Image compression
   - Font subsetting
   - SVG optimization

### Step 4: Performance Metrics Collection

```bash
# Run Lighthouse audit
npm run test:performance

# Generate detailed report
npx lighthouse http://localhost:3000 --output html --output-path ./reports/lighthouse-full.html
```

---

## ⚡ Task 9: Bundle Optimization Implementation

### 9.1 Code Splitting Strategy

#### Route-Based Splitting (PRIORITY 1)

```typescript
// src/App.tsx - Implement lazy loading
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Suspense>
  );
}
```

#### Component-Level Splitting (PRIORITY 2)

```typescript
// Heavy components loaded on-demand
const HeavyChart = lazy(() => import('./components/charts/HeavyChart'));
const DataTable = lazy(() => import('./components/tables/DataTable'));
const RichTextEditor = lazy(() => import('./components/editors/RichTextEditor'));

// Use with Suspense
<Suspense fallback={<Skeleton />}>
  <HeavyChart data={chartData} />
</Suspense>
```

### 9.2 Dependency Optimization

#### Replace Heavy Dependencies

```bash
# Current heavy packages to optimize:

# 1. date-fns (200KB) → Use native Intl API or date-fns-tz only
npm uninstall date-fns
# OR use modular imports
import { format } from 'date-fns/format';

# 2. recharts (400KB) → Consider lightweight alternatives
# Option: react-minimal-pie-chart, victory-native (if needed)

# 3. lucide-react → Use tree-shakeable imports
# Change: import { Icon } from 'lucide-react'
# To: import Icon from 'lucide-react/icons/Icon'
```

#### Optimize Package Imports

```typescript
// ❌ BAD: Imports entire library
import { format, parse, addDays } from 'date-fns';
import * as Icons from 'lucide-react';

// ✅ GOOD: Modular imports
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import addDays from 'date-fns/addDays';

import { Calendar, User, Settings } from 'lucide-react';
```

### 9.3 Tree Shaking Configuration

Update `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // CSS code splitting
    cssCodeSplit: true,
    // Source maps for production debugging
    sourcemap: false, // Disable in production for smaller bundles
  },
});
```

### 9.4 CSS Optimization

#### Tailwind CSS Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // Purge unused styles
  purge: {
    enabled: true,
    content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  },
};
```

#### PostCSS Configuration

```javascript
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Minify CSS
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
```

### 9.5 Image Optimization

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 3 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.65, 0.8] },
      svgo: {
        plugins: [
          { removeViewBox: false },
          { cleanupIDs: false },
        ],
      },
      webp: { quality: 75 },
    }),
  ],
});
```

### 9.6 Performance Budget

Create `lighthouse-budget.json`:

```json
{
  "budget": [
    {
      "resourceType": "script",
      "budget": 300
    },
    {
      "resourceType": "stylesheet",
      "budget": 50
    },
    {
      "resourceType": "image",
      "budget": 200
    },
    {
      "resourceType": "font",
      "budget": 100
    },
    {
      "resourceType": "total",
      "budget": 800
    }
  ]
}
```

---

## 🚀 Task 10: CI/CD Pipeline Setup

### 10.1 GitLab CI/CD Configuration

The pipeline is already configured in `.gitlab-ci.yml`. Let's enhance it:

#### Pipeline Structure

```
Stages:
1. ✅ validate    - Code quality checks
2. ✅ build       - Build application
3. ✅ test        - Run tests (unit, integration, e2e)
4. ✅ security    - Security scans
5. ✅ quality     - Code quality & accessibility
6. ✅ package     - Docker image creation
7. 🔒 deploy-infra - Infrastructure (manual)
8. 🔒 deploy-app  - Application deployment (manual)
9. ✅ post-deploy - Health checks
10. ✅ cleanup    - Resource cleanup
```

### 10.2 Quality Gates Configuration

#### Coverage Gate (80% minimum)

```yaml
unit-tests:
  script:
    - npm run test:coverage
    - |
      COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
      if (( $(echo "$COVERAGE < 80" | bc -l) )); then
        echo "Coverage $COVERAGE% is below 80%"
        exit 1
      fi
```

#### Bundle Size Gate

```yaml
bundle-size-check:
  stage: quality
  script:
    - npm run build
    - node scripts/check-bundle-size.mjs
    - |
      BUNDLE_SIZE=$(du -sb dist | awk '{print $1}')
      MAX_SIZE=819200 # 800KB
      if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
        echo "Bundle size $BUNDLE_SIZE exceeds $MAX_SIZE"
        exit 1
      fi
```

### 10.3 Makefile for CI/CD

Create `Makefile`:

```makefile
# Week 3: Bundle Optimization & CI/CD Makefile

.PHONY: install-dependencies build-production analyze-bundle test-unit test-coverage

# Installation
install-dependencies:
	npm ci --prefer-offline --no-audit

# Build
build-production:
	NODE_ENV=production npm run build:prod

build-dev:
	npm run build:dev

# Analysis
analyze-bundle:
	npm run analyze-bundle
	npm run check:bundle-size

bundle-report:
	@echo "Generating bundle size report..."
	@du -h dist/**/*.js | sort -h
	@du -h dist/**/*.css | sort -h

# Testing
test-unit:
	npm run test:run

test-coverage:
	npm run test:coverage
	npm run coverage:check

test-integration:
	npm run test:integration

test-e2e:
	npm run test:e2e

test-performance:
	npm run test:performance

# Linting
lint-check:
	npm run lint

type-check:
	npm run type-check

format-check:
	npm run format:check

# Security
security-audit:
	npm audit --audit-level=moderate
	npm run security:audit

vulnerability-scan:
	npx snyk test

# Docker
docker-build-production:
	docker build --target production -t usermn:prod .

docker-scan-security:
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image usermn:prod

docker-push:
	docker tag usermn:prod ${ECR_REGISTRY}/usermn:${IMAGE_TAG}
	docker push ${ECR_REGISTRY}/usermn:${IMAGE_TAG}

# Quality
sonar-analysis:
	sonar-scanner \
		-Dsonar.projectKey=usermn \
		-Dsonar.sources=./src \
		-Dsonar.host.url=${SONAR_HOST_URL} \
		-Dsonar.login=${SONAR_TOKEN}

lighthouse-audit:
	lhci autorun --config=lighthouse-budget.json

# Deployment
deploy-ecs-staging:
	aws ecs update-service \
		--cluster ${ECS_CLUSTER_STAGING} \
		--service ${ECS_SERVICE_STAGING} \
		--force-new-deployment

deploy-ecs-production:
	aws ecs update-service \
		--cluster ${ECS_CLUSTER_PROD} \
		--service ${ECS_SERVICE_PROD} \
		--force-new-deployment

# Terraform
terraform-validate:
	cd terraform && terraform validate

terraform-plan:
	cd terraform && terraform plan -out=plan.out

terraform-apply-staging:
	cd terraform && terraform apply -var-file=staging.tfvars plan.out

terraform-apply-production:
	cd terraform && terraform apply -var-file=production.tfvars plan.out

# Cleanup
clean:
	rm -rf dist coverage reports node_modules/.cache

# All checks (local development)
pre-commit: lint-check type-check format-check test-unit

pre-push: test-coverage security-audit
```

### 10.4 Bundle Size Check Script

Create `scripts/check-bundle-size.mjs`:

```javascript
#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Budget limits (in bytes)
const BUDGET = {
  js: 307200,      // 300KB
  css: 51200,      // 50KB
  total: 819200,   // 800KB
  image: 204800,   // 200KB
  font: 102400,    // 100KB
};

function getDirectorySize(dir, extensions) {
  let totalSize = 0;
  const files = fs.readdirSync(dir, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      if (extensions.includes(ext)) {
        totalSize += stats.size;
      }
    }
  }
  
  return totalSize;
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function checkBudget() {
  console.log('\n📊 Bundle Size Analysis\n');
  
  const sizes = {
    js: getDirectorySize(distDir, ['.js']),
    css: getDirectorySize(distDir, ['.css']),
    image: getDirectorySize(distDir, ['.png', '.jpg', '.jpeg', '.svg', '.webp']),
    font: getDirectorySize(distDir, ['.woff', '.woff2', '.ttf', '.eot']),
  };
  
  sizes.total = sizes.js + sizes.css + sizes.image + sizes.font;
  
  let failed = false;
  
  // Check each category
  Object.entries(sizes).forEach(([type, size]) => {
    const budget = BUDGET[type];
    const percentage = ((size / budget) * 100).toFixed(1);
    const status = size <= budget ? '✅' : '❌';
    const overBy = size > budget ? ` (over by ${formatBytes(size - budget)})` : '';
    
    console.log(`${status} ${type.toUpperCase()}: ${formatBytes(size)} / ${formatBytes(budget)} (${percentage}%)${overBy}`);
    
    if (size > budget) {
      failed = true;
    }
  });
  
  console.log('\n');
  
  if (failed) {
    console.error('❌ Bundle size exceeds budget!');
    process.exit(1);
  } else {
    console.log('✅ All bundle sizes within budget!');
    process.exit(0);
  }
}

// Run check
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Run build first.');
  process.exit(1);
}

checkBudget();
```

Make it executable:

```bash
chmod +x scripts/check-bundle-size.mjs
```

---

## 📋 Optimization Checklist

### Immediate Actions (High Priority)
- [ ] Enable route-based code splitting
- [ ] Implement lazy loading for heavy components
- [ ] Configure manual chunks in Vite
- [ ] Remove unused dependencies
- [ ] Optimize Tailwind CSS purging
- [ ] Add bundle size checks to CI

### Short-term Actions (Medium Priority)
- [ ] Replace heavy dependencies with lighter alternatives
- [ ] Implement image optimization
- [ ] Add font subsetting
- [ ] Configure CSS code splitting
- [ ] Set up performance monitoring

### Long-term Actions (Low Priority)
- [ ] Implement service worker caching
- [ ] Add resource hints (preload, prefetch)
- [ ] Optimize third-party scripts
- [ ] Implement progressive image loading
- [ ] Add CDN integration

---

## 🎯 Success Criteria

### Bundle Size Targets
- JS: < 300KB (currently 1.39MB) ⚠️
- CSS: < 50KB (currently 210KB) ⚠️
- Total: < 800KB (currently 1.99MB) ⚠️

### Performance Targets
- Lighthouse Score: > 90 (currently 8) ⚠️
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Total Blocking Time: < 300ms
- Cumulative Layout Shift: < 0.1

### CI/CD Targets
- ✅ Automated testing (unit, integration, e2e)
- ✅ Code coverage > 80%
- ✅ Security scanning (SAST, dependency scan)
- ✅ Performance budgets enforced
- ✅ Automated deployment to staging/production

---

## 🔄 Week 3 Implementation Timeline

### Day 1-2: Analysis & Planning
- Generate bundle analysis reports
- Identify optimization opportunities
- Create optimization strategy

### Day 3-4: Implementation
- Implement code splitting
- Optimize dependencies
- Configure build optimizations

### Day 5-6: CI/CD Setup
- Configure GitLab pipeline
- Set up quality gates
- Test deployment process

### Day 7: Testing & Validation
- Run performance tests
- Validate bundle sizes
- Document improvements

---

## 📚 Resources

### Tools
- [Vite Bundle Visualizer](https://www.npmjs.com/package/vite-bundle-analyzer)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Bundle Phobia](https://bundlephobia.com/)
- [Webpack Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Documentation
- [Vite Build Optimizations](https://vitejs.dev/guide/build.html)
- [React Code Splitting](https://react.dev/reference/react/lazy)
- [GitLab CI/CD](https://docs.gitlab.com/ee/ci/)
- [AWS ECS Deployment](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/)

---

**Next Steps:** Start with Task 8 - Generate bundle analysis and identify optimization targets.
