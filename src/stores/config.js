import { defineStore } from 'pinia';
import { parse } from "yaml";
import { defu } from "defu";

export const useConfigStore = defineStore('config', {
  // State: Equivalent to your reactive properties
  state: () => ({
    config: null,
    initialized: false,
  }),

  // Getters: Computed properties for the store
  getters: {
    currentConfig: (state) => state.config,
    // Safely get a specific value using path notation
    get: (state) => (path, defaultValue = null) => {
      if (!state.config) return defaultValue;
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
      }, state.config);
    }
  },

  // Actions: Methods that handle business logic and state changes
  actions: {
    async initialize() {
      if (this.initialized) return;

      try {
        // Load default configuration
        const { default: defaultConfig } = await import('../assets/defaults.yml?raw');
        const defaults = parse(defaultConfig);
        
        let config = {};
        
        // Load main configuration from assets
        try {
          const response = await fetch('/assets/config.yml');
          if (response.ok) {
            const yamlText = await response.text();
            config = parse(yamlText);
          }
        } catch (error) {
          console.log(error);
        }

        // Handle additional pages
        if (window.location.hash) {
          try {
            const pageName = window.location.hash.substring(1);
            const pageResponse = await fetch(`/assets/${pageName}.yml`);
            if (pageResponse.ok) {
              const pageYamlText = await pageResponse.text();
              const pageConfig = parse(pageYamlText);
              config = Object.assign(config, pageConfig);
            }
          } catch (error) {
            console.log(error);
          }
        }

        // Merge and update state using defu (user config takes priority)
        this.config = defu(config, defaults);
        this.initialized = true;
        
        // Set document title
        document.title =
          this.config.documentTitle ||
          [this.config.title, this.config.subtitle].filter(Boolean).join(" | ");

        // Load custom stylesheet if configured
        if (this.config.stylesheet) {
          let stylesheet = "";
          if (this.config.stylesheet.startsWith("http")) {
            stylesheet = this.config.stylesheet;
          } else {
            stylesheet = await fetch(this.config.stylesheet).then(res => res.text());
          }
          const style = document.createElement("style");
          style.innerHTML = stylesheet;
          document.head.appendChild(style);
        }

        //console.log('ConfigStore initialized');
        
      } catch (error) {
        console.error('Error initializing ConfigStore:', error);
        // Fallback to minimal default config on critical failure
        this.config = this.getDefaultConfig();
        this.initialized = true;
      }
    },

    async reload() {
      this.initialized = false;
      await this.initialize();
    },

    getDefaultConfig() {
      return {
        title: "Hommerized",
        subtitle: "Your Dashboard",
        columns: "3",
        connectivityCheck: true,
        groupPolicies: {
          enabled: false,
          showUserInfo: false,
          showLogoutItem: false
        }
      };
    }
  }
});
