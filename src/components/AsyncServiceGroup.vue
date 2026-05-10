<template>
  <Suspense>
    <template #default>
      <ServiceGroup
        :group="group"
        :is-vertical="isVertical"
        :proxy="proxy"
        :columns="columns"
        :group-index="groupIndex"
      />
    </template>
    <template #fallback>
      <Loader 
        message="Loading services..."
        :details="`Loading ${group.name} services...`"
        size="small"
      />
    </template>
  </Suspense>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import Loader from './Loader.vue';

const ServiceGroup = defineAsyncComponent(() => 
  import('./ServiceGroup.vue')
);

export default {
  name: 'AsyncServiceGroup',
  components: {
    ServiceGroup,
    Loader
  },
  props: {
    group: {
      type: Object,
      required: true
    },
    isVertical: {
      type: Boolean,
      default: false
    },
    proxy: {
      type: Object,
      default: null
    },
    columns: {
      type: Number,
      default: 3
    },
    groupIndex: {
      type: Number,
      required: true
    }
  }
}
</script>
