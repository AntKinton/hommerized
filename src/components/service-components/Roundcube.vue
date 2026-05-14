<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/roundcube.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/roundcube.js and archetypes/StatusCard.vue -->
</template>

<script>
// This component is now just a placeholder for new architecture
// The real work is done by Service.vue + roundcube.js + StatusCard.vue
export default {
  name: 'Roundcube',
  props: {
    item: Object,
    proxy: String
  }
};
</script>
