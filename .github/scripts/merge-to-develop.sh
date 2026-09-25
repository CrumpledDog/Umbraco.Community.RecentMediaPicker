#!/usr/bin/env bash
# Fast-forwards a release branch back into its matching develop branch after a release, so the next
# develop prerelease build includes whatever was just released (release-only hotfix commits, the
# semantic-release version-bump commit, etc).
#
# Usage: merge-to-develop.sh <release-branch> <develop-branch>
#   e.g. merge-to-develop.sh release/v1 develop/v1
set -euo pipefail

RELEASE_BRANCH="${1:?Usage: merge-to-develop.sh <release-branch> <develop-branch>}"
DEVELOP_BRANCH="${2:?Usage: merge-to-develop.sh <release-branch> <develop-branch>}"

# Files listed with a `merge=ours` custom driver in .gitattributes (Directory.Packages.props,
# Directory.Build.props, .releaserc, Client/package.json, Client/package-lock.json) are expected to
# diverge permanently between major-version branch lines - this driver must be enabled before the merge
# below runs, or those files will conflict instead of silently keeping the target branch's version.
git config merge.ours.driver true

git fetch origin "$RELEASE_BRANCH" "$DEVELOP_BRANCH"
git checkout -B "$DEVELOP_BRANCH" "origin/$DEVELOP_BRANCH"
git merge --no-ff "origin/$RELEASE_BRANCH" -m "chore: merge $RELEASE_BRANCH back into $DEVELOP_BRANCH after release"
git push origin "$DEVELOP_BRANCH"
