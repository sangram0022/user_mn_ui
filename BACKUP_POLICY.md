# CSS and Reference Pages Backup Policy

## Latest Backup: 2025-10-28-1317

### What's Backed Up:
- ✅ `src/App.css`
- ✅ `src/index.css`
- ✅ `src/styles/` (complete directory with all subdirectories)
- ✅ `src/_reference_backup_ui/` (complete reference pages)

### Backup Location:
```
backup-2025-10-28-1317/
├── css/
│   ├── App.css
│   ├── index.css
│   └── styles/
│       ├── components/
│       ├── compositions/
│       ├── tokens/
│       └── utilities/
├── reference-pages/
│   └── _reference_backup_ui/
│       ├── ComponentPatternsReference.tsx
│       ├── FormPatternsReference.tsx
│       ├── HtmlShowcase.tsx
│       ├── ModernHtmlPage.tsx
│       ├── ProductsPage.tsx
│       ├── ServicesPage.tsx
│       ├── UIElementsShowcase.tsx
│       └── [other reference files]
└── README.md
```

## 🚨 IMPORTANT RULES:

### CSS Modifications:
- ✅ **ALLOWED**: Modify `src/App.css`, `src/index.css`, and `src/styles/`
- ✅ **BACKUP**: Create new timestamped backup before major changes
- ✅ **DOCUMENT**: Update this file with new backup timestamps

### Reference Pages - HANDS OFF:
- ❌ **NEVER MODIFY**: Files in `src/_reference_backup_ui/`
- ❌ **NO CSS CHANGES**: Don't apply styles to reference pages
- ℹ️ **PURPOSE**: These are for reference and comparison only

### Future Backup Creation:
```powershell
# Create new backup
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
New-Item -ItemType Directory -Path "backup-$timestamp" -Force
New-Item -ItemType Directory -Path "backup-$timestamp\css" -Force
New-Item -ItemType Directory -Path "backup-$timestamp\reference-pages" -Force

# Copy CSS files
Copy-Item "src\App.css" "backup-$timestamp\css\" -Force
Copy-Item "src\index.css" "backup-$timestamp\css\" -Force
Copy-Item "src\styles" "backup-$timestamp\css\styles" -Recurse -Force

# Copy reference pages
Copy-Item "src\_reference_backup_ui" "backup-$timestamp\reference-pages\_reference_backup_ui" -Recurse -Force
```

## Backup History:
- **2025-10-28-1317**: Initial comprehensive backup (CSS + Reference Pages)
- **2025-10-28**: Previous CSS-only backup (older format)

---
**Last Updated**: October 28, 2025
**Next Backup**: Before next major CSS restructure