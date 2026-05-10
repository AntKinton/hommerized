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
  name: "OpenHAB",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const status = ref("");
    const things = ref({
      count: 0,
      online: 0,
    });
    const items = ref({
      count: 0,
    });

    const headers = computed(() => {
      const basicAuth = `${props.item.apikey}:`;

      return {
        Authorization: `Basic ${btoa(basicAuth)}`,
      };
    });

    const details = computed(() => {
      const detailsArray = [];

      if (props.item.things) {
        detailsArray.push(
          `${things.value.count} things (${things.value.online} Online)`,
        );
      }

      if (props.item.items) {
        detailsArray.push(`${items.value.count} items`);
      }

      return detailsArray.join(", ");
    });

    const fetchServerStatus = async () => {
      const headersValue = headers.value;
      try {
        const response = await fetch("/rest/systeminfo", { headersValue });
        if (response && response.systemInfo) status.value = "running";
        else throw new Error();
      } catch (e) {
        console.log(e);
        status.value = "dead";
      }
    };

    const fetchServerStats = async () => {
      const headersValue = headers.value;

      if (props.item.things) {
        try {
          const data = await fetch("/rest/things?summary=true", {
            headersValue,
          });
          things.value.count = data.length;
          things.value.online = data.filter(
            (e) => e.statusInfo.status === "ONLINE",
          ).length;
        } catch (e) {
          console.log(e);
        }
      }

      if (props.item.items) {
        try {
          const data = await fetch("/rest/items", { headersValue });
          items.value.count = data.length;
        } catch (e) {
          console.log(e);
        }
      }
    };

    fetchServerStatus();

    if (!props.item.subtitle && status.value !== "dead") {
      fetchServerStats();
    }

    return {
      status,
      things,
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
