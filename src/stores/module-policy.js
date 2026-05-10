import { defineStore } from 'pinia';
import { parse } from "yaml";

export const usePoliciesStore = defineStore('policies', {
  state: () => ({
    policies: null,
    initialized: false,
  }),

  getters: {
    currentPolicies: (state) => state.policies,
    isInitialized: (state) => state.initialized,
    getPolicyGroupInfo: (state) => (groupName) => {
      if (!state.policies || !state.policies.groups) {
        return null;
      }
      return state.policies.groups[groupName] || null;
    },
    getAllPolicyGroups: (state) => {
      if (!state.policies || !state.policies.groups) {
        return {};
      }
      return state.policies.groups;
    },
  },

  actions: {
    async initialize(policyFile = null) {
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

    async reloadPolicies() {
      this.initialized = false;
      await this.initialize();
    },
  }
});
