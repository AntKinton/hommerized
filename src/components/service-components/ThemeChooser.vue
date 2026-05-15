<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/themechooser.js (data mapping logic)
  2. Load ActionCard archetype (interactive controls)
  3. Connect adapter controls to ActionCard UI
-->

<template>
  <div />
</template>

<script>
// This component is now just a placeholder for new architecture
// The real work is done by Service.vue + themechooser.js + ActionCard.vue
export default {
  name: 'ThemeChooser',
  props: {
    item: Object,
    proxy: String
  }
};
</script>
