<template>
  <div class="card">
    <div class="card-content">
      <div class="media is-align-items-center mb-3">
        <div class="media-left">
          <span v-if="item.icon" class="icon is-large">
            <i class="fas fa-2x" :class="item.icon"></i>
          </span>
        </div>
        <div class="media-content">
          <p class="title is-5 is-marginless">{{ item.name }}</p>
        </div>
      </div>

      <div v-if="controls" class="buttons mt-4">
        <button 
          v-for="(btn, idx) in controls" 
          :key="idx"
          class="button is-small"
          :class="btn.class || 'is-primary'"
          @click="btn.action"
        >
          <span v-if="btn.icon" class="icon"><i :class="btn.icon"></i></span>
          <span>{{ btn.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'ActionCard',
  props: { 
    item: Object,
    adapter: Object
  },
  setup(props) {
    const controls = ref([]);

    onMounted(async () => {
      if (props.adapter && props.adapter.getControls) {
        controls.value = await props.adapter.getControls(props.item);
      }
    });

    return { controls };
  }
}
</script>
