<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace">
            <p class="fas fa-download"></p>
            {{ downRate }}
          </span>
          <span class="up monospace">
            <p class="fas fa-upload"></p>
            {{ upRate }}
          </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <span v-if="!error" class="count"
        >{{ count }}
        <template v-if="count === 1">torrent</template>
        <template v-else>torrents</template>
      </span>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';
import { formatSpeed } from "@/utils/formatters.js";

export default {
  name: "QBittorrent",
  props: { item: Object },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    // Properties for download, upload, torrent count and errors.
    const dl = ref(null);
    const ul = ref(null);
    const count = ref(null);
    const error = ref(null);

    // Computed properties for rate labels.
    const downRate = computed(() => {
      return formatSpeed(dl.value);
    });

    const upRate = computed(() => {
      return formatSpeed(ul.value);
    });

    // Combined method for scheduler - fetches both rates and count
    const fetchAllData = async () => {
      await getRate();
      await fetchCount();
    };

    const fetchCount = async () => {
      try {
        const body = await fetch("/api/v2/torrents/info");
        error.value = false;
        count.value = body.length;
      } catch (e) {
        error.value = true;
        console.error(e);
      }
    };

    const getRate = async () => {
      try {
        const body = await fetch("/api/v2/transfer/info");
        error.value = false;
        dl.value = body.dl_info_speed;
        ul.value = body.up_info_speed;
      } catch (e) {
        error.value = true;
        console.error(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchAllData);

    // Fetch initial values
    fetchAllData();

    return {
      dl,
      ul,
      count,
      error,
      downRate,
      upRate,
      fetchAllData
    };
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.count {
  color: var(--text);
  font-size: 0.8em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
