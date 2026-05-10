<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="api"> {{ count }} {{ level }} alerts </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="api" class="status" :class="level">
        {{ count }}
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

const AlertsStatus = Object.freeze({
  firing: "firing",
  pending: "pending",
  inactive: "inactive",
});

export default {
  name: "Prometheus",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const api = ref({
      status: "",
      count: 0,
      alerts: {
        firing: 0,
        inactive: 0,
        pending: 0,
      },
    });

    const count = computed(() => {
      return (
        countFiring.value || countPending.value || countInactive.value || 0
      );
    });

    const level = computed(() => {
      if (countFiring.value) {
        return AlertsStatus.firing;
      } else if (countPending.value) {
        return AlertsStatus.pending;
      }
      return AlertsStatus.inactive;
    });

    const countFiring = computed(() => {
      if (api.value.data?.alerts) {
        return api.value.data.alerts.filter(
          (alert) => alert.state === AlertsStatus.firing,
        ).length;
      }
      return 0;
    });

    const countPending = computed(() => {
      if (api.value.data?.alerts) {
        return api.value.data.alerts.filter(
          (alert) => alert.state === AlertsStatus.pending,
        ).length;
      }
      return 0;
    });

    const countInactive = computed(() => {
      if (api.value.data?.alerts) {
        return api.value.data.alerts.filter(
          (alert) => alert.state === AlertsStatus.pending,
        ).length;
      }
      return 0;
    });

    const fetchStatus = async () => {
      try {
        api.value = await fetch("api/v1/alerts");
      } catch (e) {
        console.log(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      api,
      count,
      level,
      countFiring,
      countPending,
      countInactive,
      fetchStatus
    };
  },
};
</script>

<style scoped lang="scss">
.media-left {
  .image {
    display: flex;
    align-items: center;
  }

  img {
    max-height: 100%;
  }
}
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.firing:before {
    background-color: #d65c68;
    border-color: #e87d88;
    box-shadow: 0 0 5px 1px #d65c68;
  }

  &.pending:before {
    background-color: #e8bb7d;
    border-color: #d6a35c;
    box-shadow: 0 0 5px 1px #e8bb7d;
  }

  &.inactive:before {
    background-color: #8fe87d;
    border-color: #70d65c;
    box-shadow: 0 0 5px 1px #8fe87d;
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
