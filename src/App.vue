<template>
  <div
    v-if="config"
    id="app"
    :class="[
      `theme-${config.theme}`,
      `page-${currentPage}`,
      isDark ? 'dark' : 'light',
      !config.footer ? 'no-footer' : '',
      config.footer ? 'has-footer' : '',
    ]"
    :style="getDynamicStyles()"
  >
    <!-- DynamicTheme component -->
    <DynamicTheme v-if="config.colors" :themes="config.colors" />
    <div id="bighead">
      <section v-if="config.header" class="first-line">
        <div v-cloak class="container">
          <div class="logo">
            <a href="#">
              <img v-if="config.logo" :src="config.logo" alt="dashboard logo" />
            </a>
            <i v-if="config.icon" :class="config.icon"></i>
          </div>
          <div class="dashboard-title">
            <span class="headline">{{ config.subtitle }}</span>
            <h1>{{ config.title }}</h1>
            <UserInfoDisplay v-if="showUserInfo" />
          </div>
        </div>
      </section>

      <Navbar
        :open="showMenu"
        :links="config.links"
        @navbar-toggle="showMenu = !showMenu"
      >
        <DarkMode
          :default-value="config.defaults.colorTheme"
          @updated="isDark = $event"
        />

        <SettingToggle
          name="vlayout"
          icon="fa-list"
          icon-alt="fa-columns"
          :default-value="config.defaults.layout == 'columns'"
          @updated="vlayout = $event"
        />

        <SearchInput
          class="navbar-item is-inline-block-mobile"
          :hotkey="searchHotkey()"
          @input="filterServices($event)"
          @search-focus="showMenu = true"
          @search-open="navigateToFirstService"
          @search-cancel="filterServices()"
        />

        <LogoutItem v-if="showLogoutItem" />
      </Navbar>
    </div>
    <section id="main-section" class="section">
      <div v-cloak class="container">
        <!-- Loading state -->
        <Loader 
          v-if="initializing" 
          message="Loading dashboard..."
          details="Initializing configuration and services..."
          size="medium"
          fullscreen
        />

        <!-- Error state -->
        <ErrorDisplay 
          v-else-if="initializationError"
          title="Initialization Error"
          :message="initializationError.message || 'Failed to load the dashboard. Please check your configuration and try refreshing the page.'"
          :details="initializationError.stack"
          size="medium"
          fullscreen
          @retry="retryInitialization"
        />

        <!-- Normal state -->
        <template v-else>
          <ConnectivityChecker
            v-if="config.connectivityCheck"
            @network-status-update="offline = $event"
          />

          <GetStarted v-if="!config" :config="config" />

          <div v-if="!offline">
          <!-- Optional messages -->
          <Message :item="config.message" />

          <!-- Unified layout -->
          <div
            :class="[
              'columns',
              'is-multiline',
              { 'layout-vertical': vlayout && !filter },
            ]"
          >
            <AsyncServiceGroup
              v-for="(group, groupIndex) in services"
              :key="`${currentPage}-${groupIndex}`"
              :group="group"
              :is-vertical="vlayout && !filter"
              :proxy="config.proxy"
              :columns="config.columns"
              :group-index="groupIndex"
            />
          </div>
        </div>
        </template>
      </div>
    </section>

    <footer class="footer">
      <div class="container">
        <div
          v-if="config.footer"
          class="content has-text-centered"
          v-html="config.footer"
        ></div>
        <!-- Filtering Service component for service filtering -->
        <ServicePolicy ref="filteringService" />
      </div>
    </footer>
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { useConfigStore } from '@/stores/config.js';
import { useModulesStore } from '@/stores/modules.js';
import { useAuthStore } from '@/stores/auth.js';
import ConnectivityChecker from "./components/ConnectivityChecker.vue";
import SettingToggle from "./components/SettingToggle.vue";
import ServicePolicy from "./components/ServicePolicy.vue";

import DynamicTheme from "./components/DynamicTheme.vue";
import UserInfoDisplay from "./components/UserInfoDisplay.vue";
import Navbar from "./components/Navbar.vue";
import DarkMode from "./components/DarkMode.vue";
import SearchInput from "./components/SearchInput.vue";
import LogoutItem from "./components/LogoutItem.vue";
import GetStarted from "./components/GetStarted.vue";
import Message from "./components/Message.vue";
import Loader from "./components/Loader.vue";
import ErrorDisplay from "./components/ErrorDisplay.vue";
import AsyncServiceGroup from "./components/AsyncServiceGroup.vue";

export default {
  name: "App",
  components: {
    Navbar,
    GetStarted,
    ConnectivityChecker,
    AsyncServiceGroup,
    Message,
    SearchInput,
    SettingToggle,
    LogoutItem,
    DarkMode,
    DynamicTheme,
    ServicePolicy,
    UserInfoDisplay,
    Loader,
    ErrorDisplay,
  },
  setup() {
    const configStore = useConfigStore();
    const modulesStore = useModulesStore();
    const authStore = useAuthStore();
    
    return {
      configStore,
      modulesStore,
      authStore
    };
  },
  data: function () {
    return {
      loaded: false,
      initializing: false,
      initializationError: null,
      currentPage: null,
      services: null,
      offline: false,
      filter: "",
      vlayout: true,
      isDark: null,
      showMenu: false,
    };
  },
  computed: {
    ...mapState(useConfigStore, {
      config: 'currentConfig'
    }),
    ...mapState(useModulesStore, {
      modulesInitialized: 'initialized',
      shouldShowUserName: 'shouldShowUserName',
      shouldShowUserGroups: 'shouldShowUserGroups',
      shouldShowLogoutItem: 'shouldShowLogoutItem'
    }),
    ...mapState(useAuthStore, {
      authInitialized: 'initialized',
      authUser: 'user'
    }),
    
    // Computed properties that depend on multiple stores
    showUserInfo() {
      // Only show if stores are initialized and conditions are met
      if (!this.modulesInitialized || !this.authInitialized) {
        return false;
      }
      return (this.shouldShowUserName || this.shouldShowUserGroups) && this.authUser;
    },
    showLogoutItem() {
      // Only show if stores are initialized and conditions are met
      if (!this.modulesInitialized || !this.authInitialized) {
        return false;
      }
      return Boolean(this.shouldShowLogoutItem && this.authUser);
    },
  },
  created: async function () {
    this.initializing = true;
    this.initializationError = null;
    
    try {
      // Initialize strictly in sequence to avoid race conditions
      // modulesStore depends on configStore, so initialize config first
      const startTime = performance.now();
      
      // Initialize config first to ensure base configuration is available
      await this.configStore.initialize();
      
      // Only initialize modules and auth after config is guaranteed to be ready
      const [modulesResult, authResult] = await Promise.allSettled([
        this.modulesStore.initialize(),
        this.authStore.initialize()
      ]);
      
      // Check for any initialization errors from modules and auth
      const errors = [];
      if (modulesResult.status === 'rejected') errors.push(modulesResult.reason);
      if (authResult.status === 'rejected') errors.push(authResult.reason);
      
      if (errors.length > 0) {
        throw new Error(`Store initialization failed: ${errors.map(e => e.message).join(', ')}`);
      }
      
      // Validate essential state before building dashboard
      if (!this.configStore.currentConfig) {
        throw new Error('Essential configuration not loaded - cannot build dashboard');
      }
      
      // Build dashboard after all stores are ready and validated
      await this.buildDashboard();
      window.onhashchange = this.buildDashboard;
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
  beforeUnmount() {
    window.onhashchange = null;
  },
  methods: {
    searchHotkey() {
      return this.configStore.get('hotkey.search');
    },
    buildDashboard: function () {
      // Config is already loaded by configStore, just use it
      const config = this.configStore.currentConfig;
      
      // Cache frequently accessed values
      const groupPoliciesEnabled = this.modulesStore.isGroupPoliciesEnabled;
      const filteringService = this.$refs.filteringService;
      
      // Apply group filtering if enabled (synchronous operation)
      if (groupPoliciesEnabled && filteringService) {
        this.services = filteringService.filterServices(config.services);
      } else {
        this.services = config.services;
      }

      // Document title is already set by configStore during initialization
    },
    matchesFilter: function (item) {
      const needle = this.filter?.toLowerCase();
      return (
        item.name.toLowerCase().includes(needle) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(needle)) ||
        (item.tag && item.tag.toLowerCase().includes(needle)) ||
        (item.keywords && item.keywords.toLowerCase().includes(needle))
      );
    },
    navigateToFirstService: function (target) {
      try {
        const service = this.services[0].items[0];
        window.open(service.url, target || service.target || "_self");
      } catch {
        console.warn("fail to open service");
      }
    },
    filterServices: function (filter) {
      this.filter = filter;

      // Get base services (with policy filtering if enabled)
      const baseServices = (this.modulesStore.isGroupPoliciesEnabled && this.$refs.filteringService) 
        ? this.$refs.filteringService.filterServices(this.config.services)
        : this.config.services;

      if (!filter) {
        this.services = baseServices;
        return;
      }

      // Apply search filtering
      const searchResultItems = [];
      for (const group of baseServices) {
        if (group.items !== null) {
          for (const item of group.items) {
            if (this.matchesFilter(item)) {
              searchResultItems.push(item);
            }
          }
        }
      }

      this.services = [
        {
          name: filter,
          icon: "fas fa-search",
          items: searchResultItems,
        },
      ];
    },
    handleErrors: function (title, content) {
      return {
        message: {
          title: title,
          style: "is-danger",
          content: content,
        },
      };
    },
    getDynamicStyles: function() {
      // Use CSS variables instead of DOM manipulation
      const styles = {};
      
      // Example: Add theme colors as CSS variables if needed
      if (this.config?.colors) {
        Object.entries(this.config.colors).forEach(([key, value]) => {
          styles[`--color-${key}`] = value;
        });
      }
      
      return styles;
    },
    retryInitialization: async function() {
      this.initializing = true;
      this.initializationError = null;
      
      try {
        const startTime = performance.now();
        
        // Sequential initialization to avoid race conditions
        // modulesStore depends on configStore, so initialize config first
        await this.configStore.initialize();
        
        // Initialize both modules and auth stores in parallel
        const [modulesResult, authResult] = await Promise.allSettled([
          this.modulesStore.initialize(),
          this.authStore.initialize() 
        ]);
        
        // Check for any initialization errors from modules and auth
        const errors = [];
        if (modulesResult.status === 'rejected') errors.push(modulesResult.reason);
        if (authResult.status === 'rejected') errors.push(authResult.reason);
        
        if (errors.length > 0) {
          throw new Error(`Store initialization failed: ${errors.map(e => e.message).join(', ')}`);
        }
        
        // Validate essential state before building dashboard
        if (!this.configStore.currentConfig) {
          throw new Error('Essential configuration not loaded - cannot build dashboard');
        }
        
        this.buildDashboard();
        this.loaded = true;
        
        const endTime = performance.now();
        console.info(`Hommerized ${__APP_VERSION__} - Based on ${__BASED_ON__.name} (${__BASED_ON__.version}) - Retry successful in ${(endTime - startTime).toFixed(2)}ms`);
      } catch (error) {
        console.error('Failed to initialize application on retry:', error);
        this.initializationError = error;
        this.loaded = false;
      } finally {
        this.initializing = false;
      }
    },
  },
};
</script>
