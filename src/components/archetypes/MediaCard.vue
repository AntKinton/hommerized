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

      <div v-if="media" class="media-container mt-4">
        <div v-if="media.poster" class="media-poster mb-3">
          <figure class="image is-2by3">
            <img :src="media.poster" :alt="media.title" />
          </figure>
        </div>
        
        <div class="media-info">
          <p class="title is-6 mb-2">{{ media.title }}</p>
          <p v-if="media.subtitle" class="subtitle is-7 has-text-grey mb-3">{{ media.subtitle }}</p>
          
          <div v-if="media.metadata" class="metadata-container">
            <div v-for="(value, key) in media.metadata" :key="key" class="is-flex is-justify-content-space-between is-size-7 mb-1">
              <span class="has-text-grey">{{ key }}:</span>
              <span class="has-text-weight-medium">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'MediaCard',
  props: {
    item: Object,
    adapter: Object
  },
  setup(props) {
    const media = ref(null);
    const isLoading = ref(false);

    onMounted(async () => {
      if (props.adapter && props.adapter.fetchMedia) {
        isLoading.value = true;
        try {
          media.value = await props.adapter.fetchMedia(props.item.url, props.item.apikey);
        } catch (e) {
          console.error("Media fetch failed", e);
        } finally {
          isLoading.value = false;
        }
      }
    });

    return { media, isLoading };
  }
}
</script>
