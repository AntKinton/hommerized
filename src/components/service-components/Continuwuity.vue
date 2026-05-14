<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/continuwuity.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <!-- This component is now just a configuration wrapper -->
  <!-- All logic moved to adapters/continuwuity.js and archetypes/StatusCard.vue -->
</template>

<script>
// This component is now just a placeholder for new architecture
// The real work is done by Service.vue + continuwuity.js + StatusCard.vue
export default {
  name: 'Continuwuity',
  props: {
    item: Object,
    proxy: String
  }
};
</script>
      return fetchOk.value ? "online" : "offline";
    });

    const fetchStatus = async () => {
      try {
        const response = await fetch("/_matrix/client/versions");
        fetchOk.value = true;
        versionstring.value = response.versions?.continuwuity?.version || "Unknown";
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

