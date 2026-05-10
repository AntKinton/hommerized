<template>
  <Generic :item="item" :title="state">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle && !state">
          {{ item.subtitle }}
        </template>
        <template
          v-if="!error && display == 'text' && statusClass == 'in-progress'"
        >
          <i class="fa-solid fa-gear mr-1"></i>
          <b v-if="completion">{{ completion.toFixed() }}%</b>
          <span class="separator mx-1"> | </span>
          <span v-if="printTime" :title="`${formatTime(printTimeLeft)} left`">
            <i class="fa-solid fa-stopwatch mr-1"></i>
            {{ formatTime(printTime) }}
          </span>
        </template>
        <template v-if="!error && display == 'text' && statusClass == 'ready'">
          <i class="fa-solid fa-temperature-half mr-1"></i>
          <b v-if="printer.temperature.bed"
            >{{ printer.temperature.bed.actual.toFixed() }} C</b
          >
          <span class="separator mx-1"> | </span>
          <b v-if="printer.temperature.tool0"
            >{{ printer.temperature.tool0.actual.toFixed() }} C</b
          >
        </template>
        <template v-if="!error && display == 'bar'">
          <progress
            v-if="completion"
            class="progress is-primary"
            :value="completion"
            max="100"
            :title="`${state} - ${completion.toFixed()}%, ${formatTime(
              printTimeLeft,
            )} left`"
          >
            {{ completion }}%
          </progress>
        </template>
        <span v-if="error" :title="error">{{ error }}</span>
      </p>
    </template>
    <template #indicator>
      <i :class="['status', statusClass]" :title="state"></i>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "OctoPrint",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const printTime = ref(null);
    const printTimeLeft = ref(null);
    const completion = ref(null);
    const state = ref(null);
    const printer = ref(null);
    const error = ref(null);
    const display = ref(props.item.display == "bar" ? props.item.display : "text");

    const statusClass = computed(() => {
      switch (state.value) {
        case "Operational":
          return "ready";
        case "Offline":
          return "offline";
        case "Printing":
          return "in-progress";
        default:
          return "pending";
      }
    });

    const fetchAll = async () => {
      await fetchPrinterStatus();
      await fetchStatus();
    };

    const fetchStatus = async () => {
      try {
        const response = await fetch(`api/job?apikey=${props.item.apikey}`);
        printTime.value = response.progress.printTime;
        printTimeLeft.value = response.progress.printTimeLeft;
        completion.value = response.progress.completion;
        state.value = response.state;
        error.value = response.error;
      } catch (e) {
        error.value = `Fail to fetch octoprint data (${e.message})`;
        console.error(e);
      }
    };

    const fetchPrinterStatus = async () => {
      try {
        const response = await fetch(
          `api/printer?apikey=${props.item.apikey}`,
        );
        printer.value = response;
        error.value = response.error;
      } catch (e) {
        error.value = `Fail to fetch octoprint data (${e.message})`;
        console.error(e);
      }
    };

    const formatTime = (seconds) => {
      const days = Math.floor(seconds / 86400);
      let remainingSeconds = seconds % 86400;
      const hours = Math.floor(remainingSeconds / 3600);
      remainingSeconds %= 3600;
      const minutes = Math.floor(remainingSeconds / 60);
      const secs = remainingSeconds % 60;

      const formattedHrs = hours.toString().padStart(2, "0");
      const formattedMins = minutes.toString().padStart(2, "0");
      const formattedSecs = secs.toString().padStart(2, "0");

      if (days > 0) {
        return `${days}d ${formattedHrs}h ${formattedMins}m`;
      } else if (hours > 0) {
        return `${formattedHrs}h ${formattedMins}m ${formattedSecs}s`;
      } else if (minutes > 0) {
        return `${formattedMins}m ${formattedSecs}s`;
      } else {
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

<style scoped lang="scss">
.fa-triangle-exclamation::before {
  color: #d65c68;
}

.progress {
  height: 8px;
  width: 90%;
}
</style>
