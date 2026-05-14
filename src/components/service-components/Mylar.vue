<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/mylar.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/mylar.js and archetypes/StatusCard.vue -->
</template>

<script>
// This component is now just a placeholder for new architecture
// The real work is done by Service.vue + mylar.js + StatusCard.vue
export default {
  name: 'Mylar',
  props: {
    item: Object,
    proxy: String
  }
    fetchConfig();

    return {
      upcoming,
      wanted,
      warnings,
      errors,
      serverError,
      fetchConfig
    };
  },
};
</script>
