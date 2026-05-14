<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/dovecot.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/dovecot.js and archetypes/StatusCard.vue -->
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Dovecot",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const fetchOk = ref(null);
    const versionstring = ref(null);

    const status = computed(() => {
      return fetchOk.value ? "online" : "offline";
    });

    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/v1/server");
        fetchOk.value = true;
        versionstring.value = response.version || "Unknown";
      } catch (e) {
        fetchOk.value = false;
        console.log(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      fetchOk,
      versionstring,
      status,
      fetchStatus
    };
  },
};
</script>

