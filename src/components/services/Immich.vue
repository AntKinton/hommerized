<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="users > 0" class="notif users" title="Users">
          {{ users }}
        </strong>
        <strong v-if="photos > 0" class="notif photos" title="Photos">
          {{ photos }}
        </strong>
        <strong v-if="videos > 0" class="notif videos" title="Videos">
          {{ videos }}
        </strong>
        <strong v-if="usage > 0" class="notif usage" title="Usage">
          {{ humanizeSize }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Immich API, check your url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';
import { formatBytes } from '@/utils/formatters.js';

export default {
  name: "Immich",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const users = ref(null);
    const photos = ref(null);
    const videos = ref(null);
    const usage = ref(null);
    const serverError = ref(false);

    const humanizeSize = computed(() => {
      return formatBytes(usage.value);
    });

    const fetchConfig = () => {
      const headers = {
        "x-api-key": props.item.apikey,
      };

      fetch(`/api/server/statistics`, { headers })
        .then((stats) => {
          photos.value = stats.photos;
          videos.value = stats.videos;
          usage.value = stats.usage;
          users.value = stats.usageByUser.length;
        })
        .catch((e) => {
          console.error(e);
          serverError.value = true;
        });
    };

    // Initialize auto-update
    initAutoUpdate(fetchConfig);

    // Initial data fetch
    fetchConfig();

    return {
      users,
      photos,
      videos,
      usage,
      serverError,
      humanizeSize,
      fetchConfig
    };
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;
  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;
    &.photos {
      background-color: #4fb5d6;
    }

    &.videos {
      background-color: #d08d2e;
    }

    &.usage {
      background-color: #e51111;
    }

    &.users {
      background-color: #8dd475;
    }
  }
}
</style>
