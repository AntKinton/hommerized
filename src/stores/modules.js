import { defineStore } from 'pinia';
import { parse } from "yaml";
import { usePoliciesStore } from "./module-policy.js";

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
    isGroupPoliciesEnabled: (state) => state.config?.groupsPolicy?.enabled || false,
    shouldShowUserInfo: (state) => state.config?.groupsPolicy?.showUserInfo || false,
    shouldShowLogoutItem: (state) => state.config?.["navbar-additions"]?.showLogoutItem || false,
    shouldShowUserName: (state) => state.config?.["header-additions"]?.showUserName || false,
    shouldShowUserGroups: (state) => state.config?.["header-additions"]?.showUserGroups || false,
    getGroupPoliciesConfig: (state) => state.config?.groupsPolicy || {
      enabled: false,
      policyFile: "/assets/config/policy-rules.yml",
      fallback: "allow"
    },
    getLogoutEndpoint: (state) => state.config?.["navbar-additions"]?.logoutEndpoint || null,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;

      try {
        // Load enhanced modules configuration
        let modulesConfig = {};
        try {
          const modulesResponse = await fetch('/assets/modules.yml');
          if (modulesResponse.ok) {
            const modulesYamlText = await modulesResponse.text();
            modulesConfig = parse(modulesYamlText);
            //console.log('Modules configuration loaded');
          }
        } catch {
          //console.log('Modules configuration not found, using defaults');
        }

        // Store configuration
        this.config = modulesConfig;
        
        // Initialize policies store with policy file if groupsPolicy is enabled
        const policyFile = this.config?.groupsPolicy?.enabled ? this.config?.groupsPolicy?.policyFile : null;
        const policiesStore = usePoliciesStore();
        await policiesStore.initialize(policyFile);
        
        this.initialized = true;
        
      } catch (error) {
        console.error('Error initializing ModulesStore:', error);
        this.config = this.getDefaultConfig();
        this.initialized = true;
      }
    },

    getDefaultConfig() {
      return {
        groupsPolicy: {
          enabled: false,
          policyFile: "/assets/config/policy-rules.yml",
          fallback: "allow"
        },
        "header-additions": {
          showUserName: false,
          showUserGroups: false
        },
        "navbar-additions": {
          showLogoutItem: false,
          logoutEndpoint: null
        }
      };
    },

    // Get policies store (exclusive access)
    getPoliciesStore() {
      return usePoliciesStore();
    },
  }
});
