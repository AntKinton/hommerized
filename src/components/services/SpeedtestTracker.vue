<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="speedtest">
          <i class="fas fa-arrow-down"></i> {{ download }} Mbit/s |
          <i class="fas fa-arrow-up"></i> {{ upload }} Mbit/s |
          <i class="fas fa-stopwatch"></i> {{ ping }} ms
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "SpeedtestTracker",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const speedtest = ref(null);

    const download = computed(() => {
      return format(speedtest.value?.download);
    });

    const upload = computed(() => {
      return format(speedtest.value?.upload);
    });

    const ping = computed(() => {
      return format(speedtest.value?.ping);
    });

    const format = (value) => {
      return value ? parseFloat(value).toFixed(2) : "n/a";
    };

    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/speedtest/latest");
        speedtest.value = response.data;
      } catch (e) {
        console.log(e);
      }
    };

    fetchStatus();

    return {
      speedtest,
      download,
      upload,
      ping,
      fetchStatus
    };
  },
};
</script>
