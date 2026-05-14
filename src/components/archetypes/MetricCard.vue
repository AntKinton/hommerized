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

      <div v-if="metrics" class="metrics-container mt-4">
        <div v-for="(metric, idx) in metrics" :key="idx" class="mb-2">
          <div class="is-flex is-justify-content-space-between is-size-7 mb-1">
            <span class="has-text-grey">{{ metric.label }}</span>
            <span class="has-text-weight-bold">{{ metric.value }}</span>
          </div>
          <progress 
            v-if="metric.percentage !== undefined"
            class="progress is-small" 
            :class="metric.color || 'is-primary'"
            :value="metric.percentage" 
            max="100">
          </progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MetricCard',
  props: {
    item: Object,
    adapter: Object
  },
  setup(props) {
    const metrics = ref(null);
    const isLoading = ref(false);

    onMounted(async () => {
      if (props.adapter && props.adapter.fetchMetrics) {
        isLoading.value = true;
        try {
          metrics.value = await props.adapter.fetchMetrics(props.item.url, props.item.apikey);
        } catch (e) {
          console.error("Metric fetch failed", e);
        } finally {
          isLoading.value = false;
        }
      }
    });

    return { metrics, isLoading };
  }
}
</script>
