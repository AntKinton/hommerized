<template>
  <a
    aria-label="Toggle dark mode"
    class="navbar-item"
    @click.prevent="toggleTheme()"
  >
    <span class="icon">
      <i :class="[currentIcon, 'fa-fw']" :title="currentTitle"></i>
    </span>
  </a>
</template>

<script>
import { computed } from 'vue';
import { useConfigStore } from '@/stores/module-config.js';

export default {
  name: "Darkmode",
  emits: ["updated"],
  setup(props, { emit }) {
    const configStore = useConfigStore();
    
    const faClasses = {
      auto: "fas fa-adjust",
      light: "fas fa-circle",
      dark: "far fa-circle"
    };
    
    const titles = {
      auto: "Auto-switch",
      light: "Light theme",
      dark: "Dark theme"
    };

    const currentTheme = computed(() => {
      const theme = configStore.config?.defaults?.colorTheme || 'auto';
      return ['auto', 'light', 'dark'].includes(theme) ? theme : 'auto';
    });

    const currentIcon = computed(() => faClasses[currentTheme.value]);
    const currentTitle = computed(() => titles[currentTheme.value]);

    const toggleTheme = () => {
      configStore.cycleColorTheme();
      emit("updated", configStore.config.defaults.colorTheme);
    };

    return {
      currentIcon,
      currentTitle,
      toggleTheme
    };
  }
};
</script>
