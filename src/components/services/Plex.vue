<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="streams > 0"
          class="notif activity"
          title="Active Streams"
        >
          {{ streams }}
        </strong>
        <strong v-if="series > 0" class="notif series" title="Total Series">
          {{ series }}
        </strong>
        <strong v-if="movies > 0" class="notif movies" title="Total Movies">
          {{ movies }}
        </strong>
        <strong v-if="warnings > 0" class="notif warnings" title="Warning">
          {{ warnings }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Plex API, check url and token in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Plex",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const streams = ref(null);
    const series = ref(null);
    const movies = ref(null);
    const warnings = ref(null);
    const errors = ref(null);
    const serverError = ref(false);

    const fetchData = () => {
      const handleError = (e) => {
        console.error(e);
        serverError.value = true;
      };
      
      fetch(`/status/sessions?X-Plex-Token=${props.item.token}`, {}, false)
        .then((str) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(str, "application/xml");
          const metadata = xml.getElementsByTagName("MediaContainer")[0];
          streams.value = metadata ? metadata.getAttribute("size") || 0 : 0;
        })
        .catch(handleError);
        
      fetch(`/library/sections?X-Plex-Token=${props.item.token}`, {}, false)
        .then((str) => {
          const parser = new DOMParser();
          const xml = parser.parseFromString(str, "application/xml");
          const directories = xml.getElementsByTagName("Directory");
          const seriesDirIds = [];
          const movieDirIds = [];
          for (let dir of directories) {
            if (dir.getAttribute("type") === "show") {
              seriesDirIds.push(dir.getAttribute("key"));
            } else if (dir.getAttribute("type") === "movie") {
              movieDirIds.push(dir.getAttribute("key"));
            }
          }
          let seriesCount = 0;
          Promise.all(
            seriesDirIds.map((seriesDirId) =>
              fetch(
                `${props.item.endpoint}/library/sections/${seriesDirId}/all?X-Plex-Token=${props.item.token}`,
              )
                .then((response) => response.text())
                .then((str) => {
                  const xml = parser.parseFromString(str, "application/xml");
                  seriesCount += xml.getElementsByTagName("Directory").length;
                })
                .catch(handleError),
            ),
          )
            .then(() => {
              series.value = seriesCount;
            })
            .catch(handleError);

          let movieCount = 0;
          Promise.all(
            movieDirIds.map((movieDirId) =>
              fetch(
                `${props.item.endpoint}/library/sections/${movieDirId}/all?X-Plex-Token=${props.item.token}`,
              )
                .then((response) => response.text())
                .then((str) => {
                  const xml = parser.parseFromString(str, "application/xml");
                  movieCount += xml.getElementsByTagName("Video").length;
                })
                .catch(handleError),
            ),
          ).then(() => {
            movies.value = movieCount;
          });
        })
        .catch(handleError);
    };

    // Initialize auto-update
    initAutoUpdate(fetchData);

    // Initial data fetch
    fetchData();

    return {
      streams,
      series,
      movies,
      warnings,
      errors,
      serverError,
      fetchData
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
    &.activity {
      background-color: #4fb5d6;
    }
    &.series {
      background-color: #ffa500;
    }
    &.movies {
      background-color: #008000;
    }
    &.warnings {
      background-color: #d08d2e;
    }
    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
