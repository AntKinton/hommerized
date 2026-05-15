<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/octoprint.js (data mapping logic)
  2. Load StatusCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <div />
</template>

<script>
// This component is now just a placeholder for the new architecture
// The real work is done by Service.vue + octoprint.js + StatusCard.vue
export default {
  name: 'OctoPrint',
  props: {
    item: Object,
    proxy: String
  },
  data() {
    return {
      printTime: '',
      printTimeLeft: '',
      completion: '',
      state: '',
      printer: '',
      error: '',
      display: '',
      statusClass: '',
      fetchAll: () => {},
      fetchStatus: () => {},
      fetchPrinterStatus: () => {},
      formatTime: (secs) => {
        const days = Math.floor(secs / (60 * 60 * 24));
        const hours = Math.floor((secs % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((secs % (60 * 60)) / 60);
        const formattedHrs = hours.toString().padStart(2, '0');
        const formattedMins = minutes.toString().padStart(2, '0');
        const formattedSecs = (secs % 60).toString().padStart(2, '0');

        if (days > 0) {
          return `${days}d ${formattedHrs}h ${formattedMins}m`;
        } else if (hours > 0) {
          return `${formattedHrs}h ${formattedMins}m ${formattedSecs}s`;
        } else if (minutes > 0) {
          return `${formattedMins}m ${formattedSecs}s`;
        } else {
          return `${secs} seconds`;
        }
        return `${secs} seconds`;
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchAll);

    // Initial data fetch
    fetchAll();

    return {
      printTime,
      printTimeLeft,
      completion,
      state,
      printer,
      error,
      display,
      statusClass,
      fetchAll,
      fetchStatus,
      fetchPrinterStatus,
      formatTime
    };
  },
};
</script>
