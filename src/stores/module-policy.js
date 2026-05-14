import { defineStore } from 'pinia';
import { parse } from "yaml";

export const usePoliciesStore = defineStore('policies', {
  state: () => ({
    policies: null,
    initialized: false,
    // Cached filtered services for performance
    filteredServices: null,
    lastFilterHash: null,
  }),

  getters: {
    isInitialized: (state) => state.initialized,
    // Safely get a specific policy value using path notation
    get: (state) => (path, defaultValue = null) => {
      console.log('🔍 PolicyStore.get() called with path:', path, 'state.policies:', state.policies);
      if (!state.policies) return defaultValue;
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
      }, state.policies);
    },
    getFilteredServices: (state) => {
      console.log('🎯 PolicyStore.getFilteredServices() called, returning:', state.filteredServices);
      return state.filteredServices;
    },
    // Legacy getters for backward compatibility - simplified using get()
    currentPolicies: (state) => state.policies,
    getPolicyGroupInfo: (state) => (groupName) => {
      return state.get(`groups.${groupName}`, null);
    },
    getAllPolicyGroups: (state) => {
      return state.get('groups', {});
    },
    // Performance-optimized getters
    getFilteredServices: (state) => state.filteredServices,
    hasFilteredServices: (state) => state.filteredServices !== null,
  },

  actions: {
    async initialize(policyFile = '/assets/config/policy-rules.yml') {
      if (this.initialized) return;

      // If no policy file provided, don't initialize - allow normal access
      if (!policyFile) {
        //console.log('No policy file provided - policies disabled, allowing normal access');
        this.initialized = true;
        return;
      }

      try {
        //console.log('Loading policies from:', policyFile);
        const response = await fetch(policyFile);
        if (response.ok) {
          const yamlText = await response.text();
          this.policies = parse(yamlText);
        } else {
          console.warn(`Policy file not found at ${policyFile}, using default access`);
          this.policies = this.getDefaultPolicies();
        }
      } catch (error) {
        console.warn('Error loading policy file:', error);
        this.policies = this.getDefaultPolicies();
      }

      this._buildPolicyIndex();
      this.initialized = true;
      //console.log('PoliciesStore initialized with restrictions');
    },

    getDefaultPolicies() {
      return {
        groups: {
          default: { name: "Default", description: "Default access" }
        },
        servicePolicies: {
          default: { allowedGroups: ["default"], services: ["*"] }
        }
      };
    },

    _buildPolicyIndex() {
      // Build an O(1) lookup map for service policies
      this._servicePolicyIndex = new Map();
      if (!this.policies || !this.policies.servicePolicies) return;

      Object.values(this.policies.servicePolicies).forEach(policy => {
        if (Array.isArray(policy.services)) {
          policy.services.forEach(service => {
            this._servicePolicyIndex.set(service, policy);
          });
        }
      });
    },

    updatePolicy(path, value) {
      if (!this.policies) return;
      
      const keys = path.split('.');
      let current = this.policies;
      
      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Set the value using Vue.set-like approach for reactivity
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;
    },

    // Performance-optimized filtering actions
    filterServices(services, userGroups = [], searchTerm = '') {
      if (!this.policies) {
        this.filteredServices = services;
        this.lastFilterHash = this.generateFilterHash(services, userGroups, searchTerm);
        return services;
      }

      // Generate hash to check if we need to recompute
      const currentHash = this.generateFilterHash(services, userGroups, searchTerm);
      if (this.lastFilterHash === currentHash && this.filteredServices) {
        return this.filteredServices; // Return cached result
      }

      let filtered = services;

      // Apply policy filtering
      if (userGroups.length > 0) {
        filtered = filtered.map(group => {
          const filteredItems = group.items.filter(item => 
            this.hasAccessToService(item.name, group.name, userGroups)
          );

          if (filteredItems.length === 0) {
            return null;
          }

          return {
            ...group,
            items: filteredItems
          };
        }).filter(group => group !== null);
      }

      // Apply search filtering
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.map(group => {
          const filteredItems = group.items.filter(item => {
            const nameMatch = item.name?.toLowerCase().includes(term);
            const descMatch = item.desc?.toLowerCase().includes(term);
            const tagMatch = item.tag?.toLowerCase().includes(term);
            const logoMatch = item.logo?.toLowerCase().includes(term);
            
            return nameMatch || descMatch || tagMatch || logoMatch;
          });

          if (filteredItems.length === 0) {
            return null;
          }

          return {
            ...group,
            items: filteredItems
          };
        }).filter(group => group !== null);
      }

      this.filteredServices = filtered;
      this.lastFilterHash = currentHash;
      return filtered;
    },

    hasAccessToService(serviceName, groupName, userGroups) {
      if (!this.policies || userGroups.length === 0) {
        return true; // No policies or groups = allow all
      }

      // Find policy for this service group
      const policyMapping = this.findPolicyForService(serviceName, groupName);
      if (!policyMapping) {
        return false;
      }

      // Check if user has access to mapped group
      return userGroups.some(userGroup => 
        policyMapping.allowedGroups.includes(userGroup)
      );
    },

    findPolicyForService(serviceName, groupName) {
      if (!this.policies || !this.policies.servicePolicies) return null;

      // 1. Check O(1) specific policy index
      if (this._servicePolicyIndex && this._servicePolicyIndex.has(serviceName)) {
        return this._servicePolicyIndex.get(serviceName);
      }

      // 2. Search for policy by group mapping directly (without expensive get() splits)
      if (groupName && this.policies.groupTitleMapping) {
        const policyMappingKey = this.policies.groupTitleMapping[groupName];
        if (policyMappingKey && this.policies.servicePolicies[policyMappingKey]) {
          return this.policies.servicePolicies[policyMappingKey];
        }
      }

      // 3. Fallback to generic wildcard/default policies if explicitly defined
      if (this._servicePolicyIndex && this._servicePolicyIndex.has('*')) {
        return this._servicePolicyIndex.get('*');
      }

      return null;
    },

    generateFilterHash(services, userGroups, searchTerm) {
      // Simple hash generation for caching
      return JSON.stringify({
        servicesCount: services.length,
        userGroups: userGroups.sort(),
        searchTerm: searchTerm.toLowerCase().trim()
      });
    },

    clearFilteredCache() {
      this.filteredServices = null;
      this.lastFilterHash = null;
    },

    async reloadPolicies() {
      this.initialized = false;
      this.clearFilteredCache();
      await this.initialize();
    },
  }
});
