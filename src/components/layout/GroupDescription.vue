<template>
  <div class="group-header is-flex is-align-items-center">
    <span v-if="group.icon" class="icon is-medium mr-2">
      <i class="fas fa-lg fa-fw" :class="group.icon"></i>
    </span>
    
    <figure v-else-if="group.logo" class="image is-32x32 mr-3">
      <img :src="group.logo" :alt="`${group.name} logo`" />
    </figure>
    
    <h2 class="title is-4 is-marginless has-text-weight-light">
      {{ group.name }}
    </h2>
  </div>
</template>

<script>
export default {
  name: "GroupDescription",
  props: {
    group: {
      type: Object,
      required: true,
    },
  },
};
</script>
