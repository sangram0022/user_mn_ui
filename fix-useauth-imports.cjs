/**
 * Fix all useAuth imports to point to correct AuthContext file
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
    
    //  Determine the correct relative path from each file to AuthContext
    // All files are in domains/* or app/*, so they need different paths
    const dir = path.dirname(file);
    let relativePath;
    
    if (dir.startsWith('src/domains/auth')) {
      // Same domain
      relativePath = './context/AuthContext';
    } else if (dir.startsWith('src/app')) {
      // From app to domains
      relativePath = '../domains/auth/context/AuthContext';
    } else {
      // From other domains to auth domain
      relativePath = '../auth/context/AuthContext';
    }
    
    const before = content.match(/from ['"]\.\.\/domains\/auth['"]/g);
    content = content.replace(/from ['"]\.\.\/domains\/auth['"]/, `from '${relativePath}'`);
    const after = content.match(/from ['"]\.\.\/domains\/auth['"]/g);
    
    if (before && !after) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed ${file}`);
    }
  }
});

console.log('\n✨ All useAuth imports fixed!');
