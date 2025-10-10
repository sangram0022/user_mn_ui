/**
 * Fix all useAuth imports to use barrel export from domains/auth/index.ts
 */
const fs = require('fs');
const path = require('path');

const files = [
  'src/app/navigation/PrimaryNavigation.tsx',
  'src/domains/account/pages/AccountPage.tsx',
  'src/domains/activity/pages/ActivityPage.tsx',
  'src/domains/analytics/pages/AnalyticsPage.tsx',
  'src/domains/auth/pages/LoginPage.tsx',
  'src/domains/dashboard/pages/RoleBasedDashboardPage.tsx',
  'src/domains/moderation/pages/ModerationPage.tsx',
  'src/domains/profile/pages/ProfilePage.tsx',
  'src/domains/security/pages/SecurityPage.tsx',
  'src/domains/status/pages/SystemStatusPage.tsx',
  'src/domains/users/pages/UserManagementPage.tsx',
  'src/domains/workflows/pages/ApprovalsPage.tsx',
  'src/domains/workflows/pages/WorkflowManagementPage.tsx',
];

files.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    //  Use barrel export from domains/auth
    const dir = path.dirname(file);
    let relativePath;
    
    if (dir.startsWith('src/domains/auth')) {
      // Same domain - use barrel export
      relativePath = '../index';
    } else if (dir.startsWith('src/app')) {
      // From app to domains/auth barrel
      relativePath = '../domains/auth';
    } else {
      // From other domains to auth domain barrel
      relativePath = '../auth';
    }
    
    // Replace all variations
    const patterns = [
      /from ['"]\.\.\/domains\/auth\/context\/AuthContext['"]/g,
      /from ['"]\.\.\/auth\/context\/AuthContext['"]/g,
      /from ['"]\.\/context\/AuthContext['"]/g,
    ];
    
    let changed = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `from '${relativePath}'`);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${file} -> ${relativePath}`);
    }
  }
});

console.log('\n✨ All imports now use barrel exports!');
