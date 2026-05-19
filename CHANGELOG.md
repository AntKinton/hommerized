# Changelog

All notable changes to this project will be documented in this file.

## [26.05.6] - 2026-05-19

### ⚙️ Miscellaneous Tasks

- **git:** Ignore eslintcache and release script guide

### 🐛 Bug Fixes

- **pwa:** Ignore index.html in workbox caching to prevent caching stale resources

### 👽 Other Changes

- Fix(pwa) ignore index.html in workbox caching
- Feat(error) format ErrorDisplay and sticky header components
- Refactor(release) bump version to 26.05.6 across configs and docs
- Feat(navbar) implement production-grade mobile navbar transparency and glassmorphism

### 🚀 Features

- **error:** Format ErrorDisplay and sticky header components
- **navbar:** Implement production-grade mobile navbar transparency and glassmorphism

### 🚜 Refactor

- **release:** Bump version to 26.05.6 across configs and docs

## [26.05.5] - 2026-05-15

### ⚙️ Miscellaneous Tasks

- **release:** Update changelog for v26.05.4
- **deps:** Upgrade to latest bleeding edge versions and sync lockfile
- Sync with latest dev before selective hardening
- Merge TS infrastructure hardening into dev
- Sync with latest dev before selective hardening
- Merge normalized service adapters into dev
- Sync with latest dev before selective hardening
- Merge hardened policy store into dev
- Merge UI typing fixes into dev
- Merge final CI/CD fixes into dev
- Final pipeline stabilization
- Merge Dockerfile improvements into dev
- Apply GHCR description fix
- Apply final CI/CD and GHCR stabilization
- Major CI/CD upgrade to actions 2026 versions
- Final audit and synchronization of all CI/CD workflows
- **release:** Bump version and update assets for new feature set
- **release:** Prepare v26.05.5

### 🎨 Styling

- Apply automatic lint fixes
- **navbar:** Implement uniform mobile transparency and background inheritance
- **search:** Modernize search bar with integrated SVG and premium focus effects
- **navbar:** Group mobile action items and enhance search bar semantics in App.vue

### 🏗️ Continuous Integration

- **container:** Fix build failure and force Node.js 24
- **container:** Standardize stable dependency versions
- Force Node.js 24 globally across all workflows
- **container:** Fix __BASED_ON__ undefined error and format workflows

### 🐛 Bug Fixes

- **build:** Sync pnpm-lock.yaml with package.json version bump
- **ci:** Resolve Docker build failure and update GitHub Actions to Node.js 24
- **components:** Standardize service component templates and repair corruption
- **components:** Repair corrupted OctoPrint and HyperHDR components
- **core:** Remove unused code and imports
- Resolve UI template typing errors and restore search functionality
- Final lint cleanup and CI/CD compatibility improvements
- Resolve syntax error in module-extras and perfect ESLint rules
- Standardize Dockerfile OCI labels and metadata
- Ensure image description is propagated to manifest index annotations
- Resolve GHCR description via index annotations and force Node 24
- Resolve GHCR description via index annotations and force Node 24
- Final OCI-compliant metadata stabilization for GHCR
- Return to stable Docker V2 manifest format for container metadata
- **ui:** Harden showUserInfo visibility to prevent race conditions
- **config:** Correct plural naming in module-extras sample
- **policy:** Refine search logic to include URLs and subtitles while removing logo noise

### 👽 Other Changes

- **services:** Fix template and lint errors in service components
- **core:** Fix lint errors in App.vue
- **layout:** Remove unused imports in GroupServices.vue
- Infrastructure hardening and configuration stabilization
- Global type definitions and eslint standardization
- Service components template cleanup and repair
- Infrastructure hardening and configuration stabilization
- Global type definitions and eslint standardization
- Service components template cleanup and repair
- Adapter loading normalization and missing migrations
- Repair remaining corrupted service components
- Fix missing imports in service adapters
- Cleanup unused code and imports
- Normalize service adapters and core cleanup
- Implement strict linting and modern TS configuration
- Implement strict linting and modern TS configuration (including auto-fixes)
- Harden showUserInfo visibility and race condition protection
- Fix plural naming in module-extras sample
- Implement configurable auth service and development mock system (resolving conflicts)
- Integrate configurable auth service for a better accuracy on visual tests
- Implement mobile navbar transparency and glassmorphism
- Modernize search bar with integrated SVG and premium focus effects
- Implement Proposal 3 search-first mobile layout

### 📦 Dependencies

- **deps:** Add @types/node for infrastructure stabilization

### 🚀 Features

- **ui:** Implement smooth mobile navbar transparency with active state legibility
- **auth:** Implement configurable auth service and dev mock support
- **navbar:** Implement dynamic mobile transparency and theme integration
- **ui:** Implement smooth 1-step header collapse with dynamic ceiling and intent detection
- **ui:** Finalize smooth 1-step header collapse with optimized vertical symmetry and intent detection

### 🚜 Refactor

- **infra:** Stabilize TypeScript and Vite configuration
- **types:** Define global constants for TypeScript and ESLint
- **adapters:** Standardize adapter loading and complete missing migrations
- **adapters:** Add missing useService imports to service adapters
- **adapters:** Mass import useService and cleanup unused variables
- **lint:** Upgrade to typescript-eslint and implement strict flat config
- **dx:** Cleanup TS configuration and resolve linting warnings in stores
- Harden TS infrastructure and global fetch logic
- Normalize service adapters and resolve duplicate status helpers
- Harden policy store with strict types and optimized filtering actions

## [26.05.4] - 2026-05-14

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
- **config:** Ignore dev-dist directory
- **release:** Update changelog for v26.05.2
- **release:** Prepare v26.05.3
- **release:** Bump version to v26.05.4 and update config references
- **changelog:** Update for v26.05.4
- **config:** Update cliff template to hide sorting tags in changelog
- **config:** Remove vite .js config and ignore backup
- **config:** Setup typescript environment and configuration

### 🎨 Styling

- **ui:** Remove legacy SCSS, migrate to native Bulma, and update core layout components

### 🏗️ Continuous Integration

- **workflows:** Fix container write permissions and add dev branch to triggers
- **container:** Fix metadata and update changelog config

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
- **docker:** Update entrypoint and ignore rules for clean container builds
- **policy:** Handle disabled policies via module-extras and update defaults

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
- Add architecture blueprints and assets
- Modularize state management
- Implement dynamic service engine
- Cleanup UI and remove legacy components
- V26.05.2 architecture rework

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
- **core:** Add architecture blueprints and update PWA/branding assets
- **core:** Expand documentation for layout, policies, and podman deployment
- Update documentation, links and config schema for v26.05.4
- Consolidate documentation and assets refinement for v26.05.4

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
- **architecture:** Implement dynamic ServiceHandler, base adapters, and archetypes

### 🚜 Refactor

- **layouts:** Remove duplicated code.
- **core:** Migrate to Pinia state and Composition API
- **ui:** Update global layout, error handling and base components
- **services:** Migrate 69+ existing services to Composition API
- **state:** Modularize Pinia stores and update build config


