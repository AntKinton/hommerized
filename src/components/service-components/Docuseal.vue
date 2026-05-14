<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/docuseal.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/docuseal.js and archetypes/StatusCard.vue -->
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Docuseal",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const status = ref(null);
    const versionstring = ref(null);

    const fetchStatus = async () => {
      const params = {
        cache: "no-cache",
      };
      try {
        const response = await fetch("/version", params, false);
        status.value = "online";
        versionstring.value = response;
      } catch (e) {
        status.value = "offline";
        console.log(e);
      }
    };

    fetchStatus();

    return {
      status,
      versionstring,
      fetchStatus
    };
  },
};
</script>

