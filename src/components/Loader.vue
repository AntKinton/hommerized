<template>
  <div class="loader-container" :class="{ 'is-fullscreen': fullscreen }">
    <div class="loader-content">
      <!-- Animated spinner -->
      <div class="loader-spinner" :class="sizeClass">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      
      <!-- Loading message -->
      <p v-if="message" class="loader-message" :class="messageClass">
        {{ message }}
      </p>
      
      <!-- Progress indicator (optional) -->
      <div v-if="showProgress" class="progress-container">
        <progress 
          class="progress is-small is-primary" 
          :value="progress" 
          max="100"
        ></progress>
        <span class="progress-text">{{ progress }}%</span>
      </div>
      
      <!-- Additional details (optional) -->
      <p v-if="details" class="loader-details is-size-7">
        {{ details }}
      </p>
      
      <!-- Retry button for error states -->
      <button 
        v-if="showRetry" 
        class="button is-primary is-small mt-4"
        @click="$emit('retry')"
      >
        <i class="fas fa-redo mr-2"></i>
        Retry
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
      validator: value => ['small', 'medium', 'large'].includes(value)
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
      validator: value => value >= 0 && value <= 100
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

<style scoped>
.loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.loader-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

.loader-content {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.loader-spinner {
  margin-bottom: 1.5rem;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.loader-spinner.is-small {
  font-size: 1.5rem;
}

.loader-spinner.is-medium {
  font-size: 3rem;
}

.loader-spinner.is-large {
  font-size: 4rem;
}

.loader-spinner i {
  animation: spin 1s linear infinite;
  background: linear-gradient(45deg, #3273dc, #238636, #ff3860, #ffdd57);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(50, 115, 220, 0.3));
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.loader-message {
  color: #2c2c2c;
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.loader-details {
  color: #6a6a6a;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.progress-container {
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
}

.progress::-webkit-progress-value {
  background: linear-gradient(90deg, #3273dc, #238636);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress::-moz-progress-bar {
  background: linear-gradient(90deg, #3273dc, #238636);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6a6a6a;
  min-width: 3rem;
  font-weight: 600;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .loader-container.is-fullscreen {
    background: rgba(0, 0, 0, 0.75);
  }
  
  .loader-content {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .loader-message {
    color: #fafafa;
  }
  
  .loader-details {
    color: #b5b5b5;
  }
  
  .progress-text {
    color: #b5b5b5;
  }
}

/* Hover effects */
.loader-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}
</style>
