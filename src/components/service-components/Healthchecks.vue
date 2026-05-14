<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/healthchecks.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/healthchecks.js and archetypes/StatusCard.vue -->
</template>

<script>
// This component is now just a placeholder for the new architecture
// The real work is done by Service.vue + healthchecks.js + StatusCard.vue
export default {
  name: 'Healthchecks',
  props: {
    item: Object,
    proxy: String
  }
};
</script>
      
