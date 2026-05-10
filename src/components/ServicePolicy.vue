<template>
  <div style="display: none;">
    <!-- Componente invisible - solo maneja filtrado de servicios -->
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth.js";
import { useModulesStore } from "../stores/modules.js";
import { usePoliciesStore } from "../stores/module-policy.js";

export default {
  name: "ServicePolicy",
  setup() {
    const authStore = useAuthStore();
    const modulesStore = useModulesStore();
    const policiesStore = usePoliciesStore();
    
    return {
      authStore,
      modulesStore,
      policiesStore
    };
  },
  methods: {
    /**
     * Initialize the filtering service
     */
    async initialize() {
      // Initialize auth store
      await this.authStore.initialize();
      
      // Wait for policiesStore to be initialized
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (this.policiesStore.isInitialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50); // Check every 50ms
      });
      
      //('ServicePolicy initialized with auth and policies');
    },
    /**
     * Filter services based on group policies and authentication
     */
    filterServices(services) {
      if (!this.policiesStore.currentPolicies) {
        return services; // No policies loaded = return all
      }
      
      if (!this.policiesStore.currentPolicies || this.authStore.groups.length === 0) {
        return services; // No policies or groups = no filtering
      }

      return services.map(group => {
        const filteredItems = group.items.filter(item => 
          this.hasAccessToService(item.name, group.name)
        );

        // Only include groups that have visible services
        if (filteredItems.length === 0) {
          return null;
        }

        return {
          ...group,
          items: filteredItems
        };
      }).filter(group => group !== null);
    },

    /**
     * Check if a user has access to a specific service
     */
    hasAccessToService(serviceName, groupName = null) {
      if (!this.policiesStore.currentPolicies || this.authStore.groups.length === 0) {
        return true; // No policies or groups = allow all
      }

      // Find policy for this service group
      const policyMapping = this.findPolicyForService(serviceName, groupName);
      if (!policyMapping) {
        return false;
      }

      // Check if user has access to the mapped group
      return this.authStore.groups.some(userGroup => 
        policyMapping.allowedGroups.includes(userGroup)
      );
    },

    /**
     * Search for policy for a specific service
     */
    findPolicyForService(serviceName, groupName) {
      if (!this.policiesStore.currentPolicies) return null;

      // Search for specific policy first
      const specificPolicy = Object.values(this.policiesStore.currentPolicies.servicePolicies).find(policy =>
        policy.services.includes(serviceName)
      );

      if (specificPolicy) {
        return specificPolicy;
      }

      // Search for policy by group
      if (groupName) {
        const policyMappingKey = this.policiesStore.currentPolicies.groupTitleMapping?.[`${groupName}|${this.authStore.groups[0]}`] ||
                              this.policiesStore.currentPolicies.groupTitleMapping?.[groupName];
        
        if (policyMappingKey) {
          return this.policiesStore.currentPolicies.servicePolicies[policyMappingKey];
        }
      }

      return null;
    },

    /**
     * Filter services by search term
     */
    filterBySearch(services, searchTerm) {
      if (!searchTerm || searchTerm.trim() === '') {
        return services;
      }

      const term = searchTerm.toLowerCase().trim();

      return services.map(group => {
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
    },

    /**
     * Filter services by multiple criteria (policies + search)
     */
    filterServicesByCriteria(services, searchTerm = '') {
      if (!this.policiesStore.currentPolicies) {
        return services;
      }

      // Apply group filtering first
      const groupFilteredServices = this.filterServices(services);
      
      // Then apply search filtering
      if (searchTerm) {
        return this.filterBySearch(groupFilteredServices, searchTerm);
      }
      
      return groupFilteredServices;
    },

    /**
     * Get service statistics
     */
    getServiceStats(services) {
      if (!this.policiesStore.currentPolicies) {
        return {
          total: services.reduce((acc, group) => acc + group.items.length, 0),
          visible: services.reduce((acc, group) => acc + group.items.length, 0),
          hidden: 0,
          groups: services.length,
          visibleGroups: services.length
        };
      }

      const filteredServices = this.filterServices(services);
      
      let totalServices = 0;
      let visibleServices = 0;
      
      services.forEach(group => {
        totalServices += group.items.length;
      });
      
      filteredServices.forEach(group => {
        visibleServices += group.items.length;
      });
      
      return {
        total: totalServices,
        visible: visibleServices,
        hidden: totalServices - visibleServices,
        groups: services.length,
        visibleGroups: filteredServices.length
      };
    },

    /**
     * Get user info combining auth and policies data
     */
    getUserInfo() {
      return {
        user: this.authStore.user,
        groups: this.authStore.groups,
        policies: this.policiesStore.currentPolicies,
        groupPolicies: this.modulesStore.getGroupPoliciesConfig
      };
    }
  }
};
</script>
