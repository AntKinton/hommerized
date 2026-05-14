import { defineStore } from 'pinia';
import { parse } from "yaml";

export const useModulesStore = defineStore('modules', {
  state: () => ({
    config: null,
    initialized: false,
  }),

  getters: {
    currentConfig: (state) => state.config,
    get: (state) => (path, defaultValue = null) => {
      if (!state.config) return defaultValue;
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
      }, state.config);
    },
    shouldShowUserName: (state) => state.config?.["header-additions"]?.showUserName || false,
    shouldShowUserGroups: (state) => state.config?.["header-additions"]?.showUserGroups || false,
    shouldShowLogoutButton: (state) => state.config?.["navbar-additions"]?.showLogoutButton || false,
    getLogoutEndpoint: (state) => state.config?.["navbar-additions"]?.logoutEndpoint || null,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;

      try {
        const modulesResponse = await fetch('/assets/config/module-extras.yml');
        if (modulesResponse.ok) {
          const modulesYamlText = await modulesResponse.text();
          this.config = parse(modulesYamlText);
        } else {
          this.config = this.getDefaultConfig();
        }
      } catch (error) {
        // Fallback silently without throwing to keep initialization fast
        this.config = this.getDefaultConfig();
      } finally {
        this.initialized = true;
      }
    },

    getDefaultConfig() {
      return {
        "header-additions": {
          showUserName: false,
          showUserGroups: false
        },
        "navbar-additions": {
          showLogoutButton: false,
          logoutEndpoint: null
        }
      };
    },
  }
});
