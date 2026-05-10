<template>
  <Generic v-if="isGeneric" :item="item"></Generic>
  <component :is="component" v-else :item="item" :proxy="proxy"></component>
</template>

<script>
import { defineAsyncComponent, h } from "vue";
import ErrorDisplay from "./ErrorDisplay.vue";
const defaultService = "Generic";

export default {
  name: "Service",
  props: {
    item: Object,
    proxy: Object,
  },
  computed: {
    isGeneric() {
      return defaultService === (this.item.type || defaultService);
    },
    component() {
      const itemConfig = this.item; // Capturar el closure de item para usarlo en el errorComponent

      return defineAsyncComponent({
        loader: () => import(`./services/${this.item.type}.vue`),
        errorComponent: {
          props: ['error'],
          setup(props) {
            // Se usa la función de renderizado h() de Vue en lugar de un string template
            return () => h(ErrorDisplay, {
              title: `${itemConfig.name || itemConfig.type} - Service Error`,
              message: props.error?.message || 'Failed to load service component',
              details: props.error?.stack || props.error?.cause?.toString(),
              size: "small",
              showRetry: false,
              showRefresh: true
            });
          }
        },
        timeout: 3000,
      });
    },
  },
};
</script>
