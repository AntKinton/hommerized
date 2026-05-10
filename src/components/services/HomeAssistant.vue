<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          {{ details }}
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
  name: "HomeAssistant",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const status = ref("");
    const version = ref("");
    const entities = ref(0);
    const location_name = ref("");
    const separator = ref(" ");
    const items = ref(["name", "version"]);

    const headers = computed(() => {
      return {
        Authorization: `Bearer ${props.item.apikey}`,
        "Content-Type": "application/json",
      };
    });

    const details = computed(() => {
      const detailsArray = [];
      const itemsArray = items.value;
      const separatorValue = separator.value;

      for (const i in itemsArray) {
        const key = itemsArray[i];

        switch (key) {
          case "version":
            detailsArray.push(`v${version.value}`);
            break;
          case "name":
            detailsArray.push(`${location_name.value}`);
            break;
          case "entities":
            detailsArray.push(`${entities.value} entities`);
            break;
          default:
            detailsArray.push(`undefined key ${key} `);
        }
      }

      return detailsArray.join(separatorValue);
    });

    const fetchServerStatus = async () => {
      const headersValue = headers.value;

      try {
        const response = await fetch("/api/", { headers: headersValue });
        if (response && response.message) status.value = "running";
        else throw new Error();
      } catch (e) {
        console.log(e);
        status.value = "dead";
      }
    };

    const fetchServerStats = async () => {
      const headersValue = headers.value;

      try {
        const configResponse = await fetch("/api/config", { headers: headersValue });
        if (configResponse) {
          if (configResponse.version) version.value = configResponse.version;
          if (configResponse.location_name)
            location_name.value = configResponse.location_name;
        } else throw new Error();
      } catch (e) {
        console.log(e);
        status.value = "dead";
      }

      try {
        const statesResponse = await fetch("/api/states", { headers: headersValue });
        if (statesResponse) {
          entities.value = statesResponse.length;
        } else throw new Error();
      } catch (e) {
        console.log(e);
        status.value = "dead";
      }
    };

    // Initial fetch and setup
    fetchServerStatus().then(() => {
      if (!props.item.subtitle && status.value !== "dead") {
        if (props.item.items) items.value = props.item.items;
        if (props.item.separator) separator.value = props.item.separator;

        fetchServerStats();
      }
    });

    return {
      status,
      version,
      entities,
      location_name,
      separator,
      items,
      headers,
      details,
      fetchServerStatus,
      fetchServerStats
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
