<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="versionstring"> Version {{ versionstring }} </template>
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
  name: "Nextcloud",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const fetchOk = ref(null);
    const versionstring = ref(null);
    const maintenance = ref(null);

    const status = computed(() => {
      if (!fetchOk.value) {
        return "offline";
      }
      return maintenance.value ? "maintenance" : "online";
    });

    const fetchStatus = async () => {
      try {
        const response = await fetch("/status.php");
        fetchOk.value = true;
        versionstring.value = response.versionstring;
        maintenance.value = response.maintenance;
      } catch (e) {
        fetchOk.value = false;
        console.log(e);
      }
    };

    fetchStatus();

    return {
      fetchOk,
      versionstring,
      maintenance,
      status,
      fetchStatus
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

  &.maintenance:before {
    background-color: #f8a306;
    border-color: #e1b35e;
    box-shadow: 0 0 5px 1px #f8a306;
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
</style>
