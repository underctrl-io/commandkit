const { execSync } = require('child_process');

// Check if there are changes in the website directory
function hasWebsiteChanges() {
  if (process.env.FORCE_BUILD) {
    return false;
  }

  try {
    let changedFiles = '';

    // Try multiple strategies to detect changes
    const strategies = [
      // Strategy 1: Compare with Netlify's CACHED_COMMIT_REF if available
      () => {
        if (process.env.CACHED_COMMIT_REF) {
          return execSync(
            `git diff --name-only ${process.env.CACHED_COMMIT_REF}...HEAD`,
            { encoding: 'utf8' },
          );
        }
        return null;
      },

      // Strategy 2: Use git diff with HEAD~1 (compare with previous commit)
      () => {
        return execSync('git diff --name-only HEAD~1...HEAD', {
          encoding: 'utf8',
        });
      },

      // Strategy 3: Check git status for uncommitted changes
      () => {
        return execSync('git status --porcelain', { encoding: 'utf8' });
      },

      // Strategy 4: Fetch and compare with origin/main
      () => {
        execSync('git fetch origin main --depth=1', { stdio: 'ignore' });
        return execSync('git diff --name-only origin/main...HEAD', {
          encoding: 'utf8',
        });
      },
    ];

    // Try each strategy until one works
    for (const strategy of strategies) {
      try {
        const result = strategy();
        if (result !== null) {
          changedFiles = result;
          break;
        }
      } catch (e) {
        // Continue to next strategy
        continue;
      }
    }

    if (!changedFiles) {
      console.log(
        'Could not determine changes using any strategy, allowing build to proceed',
      );
      return true;
    }

    console.log('Changed files detected:', changedFiles.trim());

    // Check if any of the changed files are in the website directory
    const websiteChanges = changedFiles.split('\n').filter((file) => {
      const trimmedFile = file.trim();
      // Handle git status format (files may have status prefixes like M, A, D)
      const cleanFile = trimmedFile.replace(/^[MADRCU?!\s]+/, '');
      return cleanFile && cleanFile.startsWith('apps/website/');
    });

    console.log('Website changes:', websiteChanges);
    return websiteChanges.length > 0;
  } catch (error) {
    console.log('Error determining changes:', error.message);
    console.log('Allowing build to proceed due to error');
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
