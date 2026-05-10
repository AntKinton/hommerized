<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="api">
          happily storing {{ api.count }} documents
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Paperless",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const api = ref(null);

    const fetchStatus = async () => {
      if (props.item.subtitle != null) return;
      
      const apikey = props.item.apikey;
      if (!apikey) {
        console.error(
          "apikey is not present in config.yml for paperless entry!",
        );
        return;
      }
      
      try {
        api.value = await fetch("/api/documents/", {
          headers: {
            Authorization: "Token " + props.item.apikey,
          },
        });
      } catch (e) {
        console.log(e);
      }
    };

    fetchStatus();

    return {
      api,
      fetchStatus
    };
  },
};
</script>
