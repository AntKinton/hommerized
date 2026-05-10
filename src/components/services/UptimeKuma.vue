<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="status">
          {{ statusMessage }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ uptime }}&percnt;
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "UptimeKuma",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const incident = ref(null);
    const heartbeat = ref(null);

    const dashboard = computed(() => {
      return props.item.slug ? props.item.slug : "default";
    });

    const status = computed(() => {
      if (!incident.value) {
        return "";
      }
      return incident.value.incident.incident == null ? pageStatus.value : "bad";
    });

    const lastHeartBeatList = computed(() => {
      let result = {};

      for (let id in heartbeat.value.heartbeatList) {
        let index = heartbeat.value.heartbeatList[id].length - 1;
        result[id] = heartbeat.value.heartbeatList[id][index];
      }

      return result;
    });

    const pageStatus = computed(() => {
      if (!heartbeat.value) {
        return "";
      }
      if (Object.keys(heartbeat.value.heartbeatList).length === 0) {
        return "";
      }
      let result = "good";
      let hasUp = false;
      for (let id in lastHeartBeatList.value) {
        let beat = lastHeartBeatList.value[id];
        if (beat.status == 1) {
          hasUp = true;
        } else {
          result = "warn";
        }
      }
      if (!hasUp) {
        result = "bad";
      }
      return result;
    });

    const statusMessage = computed(() => {
      if (!incident.value) {
        return "";
      }
      if (incident.value.incident.incident) {
        return incident.value.incident.incident.title;
      }

      let message;
      switch (pageStatus.value) {
        case "good":
          message = "All Systems Operational";
          break;
        case "warn":
          message = "Partially Degraded Service";
          break;
        case "bad":
          message = "Degraded Service";
          break;
        default:
          message = "Unknown service status";
      }
      return message;
    });

    const uptime = computed(() => {
      if (!heartbeat.value) {
        return 0;
      }
      const data = Object.values(heartbeat.value.uptimeList);
      const percent = data.reduce((a, b) => a + b, 0) / data.length || 0;
      return (percent * 100).toFixed(1);
    });

    const fetchStatus = async () => {
      const now = Date.now();
      
      try {
        const resp = await fetch(`/api/status-page/${dashboard.value}?cachebust=${now}`);
        incident.value = resp;
      } catch (e) {
        console.error(e);
      }

      try {
        const hb = await fetch(`/api/status-page/heartbeat/${dashboard.value}?cachebust=${now}`);
        heartbeat.value = hb;
      } catch (e) {
        console.error(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      incident,
      heartbeat,
      dashboard,
      status,
      lastHeartBeatList,
      pageStatus,
      statusMessage,
      uptime,
      fetchStatus
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
