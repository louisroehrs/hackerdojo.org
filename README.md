# HackerDojo.org

This is the website for Hacker Dojo. It is a collaborative hackerspace where tech enthusiasts gather to build, experiment and improve.

# Setup

This project uses [Jekyll](https://jekyllrb.com/) which relies on [Ruby](https://www.ruby-lang.org/)
to build the website's codebase.

## Installation

- [Install Ruby 3+](https://www.ruby-lang.org/en/documentation/installation/)
- `gem install jekyll bundler`

### Usage

Once all pre-requisites are installed, you can preview the website using:

```sh
jekyll serve
```

# Development & deployment

The site is a Jekyll build plus a Vercel serverless function in `api/`
(`api/events.js`, which powers the events page). A `Makefile` wraps the common
tasks and forces Homebrew Ruby, since macOS system Ruby (2.6) is too old to build
the site.

## Dev

```sh
make dev      # jekyll build + serve _site & /api/events at http://localhost:3001
```

`make dev` builds the static site and runs a small Node server
(`scripts/devserver.mjs`) that serves `_site` and runs `api/events.js`
same-origin, so the events page works end-to-end without `vercel dev`.

Re-run `make dev` after editing `events.html` or CSS (it rebuilds). After editing
`api/events.js`, also re-run it — the function is imported once at startup.

Other targets:

```sh
make serve    # live-reloading static preview, but NO api/ functions
make css      # regenerate static/css/events.css after changing Tailwind classes
make build    # one-off jekyll build
```

## Production

```sh
make deploy   # vercel --prod  (Vercel runs the build + api/ function)
```

Or push the branch if the repo is linked to Vercel — it deploys automatically.
Production does not hit the system-Ruby issue; Vercel's build image has its own
Ruby.

## Events page

`events.html` fetches `/api/events`, which reads Hacker Dojo's Meetup RSS feed
server-side (no CORS), scrapes each event's `og:image`, and returns ready-to-inject
HTML cards. Styling comes from a compiled Tailwind stylesheet
(`static/css/events.css`); after changing any Tailwind classes in `events.html` or
`api/events.js`, regenerate it with `make css`.
