<template>
  <div id="app">
    <!-- Main layout wrapper -->
    <div class="app-layout-wrapper is-flex is-flex-direction-column">

      <!-- Header & Navigation -->
      <header v-if="configStore.currentConfig?.header" class="hero is-sticky"
        :class="{ 'is-collapsed-header': isHeaderCollapsed }">
        <div class="header-collapse-wrapper">
          <div class="hero-body pb-0 pt-5">
            <div class="container">
              <div class="is-flex is-align-items-center">
                <div v-if="configStore.currentConfig.logo || configStore.currentConfig.icon" class="mr-4">
                  <a v-if="configStore.currentConfig.logo" href="#">
                    <figure class="image is-64x64 is-flex is-align-items-center">
                      <img :src="configStore.currentConfig.logo" alt="dashboard logo" />
                    </figure>
                  </a>
                  <span v-else class="icon is-large">
                    <i class="fa-3x" :class="configStore.currentConfig.icon"></i>
                  </span>
                </div>

                <div>
                  <p class="heading is-size-6 mb-1">{{ configStore.currentConfig.subtitle }}</p>
                  <h1 class="title is-2 mb-2">{{ configStore.currentConfig.title }}</h1>
                  <InHeaderUserInfo v-if="showUserInfo" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-foot">
          <NavbarContainer :open="showMenu" :links="configStore.currentConfig.links" @navbar-toggle="toggleMenu">
            <ServiceBySearch class="nav-search-bar navbar-item is-inline-block-mobile" :hotkey="searchHotkey()"
              @search-focus="showMenu = true" />
            <div class="nav-actions-wrapper">
              <ToggleDarkMode class="nav-action-item" />
              <ToggleLayout class="nav-action-item" />
              <LogoutButton v-if="showLogoutButton" class="nav-action-item" />
            </div>
          </NavbarContainer>
        </div>
      </header>

      <!-- Main Content Area -->
      <main id="main-section" class="section">
        <div class="container">
          <ErrorDisplay v-if="initializationError" title="Initialization Error"
            :message="initializationError.message || 'Failed to load the dashboard.'"
            :details="initializationError.stack" size="medium" fullscreen @retry="retryInitialization" />
          <template v-else-if="loaded">
            <StatusService v-if="configStore.get('connectivityCheck')" @network-status-update="offline = $event" />
            <DefaultGetStarted v-if="!configStore.currentConfig" :config="configStore.currentConfig" />

            <div v-if="!offline" class="services-container">
              <MessageBox v-if="configStore.get('message')" :item="configStore.get('message')" class="mb-5" />
              <GroupServices />
            </div>

            <div v-else class="has-text-centered py-6">
              <span class="icon is-large has-text-grey-light mb-4">
                <i class="fas fa-3x fa-wifi-slash"></i>
              </span>
              <h2 class="title is-4">Currently Offline</h2>
              <p class="subtitle">Please check your network connection to access your services.</p>
            </div>

          </template>
        </div>
      </main>

      <!-- Global Footer -->
      <footer class="footer">
        <div class="container">
          <div v-if="configStore.get('footer')" class="content has-text-left" v-html="configStore.get('footer')"></div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { initAllStores, useConfigStore, useModulesStore, useAuthStore, usePoliciesStore } from '@/stores';
import StatusService from "./components/layout/StatusService.vue";
import ToggleLayout from "./components/utils/ToggleLayout.vue";
import ToggleDarkMode from "./components/utils/ToggleDarkMode.vue";

// import DynamicTheme from "./components/DynamicTheme.vue";
import InHeaderUserInfo from "./components/layout/InHeaderUserInfo.vue";
import NavbarContainer from "./components/layout/NavbarContainer.vue";
import ServiceBySearch from "./components/layout/ServiceBySearch.vue";
import LogoutButton from "./components/layout/LogoutButton.vue";
import DefaultGetStarted from "./components/layout/DefaultGetStarted.vue";
import MessageBox from "./components/layout/MessageBox.vue";
// import StatusLoading from "./components/layout/StatusLoading.vue";
import ErrorDisplay from "./components/layout/ErrorDisplay.vue";

export default {
  name: "App",
  components: {
    NavbarContainer,
    DefaultGetStarted,
    StatusService,
    MessageBox,
    ServiceBySearch,
    ToggleLayout,
    LogoutButton,
    ToggleDarkMode,
    //DynamicTheme,
    InHeaderUserInfo,
    // StatusLoading,
    ErrorDisplay,
  },
  setup() {
    const configStore = useConfigStore();
    const modulesStore = useModulesStore();
    const authStore = useAuthStore();
    const policiesStore = usePoliciesStore();

    return {
      configStore,
      modulesStore,
      authStore,
      policiesStore
    };
  },
  data: function () {
    return {
      loaded: false,
      initializing: true,
      initializationError: null,
      currentPage: null,
      modulesInitialized: false,
      authInitialized: false,
      offline: false,
      filter: "",
      showMenu: false,
      isHeaderCollapsed: false,
      lastScrollPosition: 0,
      minScrollSinceExpanded: 0, // Tracks the highest point (min scrollY) reached
      lastTouchY: 0,
      scrollLock: false,
    };
  },
  computed: {
    ...mapState(useConfigStore, {
      config: 'currentConfig'
    }),
    ...mapState(useModulesStore, {
      shouldShowUserName: 'shouldShowUserName',
      shouldShowUserGroups: 'shouldShowUserGroups',
      shouldShowLogoutButton: 'shouldShowLogoutButton',
      getLogoutEndpoint: 'getLogoutEndpoint'
    }),
    ...mapState(useAuthStore, {
      user: 'user',
      name: 'name',
      groups: 'groups'
    }),
    ...mapState(usePoliciesStore, {
      filteredServices: 'getFilteredServices'
    }),
    showUserInfo: function () {
      if (!this.modulesInitialized || !this.authInitialized) {
        return false;
      }

      return Boolean(this.user && (this.shouldShowUserName || this.shouldShowUserGroups));
    },
    showLogoutButton() {
      if (!this.modulesInitialized || !this.authInitialized) {
        return false;
      }
      return Boolean(this.shouldShowLogoutButton && this.user);
    },
    isDark() {
      const theme = this.configStore.get('defaults.colorTheme', 'auto');
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    // Layout mode based on config - columns = horizontal, list = vertical
    vlayout() {
      const layout = this.configStore.get('defaults.layout');
      if (layout === undefined) {
        return false; // Default to horizontal (columns)
      }
      return layout !== 'columns';
    },
    currentThemeName() {
      return this.configStore.get('theme', 'default');
    }
  },
  watch: {
    isDark: {
      immediate: true,
      handler() {
        this.configStore.applyTheme(this.configStore.get('defaults.colorTheme', 'auto'));
      }
    },
    currentThemeName: {
      immediate: true,
      handler(theme) {
        // Remove old theme classes and add new one
        const html = document.documentElement;
        Array.from(html.classList).forEach(c => {
          if (c.startsWith('theme-')) html.classList.remove(c);
        });
        if (theme && theme !== 'default') {
          html.classList.add(`theme-${theme}`);
        }
      }
    }
  },
  created: async function () {
    this.initializing = true;
    this.initializationError = null;

    try {
      // Initialize strictly in sequence to avoid race conditions
      // modulesStore depends on configStore, so initialize config first
      const startTime = performance.now();

      // Initialize config, policies, and extras in parallel using the central orchestrator
      const results = await initAllStores();

      // Check for critical initialization errors
      const errors = [];
      if (results.config.status === 'rejected') errors.push(results.config.reason);
      if (results.modules.status === 'rejected') {
        console.warn('Optional modules configuration failed to load');
      }

      if (errors.length > 0) {
        throw new Error(`Store initialization failed: ${errors.map(e => e.message).join(', ')}`);
      }

      this.modulesInitialized = true;
      this.authInitialized = true;

      // Validate essential state before building dashboard
      if (!this.configStore.currentConfig) {
        throw new Error('Essential configuration not loaded - cannot build dashboard');
      }

      // Build dashboard after all stores are ready and validated
      await this.buildDashboard();
      //window.onhashchange = this.buildDashboard;
      this.loaded = true;

      const endTime = performance.now();
      console.info(`Hommerized ${__APP_VERSION__} - Based on ${__BASED_ON__.name} (${__BASED_ON__.version}) - Initialized in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.initializationError = error;
      this.loaded = false;
    } finally {
      this.initializing = false;
    }
  },
  mounted() {
    // Capture phase true ensures we catch scroll events even if a child div is the one scrolling
    window.addEventListener('scroll', this.onScroll, true);
    // Intent detection for wheel and touch at the bottom
    window.addEventListener('wheel', this.onIntentAtBottom, { passive: true });
    window.addEventListener('touchmove', this.onIntentAtBottom, { passive: true });
    // Initialize the ceiling to the current position
    this.minScrollSinceExpanded = window.pageYOffset || document.documentElement.scrollTop || 0;
  },
  beforeUnmount() {
    window.onhashchange = null;
    window.removeEventListener('scroll', this.onScroll, true);
    window.removeEventListener('wheel', this.onIntentAtBottom);
    window.removeEventListener('touchmove', this.onIntentAtBottom);
  },
  methods: {
    retryInitialization() {
      window.location.reload();
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
      // Re-use our existing anti-flicker lock to ignore DOM layout jumps when the menu opens/closes
      this.lockScroll();
    },
    searchHotkey() {
      const hotkey = this.configStore.get('hotkey.search', 's');
      return typeof hotkey === 'string' ? hotkey : 's';
    },
    buildDashboard: function () {
      // Config is already loaded by configStore, just use it
      const config = this.configStore.currentConfig;

      // Initialize policiesStore with services from config
      if (config && config.services) {
        this.policiesStore.filterServices(config.services, this.authStore.groups);
      }
      // Document title is already set by configStore during initialization
    },
    onScroll(event) {
      if (this.scrollLock) return;

      let currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;

      if (event && event.target && event.target.scrollTop !== undefined) {
        if (event.target.scrollHeight > 500) {
          currentScrollPosition = Math.max(currentScrollPosition, event.target.scrollTop);
        }
      }

      if (currentScrollPosition < 0) return;

      const delta = currentScrollPosition - this.lastScrollPosition;

      // Force expansion at the very top
      if (currentScrollPosition < 50) {
        if (this.isHeaderCollapsed) {
          this.isHeaderCollapsed = false;
          this.lockScroll();
        }
        this.lastScrollPosition = currentScrollPosition;
        return;
      }

      if (delta > 0) {
        // Scrolling DOWN
        // Rule: Only collapse if we are far from top AND we have moved 
        // at least 150px DOWN from the highest point reached during expansion.
        const isFarFromTop = currentScrollPosition > 250;
        const netDownMovement = currentScrollPosition - this.minScrollSinceExpanded;

        if (isFarFromTop && netDownMovement > 150 && !this.isHeaderCollapsed) {
          this.isHeaderCollapsed = true;
          this.lockScroll();
        }
      } else if (delta < 0) {
        // Scrolling UP
        const isApproachingTop = currentScrollPosition < 150;
        const isIntentionalUp = Math.abs(delta) > 20;

        if ((isApproachingTop || isIntentionalUp) && this.isHeaderCollapsed) {
          this.isHeaderCollapsed = false;
          this.minScrollSinceExpanded = currentScrollPosition; // Reset ceiling
          this.lockScroll();
        } else if (!this.isHeaderCollapsed) {
          // If already expanded, update the "ceiling" if we reach a new high point
          this.minScrollSinceExpanded = Math.min(this.minScrollSinceExpanded, currentScrollPosition);
        }
      }

      this.lastScrollPosition = currentScrollPosition;
    },
    // Detect intent to scroll "past" the bottom to trigger collapse
    onIntentAtBottom(event) {
      if (this.scrollLock || this.isHeaderCollapsed) return;

      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
      // If we are within 40px of the bottom
      const isAtBottom = window.innerHeight + currentScrollPosition >= document.documentElement.scrollHeight - 40;

      if (isAtBottom) {
        let isScrollingDown = false;

        if (event.type === 'wheel') {
          isScrollingDown = event.deltaY > 0;
        } else if (event.type === 'touchmove' && event.touches.length > 0) {
          const touchY = event.touches[0].clientY;
          if (this.lastTouchY && this.lastTouchY > touchY + 10) { // Significant swipe up (content down)
            isScrollingDown = true;
          }
          this.lastTouchY = touchY;
        }

        if (isScrollingDown) {
          this.isHeaderCollapsed = true;
          this.lockScroll();
        }
      }
    },
    lockScroll() {
      this.scrollLock = true;
      setTimeout(() => {
        this.scrollLock = false;
        this.lastScrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
      }, 500); // 500ms is enough with the new anchor logic
    }
  },
};
</script>