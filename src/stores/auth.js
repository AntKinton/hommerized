import { defineStore } from 'pinia';

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
    async initialize() {
      if (this.initialized) return;

      try {
        // Import headers helper dynamically
        const { getHeaders } = await import('../utils/headersHelper.js');

        // Get auth data
        this.user = this.getAuthUser(getHeaders);
        this.name = this.getAuthName(getHeaders);
        this.groups = this.getAuthGroups(getHeaders);

        this.initialized = true;
        //console.log(`AuthStore initialized - User: ${this.user}, Groups: ${this.groups.join(', ')}`);
      } catch (error) {
        console.error('Error initializing AuthStore:', error);
      }
    },

    getAuthUser(getHeaders) {
      const headers = getHeaders();
      if (headers.user) return headers.user;

      return this.extractFromMeta('remote-user') || 
             localStorage.getItem('remote-user');
    },

    getAuthName(getHeaders) {
      const headers = getHeaders();
      if (headers.name) return headers.name;

      return this.extractFromMeta('remote-name') || 
             localStorage.getItem('remote-name');
    },

    getAuthGroups(getHeaders) {
      const headers = getHeaders();
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
