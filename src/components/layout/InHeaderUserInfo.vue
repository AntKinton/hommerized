<template>
  <div v-if="shouldShow" class="field is-grouped is-align-items-center mt-2">
    <div class="control is-flex is-align-items-center">
      <span v-if="shouldShowName" class="icon is-small mr-2">
        <i class="fas fa-user"></i>
      </span>
      <span v-if="shouldShowName" class="has-text-weight-medium is-size-6 mr-1">{{ userInfo.name }}</span>
      <span v-if="shouldShowGroups" class="tag user-group-tag">
        {{ userInfo.groups.join(', ') }}
      </span>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "../../stores/module-auth.js";
import { useModulesStore } from "../../stores/module-extras.js";

export default {
  name: "InHeaderUserInfo",
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
        groups: this.authStore.groups
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

