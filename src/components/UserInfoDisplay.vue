<template>
  <div v-if="shouldShow" class="field is-grouped">
    <div v-if="shouldShowName" class="control">
      <span class="icon is-small">
        <i class="fas fa-user"></i>
      </span>
      {{ userInfo.name }}
    </div>
    <div v-if="shouldShowGroups" class="control">
      <span class="tag is-light is-info">
        {{ userInfo.groups.join(', ') }}
      </span>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "../stores/auth.js";
import { useModulesStore } from "../stores/modules.js";

export default {
  name: "UserInfoDisplay",
  setup() {
    const authStore = useAuthStore();
    const modulesStore = useModulesStore();
    
    return {
      authStore,
      modulesStore
    };
  },
  computed: {
    userInfo() {
      return {
        user: this.authStore.user,
        name: this.authStore.name,
        groups: this.authStore.groups,
        policies: this.authStore.policies
      };
    },
    shouldShow() {
      return this.authStore.user && (
        this.modulesStore.shouldShowUserName || 
        this.modulesStore.shouldShowUserGroups
      );
    },
    shouldShowName() {
      return this.modulesStore.shouldShowUserName && this.authStore.name;
    },
    shouldShowGroups() {
      return this.modulesStore.shouldShowUserGroups && this.authStore.groups?.length > 0;
    }
  }
};
</script>

<style scoped>
.user-info-display {
  display: inline-block;
}

.groups {
  font-size: 0.8em;
  opacity: 0.8;
}
</style>

<style>
/* Dark theme styles for badge */
body #app.dark .tag.is-light.is-info {
  background-color: #363636 !important; /* Mismo gris que message.is-dark */
  color: #ffffff !important; /* Fuente blanca */
  border: 1px solid #4a4a4a !important; /* Borde sutil */
}

body #app.dark .icon {
  color: var(--text-subtitle) !important;
}
</style>
