<template>
  <Generic :item="item">
    <template #indicator>
      <div class="status">
        <i
          class="fa-regular fa-copy fa-xl"
          :class="{ scale: animate }"
          @click="copy()"
          @animationend="animate = false"
        ></i>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "CopyToClipboard",
  props: {
    item: Object,
  },
  setup(props) {
    useService(props.item);

    const animate = ref(false);

    const copy = () => {
      navigator.clipboard.writeText(props.item.clipboard);
      animate.value = true;
    };

    return {
      animate,
      copy
    };
  },
};
</script>

<style scoped lang="scss">
.scale {
  -webkit-animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-up 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
.light i {
  color: black;
}
.dark i {
  color: white;
}
/**
 * ----------------------------------------
 * animation scale-down-center
 * ----------------------------------------
 */
@-webkit-keyframes scale-up {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.25);
    transform: scale(1.25);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
@keyframes scale-up {
  0% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
  50% {
    -webkit-transform: scale(1.25);
    transform: scale(1.25);
  }
  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}
</style>
