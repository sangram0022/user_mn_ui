#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Comprehensive React codebase optimization script
.DESCRIPTION
    Automatically optimizes the React codebase by:
    - Removing unnecessary React imports
    - Validating with linter
    - Running tests
    - Building the project
.EXAMPLE
    .\scripts\optimize-codebase.ps1
#>

param(
    [switch]$SkipTests = $false,
    [switch]$SkipBuild = $false,
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"
$startTime = Get-Date

Write-Host ""
Write-Host "[OPTIMIZATION] Starting Comprehensive Codebase Optimization" -ForegroundColor Green
Write-Host "===========================================================" -ForegroundColor Green
Write-Host ""

# Phase 1: Remove unnecessary React imports
Write-Host "[PHASE 1] Optimizing React imports..." -ForegroundColor Cyan
Write-Host ""

$files = Get-ChildItem -Path "src" -Include "*.tsx" -Recurse -Exclude "*test*","*spec*","*.d.ts"
$optimizedCount = 0
$skippedCount = 0
$totalFiles = $files.Count

Write-Host "  Found $totalFiles component files to analyze" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Check if file has standalone "import React from 'react';"
    if ($content -match 'import React from .react.;') {
        
        # Only remove if:
        # 1. File also imports hooks/types from react (showing it uses modern patterns)
        # 2. File doesn't use React.* namespace (createElement, Fragment, etc.)
        # 3. File is not a class component
        
        $hasModernImports = $content -match 'import \{[^}]+\} from .react.;'
        $usesReactNamespace = $content -match 'React\.(createElement|Fragment|Component|PureComponent|memo|forwardRef|lazy|Suspense)'
        $isClassComponent = $content -match 'class \w+ extends (React\.)?Component'
        
        if ($hasModernImports -and -not $usesReactNamespace -and -not $isClassComponent) {
            # Safe to remove
            $content = $content -replace 'import React from .react.;\r?\n', ''
            
            if ($content -ne $original) {
                if (-not $DryRun) {
                    Set-Content -Path $file.FullName -Value $content -NoNewline
                    Write-Host "  [OPTIMIZED] $relativePath" -ForegroundColor Green
                } else {
                    Write-Host "  [DRY RUN] Would optimize: $relativePath" -ForegroundColor Yellow
                }
                $optimizedCount++
            }
        } else {
            Write-Host "  [SKIPPED] $relativePath (needs manual review)" -ForegroundColor Gray
            $skippedCount++
        }
    }
}

Write-Host ""
Write-Host "  [SUMMARY] Phase 1 Results:" -ForegroundColor Cyan
Write-Host "     Total files analyzed: $totalFiles" -ForegroundColor White
Write-Host "     Files optimized: $optimizedCount" -ForegroundColor Green
Write-Host "     Files skipped: $skippedCount" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "[INFO] Dry run complete - no files were modified" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Phase 2: Run linter
Write-Host "[PHASE 2] Running ESLint..." -ForegroundColor Cyan
Write-Host ""

try {
    npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "  [SUCCESS] Lint check passed!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "  [ERROR] Lint check failed!" -ForegroundColor Red
        Write-Host "     Please fix linting errors before continuing" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "  [ERROR] Error running linter: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Phase 3: Run tests (if not skipped)
if (-not $SkipTests) {
    Write-Host "[PHASE 3] Running test suite..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        npm run test
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "  [SUCCESS] All tests passed!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "  [ERROR] Tests failed!" -ForegroundColor Red
            Write-Host "     Please fix failing tests before continuing" -ForegroundColor Red
            Write-Host ""
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "  [ERROR] Error running tests: $_" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} else {
    Write-Host "[PHASE 3] Tests skipped (--SkipTests flag)" -ForegroundColor Yellow
    Write-Host ""
}

# Phase 4: Build (if not skipped)
if (-not $SkipBuild) {
    Write-Host "[PHASE 4] Building production bundle..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        npm run build
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "  [SUCCESS] Build successful!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "  [ERROR] Build failed!" -ForegroundColor Red
            Write-Host "     Please fix build errors" -ForegroundColor Red
            Write-Host ""
            exit 1
        }
    } catch {
        Write-Host ""
        Write-Host "  [ERROR] Error during build: $_" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
} else {
    Write-Host "[PHASE 4] Build skipped (--SkipBuild flag)" -ForegroundColor Yellow
    Write-Host ""
}

# Calculate elapsed time
$endTime = Get-Date
$elapsed = $endTime - $startTime

# Final summary
Write-Host ""
Write-Host "[COMPLETE] Optimization Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "  [SUMMARY]" -ForegroundColor Cyan
Write-Host "     Files optimized: $optimizedCount" -ForegroundColor Green
Write-Host "     Lint status: PASSED" -ForegroundColor Green
if (-not $SkipTests) {
    Write-Host "     Test status: PASSED" -ForegroundColor Green
}
if (-not $SkipBuild) {
    Write-Host "     Build status: PASSED" -ForegroundColor Green
}
Write-Host "     Time elapsed: $($elapsed.ToString('mm\:ss'))" -ForegroundColor Yellow
Write-Host ""
Write-Host "  [NEXT STEPS]" -ForegroundColor Cyan
Write-Host "     1. Review the COMPREHENSIVE_OPTIMIZATION_GUIDE.md" -ForegroundColor White
Write-Host "     2. Manually address console.log replacements (Phase 2)" -ForegroundColor White
Write-Host "     3. Resolve TODO comments (Phase 3)" -ForegroundColor White
Write-Host "     4. Consider performance optimizations (Phase 8)" -ForegroundColor White
Write-Host ""
Write-Host "  [DOCUMENTATION]" -ForegroundColor Cyan
Write-Host "     See COMPREHENSIVE_OPTIMIZATION_GUIDE.md for detailed implementation guide" -ForegroundColor White
Write-Host ""
