const { execSync } = require('child_process');

// Check if there are changes in the website directory
function hasWebsiteChanges() {
  try {
    // Get the list of changed files in the current commit compared to the base branch
    const baseBranch = process.env.BASE_BRANCH || 'main';
    const changedFiles = execSync(
      `git diff --name-only origin/${baseBranch}...HEAD`,
      { encoding: 'utf8' },
    );

    // Check if any of the changed files are in the website directory
    const websiteChanges = changedFiles
      .split('\n')
      .filter((file) => file.trim() && file.startsWith('apps/website/'));

    return websiteChanges.length > 0;
  } catch (error) {
    // If we can't determine changes, allow the build to proceed
    console.log('Could not determine changes, allowing build to proceed');
    return true;
  }
}

// Ignore build if:
// 1. Branch is owned by renovate, OR
// 2. No changes in website directory
const shouldIgnore =
  process.env.BRANCH?.includes('renovate') || !hasWebsiteChanges();

process.exitCode = shouldIgnore ? 0 : 1;

if (shouldIgnore) {
  console.log('Build ignored: No relevant changes detected');
} else {
  console.log('Build proceeding: Website changes detected');
}
