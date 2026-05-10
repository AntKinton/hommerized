<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <i class="fa-solid fa-signal"></i> {{ up }}/{{ total }}
        <template v-if="avgRespTime > 0">
          <span class="separator"> | </span>
          <i class="fa-solid fa-stopwatch"></i> {{ formatDuration(avgRespTime / 1000) }} avg.
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status !== false" class="status" :class="status">
        {{ percentageGood }}&percnt;
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { formatDuration, formatPercentage } from "@/utils/formatters.js";
import { useService } from '@/composables/useService.js';

export default {
  name: "Gatus",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const up = ref(0);
    const down = ref(0);
    const total = ref(0);
    const avgRespTime = ref(NaN);
    const percentageGood = ref(NaN);
    const status = ref(false);
    const statusMessage = ref(false);

    const fetchStatus = async () => {
      try {
        let response = await fetch("/api/v1/endpoints/statuses", {
          method: "GET",
          cache: "no-cache",
        });

        // Apply filtering by groups, if defined
        if (props.item.groups) {
          response = response?.filter((job) => {
            return props.item.groups.includes(job.group) === true;
          });
        }

        // Initialise counts, avg times
        total.value = response.length;
        up.value = 0;

        let totalrestime = 0;
        let totalresults = 0;

        response.forEach((job) => {
          if (job.results[job.results.length - 1].success === true) {
            up.value++;
          }

          if (!props.item.hideaverages) {
            // Update array of average times
            let totalduration = 0;
            let rescounter = 0;
            job.results.forEach((res) => {
              totalduration += parseInt(res.duration, 10) / 1000000;
              rescounter++;
            });

            totalrestime += totalduration;
            totalresults += rescounter;
          } else {
            totalrestime = 0;
            totalresults = 1;
          }
        });

        // Rest are down
        down.value = total.value - up.value;

        // Calculate overall average response time
        avgRespTime.value = (totalrestime / totalresults).toFixed(2);

        // Status flag
        if (up.value == 0 && down.value == 0) {
          status.value = false;
        } else if (down.value == total.value) {
          status.value = "bad";
        } else if (up.value == total.value) {
          status.value = "good";
        } else {
          status.value = "warn";
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      up,
      down,
      total,
      avgRespTime,
      percentageGood,
      status,
      statusMessage,
      fetchStatus,
      formatDuration
    };
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  &.good:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }
  &.warn:before {
    background-color: #f8a306;
    border-color: #e1b35e;
    box-shadow: 0 0 5px 1px #f8a306;
  }
  &.bad:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }
  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
