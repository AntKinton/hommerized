<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/copytoclipboard.js (data mapping logic)
  2. Load ActionCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/copytoclipboard.js and archetypes/ActionCard.vue -->
</template>

<script>
// This component is now just a placeholder for new architecture
// The real work is done by Service.vue + copytoclipboard.js + ActionCard.vue
export default {
  name: 'CopyToClipboard',
  props: {
    item: Object,
    proxy: String
  }
};
</script>
