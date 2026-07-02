#!/usr/bin/env bash
# Start the local dev environment: build the Jekyll site, then serve _site and
# the api/events.js function same-origin at http://localhost:3001/events/
#
#   ./start.sh
#
# macOS system Ruby (2.6) is too old to build the site, so force Homebrew Ruby.
# After editing api/events.js, restart this script (the function is imported once).
set -euo pipefail

cd "$(dirname "$0")"
export PATH="/usr/local/opt/ruby/bin:$PATH"

bundle exec jekyll build
exec node scripts/devserver.mjs

