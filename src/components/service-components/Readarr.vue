<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/readarr.js (data mapping logic)
  2. Load MediaCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/readarr.js and archetypes/MediaCard.vue -->
</template>

<script>
// This component is now just a placeholder for the new architecture
// The real work is done by Service.vue + readarr.js + MediaCard.vue
export default {
  name: 'Readarr',
  props: {
    item: Object,
    proxy: String
  }
};
</script>
