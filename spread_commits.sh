#!/bin/bash

# This script rewrites your Git history to spread commit dates over the last 3 weeks.
# WARNING: This will rewrite history and force-push to origin/main!

# Customize these if needed
BRANCH="main"
REMOTE="origin"

# Total number of days to go back
DAYS_BACK=21

# Safety check
echo "⚠️  WARNING: This will rewrite the entire history of '$BRANCH' and force push to '$REMOTE'."
read -p "Are you sure you want to continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

# Get total number of commits
NUM_COMMITS=$(git rev-list --count HEAD)

# Start interactive rebase
git rebase -i --root

# Rebase will pause at each commit if you mark them with 'edit'.
# Now script continues to modify them one-by-one
for (( i=1; i<=$NUM_COMMITS; i++ ))
do
  # Generate a random date within the last 21 days
  OFFSET=$((RANDOM % DAYS_BACK))
  RANDOM_HOUR=$((RANDOM % 24))
  RANDOM_MINUTE=$((RANDOM % 60))
  RANDOM_SECOND=$((RANDOM % 60))
  COMMIT_DATE=$(date -v -${OFFSET}d -v+${RANDOM_HOUR}H -v+${RANDOM_MINUTE}M -v+${RANDOM_SECOND}S +"%Y-%m-%dT%H:%M:%S")

  # Amend with new date
  GIT_COMMITTER_DATE="$COMMIT_DATE" GIT_AUTHOR_DATE="$COMMIT_DATE" git commit --amend --no-edit --date "$COMMIT_DATE"

  # Move to next rebase step
  git rebase --continue
done

# Force push the new history
git push --force $REMOTE $BRANCH
