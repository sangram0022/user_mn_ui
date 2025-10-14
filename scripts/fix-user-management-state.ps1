# UserManagementPage State Consolidation Fix Script
# This script updates all references from individual state to consolidated state objects

Write-Host "Starting UserManagementPage state consolidation..." -ForegroundColor Cyan

$filePath = "src\domains\users\pages\UserManagementPage.tsx"
$content = Get-Content $filePath -Raw

Write-Host "Original file size: $($content.Length) characters" -ForegroundColor Yellow

# Backup original
Copy-Item $filePath "$filePath.backup" -Force
Write-Host "Created backup: $filePath.backup" -ForegroundColor Green

# Replace filter references
$replacements = @(
    @{From = 'filterRole,'; To = 'filters.role,'},
    @{From = 'filterActive,'; To = 'filters.isActive,'},
    @{From = 'filterRole\)'; To = 'filters.role)'},
    @{From = 'filterActive\)'; To = 'filters.isActive)'},
    @{From = 'searchTerm !='; To = 'filters.searchTerm !='},
    @{From = 'searchTerm\|\|'; To = 'filters.searchTerm||'},
    @{From = 'value=\{searchTerm\}'; To = 'value={filters.searchTerm}'},
    @{From = 'setSearchTerm\(e\.target\.value\)'; To = 'setFilters(prev => ({ ...prev, searchTerm: e.target.value }))'},
    @{From = 'value=\{filterRole\}'; To = 'value={filters.role}'},
    @{From = 'setFilterRole\(e\.target\.value\)'; To = 'setFilters(prev => ({ ...prev, role: e.target.value }))'},
    @{From = 'value=\{filterActive'; To = 'value={filters.isActive'},
    @{From = 'setFilterActive\(value === '; To = 'setFilters(prev => ({ ...prev, isActive: value === '},
    @{From = 'setSearchTerm\(''\''\)'; To = 'setFilters(prev => ({ ...prev, searchTerm: '''' }))'},
    @{From = 'setFilterRole\(''\''\)'; To = 'setFilters(prev => ({ ...prev, role: '''' }))'},
    @{From = 'setFilterActive\(undefined\)'; To = 'setFilters(prev => ({ ...prev, isActive: undefined }))'},
    @{From = 'selectedUser\)'; To = 'uiState.selectedUser)'},
    @{From = 'setSelectedUser\(user\)'; To = 'setUIState(prev => ({ ...prev, selectedUser: user }))'},
    @{From = 'setShowUserModal\(true\)'; To = 'setUIState(prev => ({ ...prev, showUserModal: true }))'},
    @{From = 'setShowUserModal\(false\)'; To = 'setUIState(prev => ({ ...prev, showUserModal: false }))'},
    @{From = 'setShowCreateModal\(true\)'; To = 'setUIState(prev => ({ ...prev, showCreateModal: true }))'},
    @{From = 'setShowCreateModal\(false\)'; To = 'setUIState(prev => ({ ...prev, showCreateModal: false }))'},
    @{From = 'selectedUsers\.size'; To = 'uiState.selectedUsers.size'},
    @{From = 'selectedUsers\.has'; To = 'uiState.selectedUsers.has'},
    @{From = 'selectedUsers\)\)'; To = 'uiState.selectedUsers))'},
    @{From = 'setSelectedUsers\(new Set<string>\(\)\)'; To = 'setUIState(prev => ({ ...prev, selectedUsers: new Set<string>() }))'},
    @{From = 'setSelectedUsers\(\(prev\)'; To = 'setUIState(prev => ({ ...prev, selectedUsers: (function() { const prevSet = prev.selectedUsers;'},
    @{From = '\}\)\)'; To = '})() }))'; # Close the IIFE
    @{From = '\[filterActive, filterRole, searchTerm\]'; To = '[filters.isActive, filters.role, filters.searchTerm]'}
)

$newContent = $content
$changeCount = 0

foreach ($replacement in $replacements) {
    $before = $newContent.Length
    $newContent = $newContent -replace $replacement.From, $replacement.To
    $after = $newContent.Length
    
    if ($before -ne $after) {
        $changeCount++
        Write-Host "  ✓ Applied: $($replacement.From) → $($replacement.To)" -ForegroundColor Green
    }
}

# Save updated content
Set-Content $filePath -Value $newContent -NoNewline

Write-Host "`nCompleted!" -ForegroundColor Green
Write-Host "  Changes applied: $changeCount" -ForegroundColor Cyan
Write-Host "  New file size: $($newContent.Length) characters" -ForegroundColor Yellow
Write-Host "  Backup saved at: $filePath.backup" -ForegroundColor Magenta
Write-Host "`nNote: Please review the changes and test the application." -ForegroundColor Yellow
