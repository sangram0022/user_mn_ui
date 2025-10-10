/**
 * Fix all useAuth imports to use full path like RouteGuards.tsx does
 */
const fs = require('fs');
const path = require('path');

const replacements = {
  'src/app/navigation/PrimaryNavigation.tsx': '../domains/auth/context/AuthContext',
  'src/domains/account/pages/AccountPage.tsx': '../../auth/context/AuthContext',
  'src/domains/activity/pages/ActivityPage.tsx': '../../auth/context/AuthContext',
  'src/domains/analytics/pages/AnalyticsPage.tsx': '../../auth/context/AuthContext',
  'src/domains/auth/pages/LoginPage.tsx': '../context/AuthContext',
  'src/domains/dashboard/pages/RoleBasedDashboardPage.tsx': '../../auth/context/AuthContext',
  'src/domains/moderation/pages/ModerationPage.tsx': '../../auth/context/AuthContext',
  'src/domains/profile/pages/ProfilePage.tsx': '../../auth/context/AuthContext',
  'src/domains/security/pages/SecurityPage.tsx': '../../auth/context/AuthContext',
  'src/domains/status/pages/SystemStatusPage.tsx': '../../auth/context/AuthContext',
  'src/domains/users/pages/UserManagementPage.tsx': '../../auth/context/AuthContext',
  'src/domains/workflows/pages/ApprovalsPage.tsx': '../../auth/context/AuthContext',
  'src/domains/workflows/pages/WorkflowManagementPage.tsx': '../../auth/context/AuthContext',
};

Object.entries(replacements).forEach(([file, newPath]) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace any variation of auth imports
    const patterns = [
      /from ['"]\.\.\/domains\/auth['"]/g,
      /from ['"]\.\.\/auth['"]/g,
      /from ['"]\.\.\/index['"]/g,
    ];
    
    let changed = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `from '${newPath}'`);
        changed = true;
      }
    });
    
    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${file}`);
    }
  }
});

console.log('\n✨ All imports fixed!');
