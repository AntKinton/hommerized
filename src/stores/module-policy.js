import { defineStore } from 'pinia';
import { parse } from "yaml";

export const usePoliciesStore = defineStore('policies', {
  state: () => ({
    policies: null,
    enabled: true, // Master switch for filtering
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
    getFilteredServices: (state) => state.filteredServices,
    hasFilteredServices: (state) => state.filteredServices !== null,
    // Legacy getters for backward compatibility
    currentPolicies: (state) => state.policies,
    getPolicyGroupInfo: (state) => (groupName) => state.get(`groups.${groupName}`, null),
    getAllPolicyGroups: (state) => state.get('groups', {}),
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

      let filtered = services;

      // Apply policy filtering
      if (userGroups.length > 0) {
        console.log('🎯 PolicyStore: Filtering with user groups:', userGroups);
        filtered = filtered.map(group => {
          const filteredItems = group.items.filter(item => {
            const access = this.hasAccessToService(item.name, group.name, userGroups);
            if (!access) console.log(`🚫 PolicyStore: Access DENIED for ${item.name} in group ${group.name}`);
            return access;
          });

          if (filteredItems.length === 0) {
            console.log(`⚠️ PolicyStore: Group ${group.name} hidden because all items were filtered out.`);
            return null;
          }

          return {
            ...group,
            items: filteredItems
          };
        }).filter(group => group !== null);
      } else {
        console.log('🎯 PolicyStore: No user groups, allowing all services.');
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
      // If policy engine is disabled or no user groups, allow all
      if (!this.enabled || !this.policies || userGroups.length === 0) {
        return true; 
      }

      // Find policy for this service group
      const policyMapping = this.findPolicyForService(serviceName, groupName);
      
      // FALLBACK logic: If no specific policy is defined for this service/group,
      // we allow it by default (this corresponds to fallback: "allow" in config)
      if (!policyMapping) {
        // console.log(`ℹ️ PolicyStore: No policy for ${serviceName}, allowing by fallback.`);
        return true; 
      }

      const hasAccess = policyMapping.allowedGroups.includes('*') || 
                       userGroups.some(userGroup => policyMapping.allowedGroups.includes(userGroup));
      
      if (!hasAccess) {
        console.log(`🚫 PolicyStore: Access DENIED for ${serviceName}. Required: ${policyMapping.allowedGroups.join(', ')}. User has: ${userGroups.join(', ')}`);
      }

      return hasAccess;
    },

    findPolicyForService(serviceName, groupName) {
      if (!this.policies || !this.policies.servicePolicies) return null;

      // 1. Check O(1) specific policy index
      if (this._servicePolicyIndex && this._servicePolicyIndex.has(serviceName)) {
        return this._servicePolicyIndex.get(serviceName);
      }

      // 2. Search for policy by group mapping directly
      // Note: We use the group title as a key in the servicePolicies if no explicit mapping exists
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
