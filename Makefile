# Dev workflow for the Jekyll site + Vercel `api/` functions.
# macOS system Ruby (2.6) is too old, so force Homebrew Ruby for Jekyll.
export PATH := /usr/local/opt/ruby/bin:$(PATH)

.PHONY: dev build serve css deploy

# Build the site, then serve _site + api/events.js at http://localhost:3001
dev: build
	node scripts/devserver.mjs

# One-off Jekyll build into _site/
build:
	bundle exec jekyll build

# Live-reloading static preview (no api/ functions; use `make dev` for those)
serve:
	bundle exec jekyll serve --watch

# Regenerate the events page stylesheet after changing Tailwind classes
css:
	npx -y tailwindcss@3 -c tailwind.config.js -i scripts/tw-input.css \
		-o static/css/events.css --minify

# Deploy to production via Vercel
deploy:
	vercel --prod
