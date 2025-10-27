/**
 * 🎨 Theme Consistency Verification
 *
 * This script checks if the theme compatibility layer is working correctly
 * by validating CSS variables in the browser.
 *
 * Usage: Open browser console on localhost:5173 and paste this script
 */

// Check if old theme variables are defined (via compatibility layer)
const checkThemeVariables = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const oldVars = [
    '--theme-primary',
    '--theme-text',
    '--theme-textSecondary',
    '--theme-background',
    '--theme-surface',
    '--theme-border',
    '--theme-error',
    '--theme-success',
  ];

  const newVars = [
    '--color-primary',
    '--color-text-primary',
    '--color-text-secondary',
    '--color-background',
    '--color-white',
    '--color-border-primary',
    '--color-error',
    '--color-success',
  ];

  console.log('🔍 Checking Theme Variables...\n');

  // Check old variables (should work via compatibility)
  console.log('📦 Legacy Variables (via compatibility layer):');
  oldVars.forEach((varName) => {
    const value = computedStyle.getPropertyValue(varName).trim();
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value || 'UNDEFINED'}`);
  });

  console.log('\n🆕 New Variables (unified theme):');
  newVars.forEach((varName) => {
    const value = computedStyle.getPropertyValue(varName).trim();
    const status = value ? '✅' : '❌';
    console.log(`${status} ${varName}: ${value || 'UNDEFINED'}`);
  });

  // Summary
  const oldDefined = oldVars.filter((v) => computedStyle.getPropertyValue(v).trim()).length;
  const newDefined = newVars.filter((v) => computedStyle.getPropertyValue(v).trim()).length;

  console.log(`\n📊 Summary:`);
  console.log(`Old variables defined: ${oldDefined}/${oldVars.length}`);
  console.log(`New variables defined: ${newDefined}/${newVars.length}`);

  if (oldDefined === oldVars.length && newDefined === newVars.length) {
    console.log('\n✅ ALL CHECKS PASSED - Theme compatibility is working!');
  } else {
    console.log('\n⚠️ SOME VARIABLES MISSING - Check CSS imports');
  }
};

// Check for hardcoded colors in DOM
const findHardcodedColors = () => {
  const hardcodedPatterns = [
    { pattern: /text-gray-\d+/, type: 'Tailwind text' },
    { pattern: /bg-red-\d+/, type: 'Tailwind background' },
    { pattern: /bg-blue-\d+/, type: 'Tailwind background' },
    { pattern: /border-gray-\d+/, type: 'Tailwind border' },
  ];

  console.log('\n🔍 Scanning for hardcoded colors in DOM...\n');

  const allElements = document.querySelectorAll('*');
  const findings = [];

  allElements.forEach((el) => {
    const classes = el.className;
    if (typeof classes === 'string') {
      hardcodedPatterns.forEach(({ pattern, type }) => {
        if (pattern.test(classes)) {
          findings.push({
            element: el.tagName,
            class: classes.match(pattern)[0],
            type,
            path: getElementPath(el),
          });
        }
      });
    }
  });

  if (findings.length === 0) {
    console.log('✅ No hardcoded colors found! All components use theme variables.');
  } else {
    console.log(`⚠️ Found ${findings.length} hardcoded color instances:\n`);
    findings.slice(0, 10).forEach(({ element, class: cls, type, path }) => {
      console.log(`  <${element}> class="${cls}" (${type})`);
      console.log(`    Path: ${path}\n`);
    });

    if (findings.length > 10) {
      console.log(`  ... and ${findings.length - 10} more\n`);
    }
  }

  return findings;
};

// Helper to get element path
const getElementPath = (el) => {
  const path = [];
  let current = el;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.className) {
      const classes = (typeof current.className === 'string' ? current.className : '')
        .split(' ')
        .filter((c) => c)
        .slice(0, 2)
        .join('.');
      if (classes) selector += `.${classes}`;
    }
    path.unshift(selector);
    current = current.parentElement;
  }

  return path.slice(-3).join(' > ');
};

// Run all checks
console.log('🚀 Theme Consistency Verification\n');
console.log('='.repeat(50));
checkThemeVariables();
console.log('\n' + '='.repeat(50));
const hardcoded = findHardcodedColors();
console.log('='.repeat(50));

console.log('\n💡 Recommendations:');
if (hardcoded.length > 0) {
  console.log('  1. Replace hardcoded Tailwind colors with CSS variables');
  console.log('  2. Use style={{ color: "var(--color-text-primary)" }}');
  console.log('  3. Or use Tailwind arbitrary values: text-[color:var(--color-text-primary)]');
} else {
  console.log('  ✅ Theme is fully consistent across the application!');
}

console.log('\n📚 Documentation:');
console.log('  - See THEME_CONSISTENCY_FIX.md for migration guide');
console.log('  - Check src/styles/legacy-theme-compat.css for variable mappings');
console.log('  - Review src/styles/unified-theme.css for OKLCH color definitions');
