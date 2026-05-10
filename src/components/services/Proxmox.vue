<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="vms">
          <div v-if="loading">
            <strong>Loading...</strong>
          </div>
          <div v-else-if="error">
            <strong class="danger">Error loading info</strong>
          </div>
          <div
            v-else
            class="metrics"
            :class="{
              'is-size-7-mobile': item.small_font_on_small_screens,
              'is-small': item.small_font_on_desktop,
            }"
          >
            <span v-if="isValueShown('vms')" class="margined"
              >VMs:
              <span class="is-number"
                ><span class="has-text-weight-bold">{{ vms.running }}</span
                ><span v-if="isValueShown('vms_total')"
                  >/{{ vms.total }}</span
                ></span
              ></span
            >
            <span v-if="isValueShown('lxcs')" class="margined"
              >LXCs:
              <span class="is-number"
                ><span class="has-text-weight-bold">{{ lxcs.running }}</span
                ><span v-if="isValueShown('lxcs_total')"
                  >/{{ lxcs.total }}</span
                ></span
              ></span
            >
            <span v-if="isValueShown('disk')" class="margined"
              >Disk:
              <span
                class="has-text-weight-bold is-number"
                :class="statusClass(diskUsed)"
                >{{ diskUsed }}%</span
              ></span
            >
            <span v-if="isValueShown('mem')" class="margined"
              >Mem:
              <span
                class="has-text-weight-bold is-number"
                :class="statusClass(memoryUsed)"
                >{{ memoryUsed }}%</span
              ></span
            >
            <span v-if="isValueShown('cpu')" class="margined"
              >CPU:
              <span
                class="has-text-weight-bold is-number"
                :class="statusClass(cpuUsed)"
                >{{ cpuUsed }}%</span
              ></span
            >
          </div>
        </template>
      </p>
    </template>
    <template #indicator>
      <i v-if="loading" class="fa fa-circle-notch fa-spin fa-2xl"></i>
      <i v-if="error" class="fa fa-exclamation-circle fa-2xl danger"></i>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Proxmox",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const vms = ref({
      total: 0,
      running: 0,
    });
    const lxcs = ref({
      total: 0,
      running: 0,
    });
    const memoryUsed = ref(0);
    const diskUsed = ref(0);
    const cpuUsed = ref(0);
    const hide = ref([]);
    const error = ref(false);
    const loading = ref(true);

    const statusClass = (value) => {
      if (value > props.item.danger_value) return "danger";
      if (value > props.item.warning_value) return "warning";
      return "healthy";
    };

    const isValueShown = (value) => {
      return hide.value.indexOf(value) == -1;
    };

    const parseVMsAndLXCs = (items, value) => {
      value.total += items.data.length;
      value.running += items.data.filter((i) => i.status === "running").length;
      
      // if no vms, hide this value:
      if (value.total == 0) hide.value.push("vms");
    };

    const fetchStatus = async () => {
      try {
        const options = {
          headers: {
            Authorization: props.item.api_token,
          },
        };
        const status = await fetch(
          `/api2/json/nodes/${props.item.node}/status`,
          options,
        );
        
        // main metrics:
        const decimalsToShow = props.item.hide_decimals ? 0 : 1;
        memoryUsed.value = (
          (status.data.memory.used * 100) /
          status.data.memory.total
        ).toFixed(decimalsToShow);
        diskUsed.value = (
          (status.data.rootfs.used * 100) /
          status.data.rootfs.total
        ).toFixed(decimalsToShow);
        cpuUsed.value = (status.data.cpu * 100).toFixed(decimalsToShow);
        
        // vms:
        if (isValueShown("vms")) {
          const vmsData = await fetch(
            `/api2/json/nodes/${props.item.node}/qemu`,
            options,
          );
          parseVMsAndLXCs(vmsData, vms.value);
        }
        
        // lxc containers:
        if (isValueShown("lxcs")) {
          const lxcsData = await fetch(
            `/api2/json/nodes/${props.item.node}/lxc`,
            options,
          );
          parseVMsAndLXCs(lxcsData, lxcs.value);
        }
        
        error.value = false;
      } catch (err) {
        console.log(err);
        error.value = true;
      }
      loading.value = false;
    };

    if (props.item.hide) hide.value = props.item.hide;

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      vms,
      lxcs,
      memoryUsed,
      diskUsed,
      cpuUsed,
      hide,
      error,
      loading,
      statusClass,
      isValueShown,
      fetchStatus
    };
  },
};
</script>

<style scoped lang="scss">
.healthy {
  color: green;
}
.warning {
  color: orange;
}
.danger {
  color: red;
}
.metrics .margined:not(:first-child) {
  margin-left: 0.3rem;
}
.is-small {
  font-size: small;
}
</style>
