<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          {{ embyCount }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Emby",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const status = ref("");
    const albumCount = ref(0);
    const songCount = ref(0);
    const movieCount = ref(0);
    const seriesCount = ref(0);
    const episodeCount = ref(0);

    const embyCount = computed(() => {
      if (props.item.libraryType === "music")
        return `${songCount.value} songs, ${albumCount.value} albums`;
      else if (props.item.libraryType === "movies")
        return `${movieCount.value} movies`;
      else if (props.item.libraryType === "series")
        return `${episodeCount.value} eps, ${seriesCount.value} series`;
      else return `wrong library type 💀`;
    });

    const fetchAll = async () => {
      await fetchServerStatus();

      if (!props.item.subtitle) {
        await fetchServerMediaStats();
      }
    };

    const fetchServerStatus = async () => {
      try {
        const response = await fetch("/System/info/public");
        if (response.Id) status.value = "running";
        else throw new Error();
      } catch (e) {
        console.log(e);
        status.value = "dead";
      }
    };

    const fetchServerMediaStats = async () => {
      const headers = {
        "X-Emby-Token": props.item.apikey,
      };

      try {
        const data = await fetch("/items/counts", { headers });
        albumCount.value = data.AlbumCount;
        songCount.value = data.SongCount;
        movieCount.value = data.MovieCount;
        seriesCount.value = data.SeriesCount;
        episodeCount.value = data.EpisodeCount;
      } catch (e) {
        console.log(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchAll);

    // Initial data fetch
    fetchAll();

    return {
      status,
      albumCount,
      songCount,
      movieCount,
      seriesCount,
      episodeCount,
      embyCount,
      fetchAll,
      fetchServerStatus,
      fetchServerMediaStats
    };
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.running:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.dead:before {
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
