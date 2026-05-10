<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="versionstring">
          Version {{ versionstring }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif running" title="Running">
          {{ running }}
        </strong>
        <strong v-if="dead > 0" class="notif dead" title="Dead">
          {{ dead }}
        </strong>
        <strong
          v-if="misc > 0"
          class="notif misc"
          title="Other (creating, paused, exited, etc.)"
        >
          {{ misc }}
        </strong>
      </div>
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
  name: "Portainer",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const endpoints = ref(null);
    const containers = ref(null);
    const fetchOk = ref(null);
    const versionstring = ref(null);

    const running = computed(() => {
      if (!containers.value) {
        return "";
      }
      return containers.value.filter((container) => {
        return container.State.toLowerCase() === "running";
      }).length;
    });

    const dead = computed(() => {
      if (!containers.value) {
        return "";
      }
      return containers.value.filter((container) => {
        return container.State.toLowerCase() === "dead";
      }).length;
    });

    const misc = computed(() => {
      if (!containers.value) {
        return "";
      }
      return containers.value.filter((container) => {
        return (
          container.State.toLowerCase() !== "running" &&
          container.State.toLowerCase() !== "dead"
        );
      }).length;
    });

    const status = computed(() => {
      return fetchOk.value ? "online" : "offline";
    });

    const fetchStatus = async () => {
      const headers = {
        "X-Api-Key": props.item.apikey,
      };

      try {
        const response = await fetch("/api/endpoints", { headers });
        endpoints.value = await response.json();
      } catch (e) {
        console.error(e);
      }

      let containersArray = [];
      for (let endpoint of endpoints.value) {
        if (
          props.item.environments &&
          !props.item.environments.includes(endpoint.Name)
        ) {
          continue;
        }
        const uri = `/api/endpoints/${endpoint.Id}/docker/containers/json?all=1`;
        try {
          const endpointContainers = await fetch(uri, { headers });
          if (endpointContainers) {
            containersArray = containersArray.concat(endpointContainers);
          }
        } catch (e) {
          console.error(e);
        }
      }

      containers.value = containersArray;
    };

    const fetchVersion = async () => {
      const headers = {
        "X-Api-Key": props.item.apikey,
      };
      try {
        const response = await fetch("/api/status", { headers });
        fetchOk.value = true;
        versionstring.value = response.Version;
      } catch (e) {
        fetchOk.value = false;
        console.error(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();
    fetchVersion();

    return {
      endpoints,
      containers,
      fetchOk,
      versionstring,
      running,
      dead,
      misc,
      status,
      fetchStatus,
      fetchVersion
    };
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  white-space: nowrap;
  margin-left: 0.25rem;

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before {
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

    &.running {
      background-color: #4fd671;
    }

    &.dead {
      background-color: #e51111;
    }

    &.misc {
      background-color: #2ed0c8;
    }
  }
}
</style>
