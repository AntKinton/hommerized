import { defineStore } from 'pinia';
import { getHeaders } from '../utils/headersHelper.js';

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

      try {
        // Call DOM/Headers once
        const headers = getHeaders();
        
        // Get auth data using the single headers object
        this.user = this.getAuthUser(headers);
        this.name = this.getAuthName(headers);
        this.groups = this.getAuthGroups(headers);

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
