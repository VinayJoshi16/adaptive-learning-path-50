#!/bin/sh
# Reassign bot commits to vinay Joshi - removes lovable-dev[bot] from Contributors
# Run: bash rewrite-contributors.sh
# Then: git push --force origin main

git filter-branch -f --env-filter '
if [ "$GIT_AUTHOR_NAME" = "gpt-engineer-app[bot]" ] || [ "$GIT_AUTHOR_EMAIL" = "159125892+gpt-engineer-app[bot]@users.noreply.github.com" ]; then
  export GIT_AUTHOR_NAME="vinay Joshi"
  export GIT_AUTHOR_EMAIL="139681680+VinayJoshi16@users.noreply.github.com"
fi
if [ "$GIT_AUTHOR_NAME" = "Lovable" ] || [ "$GIT_AUTHOR_EMAIL" = "noreply@lovable.dev" ]; then
  export GIT_AUTHOR_NAME="vinay Joshi"
  export GIT_AUTHOR_EMAIL="139681680+VinayJoshi16@users.noreply.github.com"
fi
if [ "$GIT_COMMITTER_NAME" = "gpt-engineer-app[bot]" ] || [ "$GIT_COMMITTER_EMAIL" = "159125892+gpt-engineer-app[bot]@users.noreply.github.com" ]; then
  export GIT_COMMITTER_NAME="vinay Joshi"
  export GIT_COMMITTER_EMAIL="139681680+VinayJoshi16@users.noreply.github.com"
fi
if [ "$GIT_COMMITTER_NAME" = "Lovable" ] || [ "$GIT_COMMITTER_EMAIL" = "noreply@lovable.dev" ]; then
  export GIT_COMMITTER_NAME="vinay Joshi"
  export GIT_COMMITTER_EMAIL="139681680+VinayJoshi16@users.noreply.github.com"
fi
' --tag-name-filter cat -- --all
