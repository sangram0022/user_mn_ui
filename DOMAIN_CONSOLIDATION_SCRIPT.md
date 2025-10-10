# 🔄 Domain Consolidation & Migration Script

**Date**: October 10, 2025  
**Purpose**: Consolidate existing domains into DDD structure

---

## 📋 Domain Consolidation Plan

### Current Domains Found

```
src/domains/
├── account/              → Merge into user-management/
├── activity/             → Merge into system-administration/
├── analytics/            → Merge into analytics-dashboard/
├── analytics-dashboard/  ✅ Keep (target)
├── auth/                 → Merge into authentication/
├── authentication/       ✅ Keep (target)
├── dashboard/            → Merge into analytics-dashboard/
├── home/                 → Move to app/pages/
├── moderation/           → Merge into system-administration/
├── profile/              → Merge into user-management/
├── reports/              → Merge into analytics-dashboard/
├── security/             → Merge into system-administration/
├── session/              → Merge into authentication/
├── settings/             → Merge into system-administration/
├── status/               → Merge into system-administration/
├── support/              → Merge into system-administration/
├── system-administration/ ✅ Keep (target)
├── user-management/      ✅ Keep (target)
├── users/                → Merge into user-management/
├── workflow-engine/      ✅ Keep (target)
└── workflows/            → Merge into workflow-engine/
```

---

## 🎯 Target Domain Structure

### 1. Authentication Domain
**Consolidate**: `auth/` + `session/` → `authentication/`

```bash
# Move auth/ content to authentication/
# Auth has more content, so merge into authentication
cp -r src/domains/auth/* src/domains/authentication/
# Then remove auth/
rm -rf src/domains/auth/
rm -rf src/domains/session/
```

**Result**:
```
authentication/
├── components/      (LoginForm, RegisterForm, AuthGuard)
├── hooks/          (useLogin, useRegister, useAuthState)
├── services/       (AuthService, TokenService)
├── types/          (auth.types.ts)
├── pages/          (LoginPage, RegisterPage)
├── context/        (AuthContext)
├── providers/      (AuthProvider)
└── index.ts
```

---

### 2. User Management Domain
**Consolidate**: `users/` + `account/` + `profile/` → `user-management/`

```bash
# Copy users content
cp -r src/domains/users/* src/domains/user-management/ 2>/dev/null
cp -r src/domains/account/* src/domains/user-management/ 2>/dev/null
cp -r src/domains/profile/* src/domains/user-management/ 2>/dev/null

# Remove old folders
rm -rf src/domains/users/
rm -rf src/domains/account/
rm -rf src/domains/profile/
```

**Result**:
```
user-management/
├── components/      (UserList, UserForm, UserProfile)
├── hooks/          (useUsers, useUserCRUD)
├── services/       (UserService)
├── types/          (user.types.ts)
├── pages/          (UserManagementPage, ProfilePage)
└── index.ts
```

---

### 3. Workflow Engine Domain
**Consolidate**: `workflows/` → `workflow-engine/`

```bash
# Copy workflows content
cp -r src/domains/workflows/* src/domains/workflow-engine/ 2>/dev/null

# Remove old folder
rm -rf src/domains/workflows/
```

**Result**:
```
workflow-engine/
├── components/      (WorkflowBuilder, TaskList, ApprovalQueue)
├── hooks/          (useWorkflows, useTasks)
├── services/       (WorkflowService, TaskService)
├── types/          (workflow.types.ts)
├── pages/          (WorkflowManagementPage, ApprovalsPage)
└── index.ts
```

---

### 4. Analytics Dashboard Domain
**Consolidate**: `analytics/` + `dashboard/` + `reports/` → `analytics-dashboard/`

```bash
# Copy content
cp -r src/domains/analytics/* src/domains/analytics-dashboard/ 2>/dev/null
cp -r src/domains/dashboard/* src/domains/analytics-dashboard/ 2>/dev/null
cp -r src/domains/reports/* src/domains/analytics-dashboard/ 2>/dev/null

# Remove old folders
rm -rf src/domains/analytics/
rm -rf src/domains/dashboard/
rm -rf src/domains/reports/
```

**Result**:
```
analytics-dashboard/
├── components/      (Dashboard, Chart, MetricCard)
├── hooks/          (useAnalytics, useMetrics)
├── services/       (AnalyticsService)
├── types/          (analytics.types.ts)
├── pages/          (DashboardPage, ReportsPage)
└── index.ts
```

---

### 5. System Administration Domain
**Consolidate**: `settings/` + `security/` + `moderation/` + `status/` + `activity/` + `support/` → `system-administration/`

```bash
# Copy content
cp -r src/domains/settings/* src/domains/system-administration/ 2>/dev/null
cp -r src/domains/security/* src/domains/system-administration/ 2>/dev/null
cp -r src/domains/moderation/* src/domains/system-administration/ 2>/dev/null
cp -r src/domains/status/* src/domains/system-administration/ 2>/dev/null
cp -r src/domains/activity/* src/domains/system-administration/ 2>/dev/null
cp -r src/domains/support/* src/domains/system-administration/ 2>/dev/null

# Remove old folders
rm -rf src/domains/settings/
rm -rf src/domains/security/
rm -rf src/domains/moderation/
rm -rf src/domains/status/
rm -rf src/domains/activity/
rm -rf src/domains/support/
```

**Result**:
```
system-administration/
├── components/      (SystemConfig, HealthMonitor, AuditLog)
├── hooks/          (useSystemConfig, useHealth)
├── services/       (AdminService)
├── types/          (admin.types.ts)
├── pages/          (SettingsPage, SecurityPage, ModerationPage)
└── index.ts
```

---

## 🚀 Execution Steps (PowerShell)

### Step 1: Backup Current State
```powershell
# Create backup
git add .
git commit -m "backup: Before DDD domain consolidation"
git tag ddd-pre-consolidation
```

### Step 2: Consolidate Authentication Domain
```powershell
# Merge auth into authentication (auth has more content)
$authFiles = Get-ChildItem -Path "src\domains\auth" -Recurse -File
foreach ($file in $authFiles) {
    $relativePath = $file.FullName.Replace("$PWD\src\domains\auth\", "")
    $targetPath = "src\domains\authentication\$relativePath"
    $targetDir = Split-Path $targetPath -Parent
    
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force
    }
    
    Copy-Item $file.FullName -Destination $targetPath -Force
}

# Remove old folders
Remove-Item -Path "src\domains\auth" -Recurse -Force
Remove-Item -Path "src\domains\session" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: Consolidate User Management
```powershell
$sourceDomains = @("users", "account", "profile")
foreach ($domain in $sourceDomains) {
    $sourcePath = "src\domains\$domain"
    if (Test-Path $sourcePath) {
        $files = Get-ChildItem -Path $sourcePath -Recurse -File
        foreach ($file in $files) {
            $relativePath = $file.FullName.Replace("$PWD\src\domains\$domain\", "")
            $targetPath = "src\domains\user-management\$relativePath"
            $targetDir = Split-Path $targetPath -Parent
            
            if (!(Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force
            }
            
            if (!(Test-Path $targetPath)) {
                Copy-Item $file.FullName -Destination $targetPath -Force
            }
        }
        Remove-Item -Path $sourcePath -Recurse -Force
    }
}
```

### Step 4: Consolidate Workflow Engine
```powershell
$sourcePath = "src\domains\workflows"
if (Test-Path $sourcePath) {
    $files = Get-ChildItem -Path $sourcePath -Recurse -File
    foreach ($file in $files) {
        $relativePath = $file.FullName.Replace("$PWD\src\domains\workflows\", "")
        $targetPath = "src\domains\workflow-engine\$relativePath"
        $targetDir = Split-Path $targetPath -Parent
        
        if (!(Test-Path $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force
        }
        
        if (!(Test-Path $targetPath)) {
            Copy-Item $file.FullName -Destination $targetPath -Force
        }
    }
    Remove-Item -Path $sourcePath -Recurse -Force
}
```

### Step 5: Consolidate Analytics Dashboard
```powershell
$sourceDomains = @("analytics", "dashboard", "reports")
foreach ($domain in $sourceDomains) {
    $sourcePath = "src\domains\$domain"
    if (Test-Path $sourcePath) {
        $files = Get-ChildItem -Path $sourcePath -Recurse -File
        foreach ($file in $files) {
            $relativePath = $file.FullName.Replace("$PWD\src\domains\$domain\", "")
            $targetPath = "src\domains\analytics-dashboard\$relativePath"
            $targetDir = Split-Path $targetPath -Parent
            
            if (!(Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force
            }
            
            if (!(Test-Path $targetPath)) {
                Copy-Item $file.FullName -Destination $targetPath -Force
            }
        }
        Remove-Item -Path $sourcePath -Recurse -Force
    }
}
```

### Step 6: Consolidate System Administration
```powershell
$sourceDomains = @("settings", "security", "moderation", "status", "activity", "support")
foreach ($domain in $sourceDomains) {
    $sourcePath = "src\domains\$domain"
    if (Test-Path $sourcePath) {
        $files = Get-ChildItem -Path $sourcePath -Recurse -File
        foreach ($file in $files) {
            $relativePath = $file.FullName.Replace("$PWD\src\domains\$domain\", "")
            $targetPath = "src\domains\system-administration\$relativePath"
            $targetDir = Split-Path $targetPath -Parent
            
            if (!(Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force
            }
            
            if (!(Test-Path $targetPath)) {
                Copy-Item $file.FullName -Destination $targetPath -Force
            }
        }
        Remove-Item -Path $sourcePath -Recurse -Force
    }
}
```

### Step 7: Move Home to App
```powershell
$sourcePath = "src\domains\home"
if (Test-Path $sourcePath) {
    if (!(Test-Path "src\app\pages")) {
        New-Item -ItemType Directory -Path "src\app\pages" -Force
    }
    Copy-Item -Path "$sourcePath\*" -Destination "src\app\pages\" -Recurse -Force
    Remove-Item -Path $sourcePath -Recurse -Force
}
```

### Step 8: Verify Structure
```powershell
Write-Host "`n✅ Domain Consolidation Complete!" -ForegroundColor Green
Write-Host "`nFinal Domain Structure:" -ForegroundColor Cyan
Get-ChildItem -Path "src\domains" -Directory | Select-Object Name
```

### Step 9: Commit Changes
```powershell
git add .
git commit -m "refactor: Consolidate domains into DDD structure

- Merged auth + session → authentication
- Merged users + account + profile → user-management  
- Merged workflows → workflow-engine
- Merged analytics + dashboard + reports → analytics-dashboard
- Merged settings + security + moderation + status + activity + support → system-administration
- Moved home → app/pages

All domains now follow DDD structure with clear boundaries."
```

---

## 📊 Expected Final Structure

```
src/domains/
├── authentication/          ✅ Consolidated
├── user-management/         ✅ Consolidated
├── workflow-engine/         ✅ Consolidated
├── analytics-dashboard/     ✅ Consolidated
└── system-administration/   ✅ Consolidated
```

**From**: 22 domains → **To**: 5 clean domains

---

## 🔍 Post-Consolidation Tasks

1. **Update Barrel Exports**: Ensure each domain has proper index.ts
2. **Fix Imports**: Update imports to use new domain names
3. **Remove Duplicates**: Check for duplicate files and resolve
4. **Test Build**: Run `npm run build` and fix errors
5. **Update Documentation**: Update ARCHITECTURE.md with final structure

---

## ⚠️ Rollback Plan

If issues occur:
```powershell
git reset --hard ddd-pre-consolidation
```

---

**Status**: Ready to execute  
**Estimated Time**: 15-20 minutes  
**Risk Level**: Medium (use git tags for safety)
