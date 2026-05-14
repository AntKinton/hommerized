<template>
  <a
    class="navbar-item"
    @click.prevent="handleLogout()"
  >
    <span class="icon mr-1"><i class="fas fa-sign-out-alt fa-fw"></i></span>
    <span>Logout</span>
  </a>
</template>

<script>
import { useModulesStore } from "../../stores/module-extras.js";

export default {
  name: "LogoutButton",
  setup() {
    const modulesStore = useModulesStore();
    
    return {
      modulesStore
    };
  },
  methods: {
    handleLogout() {
      try {
        // Clear authentication data from localStorage
        localStorage.removeItem('remote-user');
        localStorage.removeItem('remote-name');
        localStorage.removeItem('remote-groups');
        
        // Get logout endpoint from Pinia modules store (getter, not method)
        const logoutEndpoint = this.modulesStore?.getLogoutEndpoint;
        
        // Only redirect if logout endpoint is configured
        if (logoutEndpoint) {
          // Include redirect parameter to return to homer after login
          const returnUrl = encodeURIComponent(window.location.origin);
          window.location.href = `${logoutEndpoint}?rd=${returnUrl}`;
        } else {
          console.warn('Logout endpoint not configured');
          // Fallback: just reload the page to clear any session state
          window.location.reload();
        }
      } catch (error) {
        console.error('Error during logout:', error);
        // Fallback: reload the page
        window.location.reload();
      }
    }
  }
};
</script>
