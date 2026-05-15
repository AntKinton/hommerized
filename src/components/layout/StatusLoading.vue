<template>
  <div 
    class="has-text-centered p-5 is-flex is-align-items-center is-justify-content-center"
    :style="fullscreen ? 'position: fixed; inset: 0; z-index: 9999; background-color: var(--card-background); backdrop-filter: blur(2px);' : ''"
  >
    <div class="box is-shadowless" style="max-width: 300px; margin: 0 auto; background: transparent;">
      
      <div class="mb-4">
        <span class="icon has-text-primary" :class="sizeClass">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
        </span>
      </div>
      
      <p v-if="message" class="has-text-weight-medium mb-3" :class="messageClass">
        {{ message }}
      </p>
      
      <div v-if="showProgress" class="mb-3">
        <progress 
          class="progress is-small is-primary mb-1" 
          :value="progress" 
          max="100"
        ></progress>
        <span class="is-size-7 has-text-grey">{{ progress }}%</span>
      </div>
      
      <p v-if="details" class="is-size-7 has-text-grey mt-2">
        {{ details }}
      </p>
      
      <button 
        v-if="showRetry" 
        class="button is-primary is-small mt-4"
        @click="$emit('retry')"
      >
        <span class="icon is-small"><i class="fas fa-redo"></i></span>
        <span>Retry</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Loader',
  props: {
    message: {
      type: String,
      default: 'Loading...'
    },
    details: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: (/** @type {string} */ value) => ['small', 'medium', 'large'].includes(value)
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    showProgress: {
      type: Boolean,
      default: false
    },
    progress: {
      type: Number,
      default: 0,
      validator: (/** @type {number} */ value) => value >= 0 && value <= 100
    },
    showRetry: {
      type: Boolean,
      default: false
    }
  },
  emits: ['retry'],
  computed: {
    sizeClass() {
      return `is-${this.size}`;
    },
    messageClass() {
      return `is-${this.size === 'small' ? 'size-7' : this.size === 'large' ? 'size-4' : 'size-5'}`;
    }
  }
}
</script>

