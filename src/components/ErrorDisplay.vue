<template>
  <div class="error-container" :class="{ 'is-fullscreen': fullscreen }">
    <div class="error-content">
      <!-- Error icon -->
      <div class="error-icon" :class="sizeClass">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      
      <!-- Error title -->
      <h3 v-if="title" class="error-title">{{ title }}</h3>
      
      <!-- Error message -->
      <p class="error-message">{{ message }}</p>
      
      <!-- Error details (collapsible) -->
      <details v-if="details" class="error-details">
        <summary>Technical details</summary>
        <pre class="error-stack">{{ details }}</pre>
      </details>
      
      <!-- Action buttons -->
      <div class="error-actions">
        <button 
          v-if="showRetry" 
          class="button is-primary"
          @click="$emit('retry')"
        >
          <i class="fas fa-redo mr-2"></i>
          {{ retryText }}
        </button>
        
        <button 
          v-if="showRefresh" 
          class="button is-light"
          @click="refreshPage"
        >
          <i class="fas fa-sync mr-2"></i>
          Refresh Page
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
  methods: {
    refreshPage() {
      window.location.reload();
    }
  },
  computed: {
    sizeClass() {
      return `is-${this.size}`;
    }
  }
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.error-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  z-index: 9999;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  color: #ff3860;
  margin-bottom: 1rem;
}

.error-icon.is-small {
  font-size: 2rem;
}

.error-icon.is-medium {
  font-size: 3rem;
}

.error-icon.is-large {
  font-size: 4rem;
}

.error-title {
  color: #363636;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.error-message {
  color: #4a4a4a;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.error-details {
  margin: 1.5rem 0;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  color: #3273dc;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.error-stack {
  background: #f5f5f5;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  padding: 1rem;
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-container.is-fullscreen {
    background: rgba(0, 0, 0, 0.9);
  }
  
  .error-title {
    color: #fafafa;
  }
  
  .error-message {
    color: #e0e0e0;
  }
  
  .error-stack {
    background: #2d2d2d;
    border-color: #4a4a4a;
    color: #e0e0e0;
  }
}
</style>
