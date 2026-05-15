<template>
  <div 
    class="has-text-centered p-5 is-flex is-align-items-center is-justify-content-center"
    :style="fullscreen ? 'position: fixed; inset: 0; z-index: 9999; background-color: var(--card-background);' : ''"
  >
    <div class="box" style="max-width: 500px; margin: 0 auto;">
      
      <div class="mb-4">
        <span class="icon has-text-danger is-large" :class="sizeClass">
          <i class="fas fa-exclamation-triangle fa-3x"></i>
        </span>
      </div>
      
      <h3 v-if="title" class="title is-4 mb-3">{{ title }}</h3>
      
      <p class="subtitle is-6 mb-4 has-text-grey">{{ message }}</p>
      
      <details v-if="details" class="mb-4 has-text-left">
        <summary class="has-text-primary has-text-weight-medium is-clickable mb-2" style="outline: none;">
          Technical details
        </summary>
        <pre class="is-size-7 p-3" style="background-color: var(--card-background); color: var(--text); border-radius: 0.375rem; overflow-x: auto;">{{ details }}</pre>
      </details>
      
      <div class="buttons is-centered mt-5">
        <button 
          v-if="showRetry" 
          class="button is-primary"
          @click="$emit('retry')"
        >
          <span class="icon"><i class="fas fa-redo"></i></span>
          <span>{{ retryText }}</span>
        </button>
        
        <button 
          v-if="showRefresh" 
          class="button is-light"
          @click="refreshPage"
        >
          <span class="icon"><i class="fas fa-sync"></i></span>
          <span>Refresh Page</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorDisplay',
  props: {
    title: {
      type: String,
      default: 'Something went wrong'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },
    fullscreen: {
      type: Boolean,
      default: false
    },
    showRetry: {
      type: Boolean,
      default: true
    },
    showRefresh: {
      type: Boolean,
      default: true
    },
    retryText: {
      type: String,
      default: 'Try Again'
    }
  },
  emits: ['retry'],
  computed: {
    sizeClass() {
      return `is-${this.size}`;
    }
  },
  methods: {
    refreshPage() {
      window.location.reload();
    }
  }
}
</script>

