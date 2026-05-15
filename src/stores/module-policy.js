import { defineStore } from 'pinia';
import { parse } from "yaml";

export const usePoliciesStore = defineStore('policies', {
  state: () => ({
    /** @type {PolicyConfig | null} */
    policies: null,
    enabled: true, // Master switch for filtering
    initialized: false,
    /** @type {ServiceGroup[] | null} */
    filteredServices: null,
    lastFilterHash: null,
    /** @type {Map<string, any> | null} */
    _servicePolicyIndex: null,
  }),

  getters: {
    isInitialized: (state) => state.initialized,
    getFilteredServices: (state) => state.filteredServices,
    hasFilteredServices: (state) => state.filteredServices !== null,
    // Legacy getters for backward compatibility
    currentPolicies: (state) => state.policies,
  },

  actions: {
    // Utility method moved to actions to avoid TS confusion with getters returning functions
    get(path, defaultValue = null) {
      if (!this.policies) return defaultValue;
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
      }, this.policies);
    },

    getPolicyGroupInfo(groupName) { 
      return this.get(`groups.${groupName}`, null); 
    },

    getAllPolicyGroups() { 
      return this.get('groups', {}); 
    },

    async initialize(policyFile = '/assets/config/policy-rules.yml') {
      if (this.initialized) return;

      // If no policy file provided, don't initialize - allow normal access
      if (!policyFile) {
        this.initialized = true;
        return;
      }

      try {
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
    },

    getDefaultPolicies() {
      return {
        groups: {
          all: { name: "All", description: "Allow all" }
        },
        servicePolicies: {
          default: { allowedGroups: ["*"], services: ["*"] }
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

      /** @type {ServiceGroup[]} */
      let filtered = services;

      // Apply policy filtering
      if (userGroups.length > 0) {
        filtered = filtered.map(group => {
          const filteredItems = group.items.filter(item => {
            const access = this.hasAccessToService(item.name, group.name, userGroups);
            return access;
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

      // Apply search filtering
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase().trim();
        filtered = filtered.map(group => {
          const filteredItems = group.items.filter(item => {
            const nameMatch = item.name?.toLowerCase().includes(term);
            const subtitleMatch = item.subtitle?.toLowerCase().includes(term);
            const descMatch = item.desc?.toLowerCase().includes(term);
            const tagMatch = item.tag?.toLowerCase().includes(term);
            const urlMatch = item.url?.toLowerCase().includes(term);

            return nameMatch || subtitleMatch || descMatch || tagMatch || urlMatch;
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
      // If policy engine is disabled or no user groups, allow all
      if (!this.enabled || !this.policies || userGroups.length === 0) {
        return true; 
      }

      // Find policy for this service group
      const policyMapping = this.findPolicyForService(serviceName, groupName);
      
      // FALLBACK logic: If no specific policy is defined for this service/group,
      // we allow it by default
      if (!policyMapping) {
        return true; 
      }

      const hasAccess = policyMapping.allowedGroups.includes('*') || 
                       userGroups.some(userGroup => policyMapping.allowedGroups.includes(userGroup));
      
      return hasAccess;
    },

    findPolicyForService(serviceName, groupName) {
      if (!this.policies || !this.policies.servicePolicies) return null;

      // 1. Check O(1) specific policy index
      if (this._servicePolicyIndex && this._servicePolicyIndex.has(serviceName)) {
        return this._servicePolicyIndex.get(serviceName);
      }

      // 2. Search for policy by group mapping directly
      if (groupName && this.policies.servicePolicies[groupName]) {
        return this.policies.servicePolicies[groupName];
      }

      // 3. Check for group mapping in the policies config
      if (groupName && this.policies.groupTitleMapping) {
        const policyMappingKey = this.policies.groupTitleMapping[groupName];
        if (policyMappingKey && this.policies.servicePolicies[policyMappingKey]) {
          return this.policies.servicePolicies[policyMappingKey];
        }
      }

      // 4. Fallback to generic wildcard/default policies if explicitly defined
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
