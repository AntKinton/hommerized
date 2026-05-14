<template>
  <div class="card">
    <div class="card-content">
      <div class="media is-align-items-center mb-3">
        <div class="media-left">
          <figure v-if="item.logo" class="image is-48x48">
            <img :src="item.logo" :alt="item.name" />
          </figure>
          <span v-else-if="item.icon" class="icon is-medium has-text-primary">
            <i class="fas fa-2x" :class="item.icon"></i>
          </span>
        </div>
        <div class="media-content">
          <p class="title is-5 is-marginless">{{ item.name }}</p>
        </div>
      </div>

      <div class="status-container mt-4">
        <div class="is-flex is-align-items-center is-justify-content-center">
          <span class="icon is-large mr-3" :class="statusIconClass">
            <i class="fas fa-2x" :class="statusIcon"></i>
          </span>
          <div class="has-text-centered">
            <p class="title is-5 mb-1" :class="statusTextClass">{{ statusText }}</p>
            <p v-if="ping" class="is-size-6 has-text-grey">Ping: {{ ping }}ms</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'StatusCard',
  props: {
    item: Object,
    adapter: Object
  },
  setup(props) {
    const status = ref('unknown');
    const ping = ref(null);
    const isLoading = ref(false);

    const statusText = computed(() => {
      switch (status.value) {
        case 'active':
        case 'online': return 'Online';
        case 'idle': return 'Idle';
        case 'offline':
        case 'error': return 'Offline';
        case 'checking': return 'Checking...';
        default: return 'Unknown';
      }
    });

    const statusIcon = computed(() => {
      switch (status.value) {
        case 'active':
        case 'online': return 'fa-circle-check';
        case 'idle': return 'fa-pause-circle';
        case 'offline':
        case 'error': return 'fa-circle-xmark';
        case 'checking': return 'fa-circle-notch fa-spin';
        default: return 'fa-question-circle';
      }
    });

    const statusIconClass = computed(() => {
      switch (status.value) {
        case 'active':
        case 'online': return 'has-text-success';
        case 'idle': return 'has-text-warning';
        case 'offline':
        case 'error': return 'has-text-danger';
        case 'checking': return 'has-text-warning';
        default: return 'has-text-grey';
      }
    });

    const statusTextClass = computed(() => {
      switch (status.value) {
        case 'active':
        case 'online': return 'has-text-success';
        case 'idle': return 'has-text-warning';
        case 'offline':
        case 'error': return 'has-text-danger';
        case 'checking': return 'has-text-warning';
        default: return 'has-text-grey';
      }
    });

    onMounted(async () => {
      if (props.adapter && props.adapter.fetchData) {
        isLoading.value = true;
        try {
          const result = await props.adapter.fetchData(props.item);
          status.value = result.status || 'unknown';
          ping.value = result.ping;
        } catch (e) {
          console.error("Status check failed", e);
          status.value = 'error';
        } finally {
          isLoading.value = false;
        }
      }
    });

    return { 
      status, 
      ping, 
      isLoading,
      statusText,
      statusIcon,
      statusIconClass,
      statusTextClass
    };
  }
}
</script>
