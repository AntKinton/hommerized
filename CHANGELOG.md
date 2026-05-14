# Changelog

All notable changes to this project will be documented in this file.

## [26.05.2] - 2026-05-14

### ⚙️ Miscellaneous Tasks

- **config:** Ignore dev-dist directory

### 🎨 Styling

- **ui:** Remove legacy SCSS, migrate to native Bulma, and update core layout components

### 👽 Other Changes

- Add architecture blueprints and assets
- Modularize state management
- Implement dynamic service engine
- Cleanup UI and remove legacy components
- V26.05.2 architecture rework

### 📚 Documentation

- **core:** Add architecture blueprints and update PWA/branding assets

### 🚀 Features

- **architecture:** Implement dynamic ServiceHandler, base adapters, and archetypes

### 🚜 Refactor

- **state:** Modularize Pinia stores and update build config

## [26.05.1] - 2026-05-11

### ⚙️ Miscellaneous Tasks

- Applies spell-check against entire repo (aspell)
- Dependency update
- Lint
- **lint:** Apply on latest additions
- Dependencies update
- **lint:** Eslint 9 update
- **docker:** Small cleanup
- Lint the style files
- **deps:** Bump @eslint/plugin-kit from 0.2.0 to 0.2.3
- **deps:** Bump cross-spawn from 7.0.3 to 7.0.5
- **deps:** Bump nanoid from 3.3.7 to 3.3.8
- Update dependencies
- **deps-dev:** Bump vite from 6.0.5 to 6.0.9
- Dependency updates
- **lint:** Apply config update
- Set official config
- **deps-dev:** Bump vite from 6.1.1 to 6.1.2
- **lint:** Apply lint
- **deps-dev:** Bump vite from 6.1.2 to 6.1.3
- **deps-dev:** Bump vite from 6.1.3 to 6.1.4
- **deps-dev:** Bump vite from 6.1.4 to 6.1.5
- **deps-dev:** Bump vite from 6.1.5 to 6.1.6
- **lint:** Apply lint
- **release:** Version bump
- Update dependencies
- **deps-dev:** Bump vite from 7.0.6 to 7.0.7
- Dependencies updates
- Add ai generated data for missing mocks
- **release:** Version bump
- **transmission:** Cleanup component code
- Release version bump
- **deps-dev:** Bump vite from 7.1.6 to 7.1.11
- Dependency updates
- Lint apply
- Dependency updates
- **deps:** Bump yaml from 2.8.2 to 2.8.3 (#1027)
- Update alpine base image version
- Build using node 24
- Update dependencies
- Lint updates
- **deps-dev:** Bump vite from 8.0.3 to 8.0.5
- **services:** Remove deprecated error component
- **release:** Prepare v26.05.1, setup git-cliff and clean CI

### 🐛 Bug Fixes

- **auth:** Add timestamp in URL to prevent infinite redirection loop
- Resolve typo in Healthchecks service name
- Fix search on page load
- Allow disabling IPv6
- Use double brackets instead of test
- Rename ipv6.sh -> lighttpd-ipv6.sh
- **docs:** Only accept 1 for IPV6_DISABLE
- Reverse IPV6_DISABLE logic
- Improve grammar of offline message
- **lint:** Downgrade eslint, requires more work
- Remove copy past error
- Correct procedure to install chart
- **fonts:** Remove lato reference
- **search:** Make keyboard shortcut works again
- **ci:** Latest docker tag targets the latest tag
- **ci:** Remove duplicate pnpm version
- Update Mealie service component endpoints
- Name collision in NextCloud service
- Empty / null headers issue
- **style:** Remove duplicated styles
- Peanut mock data folder & doc typos
- Make sure healthcheck dont use a proxy #394
- **search:** Allow usage of the hotkey in the text
- **cards:** Avoid lowercase letters cut off #794
- **Dockerfile:** Ensure VERSION_TAG is correctly passed as a build argument
- **Dockerfile:** Add default value for ARG VERSION_TAG to prevent build errors
- **navbar:** Adjust icon spacing #857
- Hide overflow to avoid scroll bars in cards #885
- **docker:** Disable log for healthcheck requests
- **fresh-rss:** Fix response decoding #902
- **connectivity-checker:** Fix network offline issue with auth proxies #961
- **dev-server:** Fix unparsable dummy-data fson file
- Ensure independent service state between page
- **neon-theme:** Add missing highlight-variant-inverted colors for better contrast
- **smartcard:** Fix transmission service rework
- Ensure smart cards re-mount correctly between pages (stable keys in ServiceGroup) (#1005)
- Update API key retrieval instructions for NetAlertx integration
- Auto update system adjustments
- Simplify scheduler implementation
- Documentation rebase fuckup -_-
- **hyperHDR:** Missing return

### 👽 Other Changes

- Disable file listing on arm build
- Html title based on configuration
- Should have "s" in alias
- Add openweather service help (#471)
- Bug Fix - Remove double // in aliveCheckUrl causing Invalid Redirect URL with CloudFlare Access.
- Don't stretch non-square logos (#640)
- Release 24.11.2
- Release 24.11.3
- Update smart card showcase
- Allow reload. Reformat with template by  joriswvanrijn
- Incorporate modern tooling and docs
- Integrate global state and composables
- Integrate core architecture layer
- Update structural UI components
- Implement authentication and access policies
- Refactor and expand service integrations
- Integrate UI and features layer

### 📚 Documentation

- Updates code-fork to code-branch
- Fixes spelling error in filename
- Document background property for cards
- Add doc for AdGuard Home
- Add Lidarr service to customservices.md
- **auth:** Add auth proxy documentation
- Documentation enchancement for SpeedtestTracker service
- Update port to match the speedtest-tracker compose example
- Better description
- Update kubernetes installation with multiple solution
- **theming:** Describe customization options
- **demo:** Update demo links
- **demo:** Update welcome message.
- Update message.content docs
- Add tips and tricks to show latest picture from camera feed
- Review documentation
- Avoid tarball install issue. fix #620
- Add lemmy and dashboard icons links, cleanup
- Minor improvements
- Remove outdated screenshot
- Add demo link
- **smart-cards:** Sort service list alphabetically
- **docker:** Remove deprecated docker compose section fix #836
- **smartcards:** Fix incomplete sentence. Fix #834
- Configure Pi-Hole v6 API with URL that ends with admin
- Improve smart card documentation.
- Cosmetic update on Traefic documentation
- Add agent instructions file.
- Add section about favicon #1024
- Add deployment and architecture guides

### 📦 Dependencies

- **deps:** Modernize tooling and dependencies

### 🚀 Features

- Enables setting colors for individual cards
- Add Lidarr service
- **pwa:** Enhance connectivity checks
- **auth:** Handle unauthorized request in connectivity
- **connectivity:** Change query parameter to change connectivity
- **auth:** Do not handle redirection in getConfig
- Add custom service Healthchecks
- Add Readarr custom service
- **ui:** Rework theming system, add new theme.
- Add missing notif for sonarr
- Add missing notif for radarr
- Add missing notif for lidarr
- **ci:** Remove debug flag
- Add Gotify custom service component (#706)
- **smartcard:** Simplify ping card
- **container:** Support timezone configuration
- **docker:** Skip assets install on permission error
- **ping:** Support for custom http success codes. Fix #425
- **cards:** Add multi link support
- **logs:** Get lighthttpd accesslog in docker logs
- **components:** Register Generic component globally
- **pihole:** Support Pi-hole v6 API with session management (#875)
- **smart-cards:** Handle dynamic loading error
- Inject package.json version into the app
- **auto-refresh:** Centralized auto refresh System
- **auto-refresh:** Add Transmission and docs
- Autoupdate support for adGuardHome
- Add autoupdate support for Emby
- Scheduler migration for netalertx
- **auth:** Implement Authelia integration, group policies and user session UI
- **services:** Integrate Adminer, Caddy, PostgreSQL and new modules

### 🚜 Refactor

- **layouts:** Remove duplicated code.
- **core:** Migrate to Pinia state and Composition API
- **ui:** Update global layout, error handling and base components
- **services:** Migrate 69+ existing services to Composition API


