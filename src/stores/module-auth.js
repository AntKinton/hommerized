import { defineStore } from 'pinia';
import { getHeaders } from '../utils/headersHelper.js';
import { useModulesStore } from './module-extras.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    name: null,
    groups: [],
    initialized: false,
  }),

  getters: {
    authInfo: (state) => ({
      user: state.user,
      name: state.name,
      groups: state.groups
    })
  },

  actions: {
    initialize() {
      if (this.initialized) return;

      const modulesStore = useModulesStore();
      
      // If auth is disabled globally in module-extras.yml, stop here
      if (!modulesStore.isAuthEnabled) {
        this.initialized = true;
        return;
      }

      try {
        // Call DOM/Headers once
        const headers = getHeaders();

        // Get auth data using the single headers object
        this.user = this.getAuthUser(headers);
        this.name = this.getAuthName(headers);
        this.groups = this.getAuthGroups(headers);

        // DEV MOCK: If on localhost and no user found, inject mock from config if enabled
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost && !this.user && modulesStore.shouldMockInDev) {
          const devUser = modulesStore.getDevUser;
          if (devUser) {
            console.info('AuthStore: Localhost detected. Injecting Dev Mock User from config.');
            this.user = devUser.user;
            this.name = devUser.name;
            this.groups = Array.isArray(devUser.groups) ? devUser.groups : [];
          }
        }

        this.initialized = true;
        //console.log(`AuthStore initialized - User: ${this.user}, Groups: ${this.groups.join(', ')}`);
      } catch (error) {
        console.error('Error initializing AuthStore:', error);
      }
    },

    getAuthUser(headers) {
      if (headers.user) return headers.user;

      return this.extractFromMeta('remote-user') ||
        localStorage.getItem('remote-user');
    },

    getAuthName(headers) {
      if (headers.name) return headers.name;

      return this.extractFromMeta('remote-name') ||
        localStorage.getItem('remote-name');
    },

    getAuthGroups(headers) {
      if (headers.groups && headers.groups.length > 0) {
        return headers.groups;
      }

      const devGroups = this.extractFromMeta('remote-groups') ||
        localStorage.getItem('remote-groups');

      return devGroups ? devGroups.split(',').map(g => g.trim()) : [];
    },

    extractFromMeta(metaName) {
      return document.querySelector(`meta[name="${metaName}"]`)?.getAttribute('content');
    }
  }
});
