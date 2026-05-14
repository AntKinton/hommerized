<template>
  <a class="navbar-item" @click.prevent="toggleSetting()">
    <span class="icon mr-1">
      <i :class="['fas', 'fa-fw', currentIcon]"></i>
    </span>
    <slot></slot>
  </a>
</template>

<script>
import { computed } from 'vue';
import { useConfigStore } from '@/stores/module-config.js';

export default {
  name: "ToggleLayout",
  props: {
    // We can simplify props since the logic is now strictly for layout
    iconColumns: { type: String, default: 'fa-columns' },
    iconList: { type: String, default: 'fa-list' },
    iconGrid: { type: String, default: 'fa-table-cells-large' }
  },
  emits: ["updated"],
  setup(props, { emit }) {
    const configStore = useConfigStore();
    
    // Map layouts to their respective icons
    const currentIcon = computed(() => {
      const layout = configStore.config?.defaults?.layout;
      if (layout === 'list') return props.iconList;
      if (layout === 'grid') return props.iconGrid;
      return props.iconColumns;
    });

    const toggleSetting = () => {
      // Trigger the circular iteration in the store
      configStore.cycleLayoutMode();
      emit("updated", configStore.config.defaults.layout);
    };
    
    return {
      currentIcon,
      toggleSetting
    };
  }
};
</script>
