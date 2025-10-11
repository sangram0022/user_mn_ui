# PowerShell script to fix common ESLint errors

# Function to replace 'any' with 'unknown' in type positions
function Fix-AnyToUnknown {
    param($file)
    
    # Read file content
    $content = Get-Content $file -Raw
    
    # Replace common 'any' patterns with 'unknown'
    $content = $content -replace '\: any\>', ': unknown>'
    $content = $content -replace '\: any\[', ': unknown['
    $content = $content -replace '\: any\s*\|', ': unknown |'
    $content = $content -replace '\: any\s*=', ': unknown ='
    $content = $content -replace '\(value\: any\)', '(value: unknown)'
    $content = $content -replace '\(error\: any\)', '(error: unknown)'
    $content = $content -replace '\(data\: any\)', '(data: unknown)'
    $content = $content -replace '<any>', '<unknown>'
    $content = $content -replace 'Record<string, any>', 'Record<string, unknown>'
    $content = $content -replace 'Promise<any>', 'Promise<unknown>'
    $content = $content -replace '\[\.\.\. args\: any\[\]\]', '[...args: unknown[]]'
    
    # Save back to file
    Set-Content -Path $file -Value $content -NoNewline
}

# Function to prefix unused variables with underscore
function Fix-UnusedVars {
    param($file)
    
    $content = Get-Content $file -Raw
    
    # Common unused variable patterns
    $content = $content -replace '}\s*catch\s*\(error\)', '} catch (_error)'
    $content = $content -replace 'const\s+error\s*=', 'const _error ='
    $content = $content -replace '\(url\:', '(_url:'
    $content = $content -replace '\(data\:', '(_data:'
    $content = $content -replace '\(config\:', '(_config:'
    $content = $content -replace '\(interceptor\:', '(_interceptor:'
    $content = $content -replace '\(loadingResult\)', '(_loadingResult)'
    
    Set-Content -Path $file -Value $content -NoNewline
}

# Function to fix regex escapes
function Fix-RegexEscapes {
    param($file)
    
    $content = Get-Content $file -Raw
    
    # Fix unnecessary escapes in regex
    $content = $content -replace '\\\\\\(', '\('
    $content = $content -replace '\\\\\\)', '\)'  
    $content = $content -replace '\\\\\.', '\.'
    $content = $content -replace '\\\\"', '\"'
    
    Set-Content -Path $file -Value $content -NoNewline
}

# List of files to fix
$filesToFix = @(
    "src\shared\utils\testing.ts",
    "src\shared\performance\lazyLoading.ts",
    "src\shared\performance\performanceOptimization.ts",
    "src\shared\performance\PerformanceMonitor.tsx",
    "src\shared\performance\performance-optimizations.ts",
    "src\test\utils\test-utils.tsx",
    "src\shared\utils\testUtilsCore.ts",
    "src\shared\utils\__tests__\performance-optimizations.test.ts",
    "src\shared\utils\__tests__\utilities.test.ts",
    "src\infrastructure\api\apiClient.ts",
    "src\infrastructure\api\types.ts",
    "src\infrastructure\monitoring\types.ts",
    "src\infrastructure\security\types.ts",
    "src\infrastructure\storage\StorageManager.ts",
    "src\infrastructure\storage\types.ts",
    "src\shared\types\micro-frontend.types.ts",
    "src\shared\components\GenericComponents.tsx",
    "src\shared\security\inputValidation.ts",
    "src\shared\utils\GlobalErrorHandler.ts",
    "src\shared\utils\logger.ts",
    "src\domains\authentication\domain-module.ts",
    "ZUSTAND_USAGE_EXAMPLES.tsx",
    "e2e\user-management.spec.ts",
    "src\domains\authentication\store\authStore.test.ts",
    "src\shared\hooks\useAdvancedHooks.ts",
    "src\shared\performance\performanceMonitoring.ts"
)

Write-Host "Fixing ESLint errors..." -ForegroundColor Green

foreach ($file in $filesToFix) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Yellow
        Fix-AnyToUnknown $file
        Fix-UnusedVars $file
        Fix-RegexEscapes $file
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! Running eslint to verify..." -ForegroundColor Green
npm run lint
