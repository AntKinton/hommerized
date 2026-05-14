<template>
  <div class="card">
    <div class="card-content">
      <div class="media is-align-items-center mb-3">
        <div class="media-left">
          <figure v-if="item.logo" class="image is-48x48">
            <img :src="item.logo" :alt="item.name" />
          </figure>
          <span v-else-if="item.icon" class="icon is-medium has-text-primary">
            <i class="fas fa-2x" :class="item.icon"></i>
          </span>
        </div>
        <div class="media-content">
          <p class="title is-5 is-marginless">{{ item.name }}</p>
        </div>
      </div>

      <div v-if="notifications" class="notifications-container mt-4">
        <div v-for="(notification, idx) in notifications" :key="idx" class="notification-item mb-2">
          <div class="is-flex is-align-items-start">
            <span class="icon is-small mr-2 mt-1" :class="notificationIconClass(notification)">
              <i :class="notificationIcon(notification)"></i>
            </span>
            <div class="notification-content is-flex-grow-1">
              <p class="has-text-weight-medium is-size-6 mb-1">{{ notification.title }}</p>
              <p v-if="notification.message" class="is-size-7 has-text-grey">{{ notification.message }}</p>
              <p v-if="notification.timestamp" class="is-size-7 has-text-grey-light">{{ formatTime(notification.timestamp) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'NotificationCard',
  props: {
    item: Object,
    adapter: Object
  },
  setup(props) {
    const notifications = ref(null);
    const isLoading = ref(false);

    const notificationIcon = (notification) => {
      switch (notification.type) {
        case 'success': return 'fa-circle-check';
        case 'warning': return 'fa-triangle-exclamation';
        case 'error': return 'fa-circle-xmark';
        case 'info': return 'fa-circle-info';
        default: return 'fa-bell';
      }
    };

    const notificationIconClass = (notification) => {
      switch (notification.type) {
        case 'success': return 'has-text-success';
        case 'warning': return 'has-text-warning';
        case 'error': return 'has-text-danger';
        case 'info': return 'has-text-info';
        default: return 'has-text-grey';
      }
    };

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString();
    };

    onMounted(async () => {
      if (props.adapter && props.adapter.fetchNotifications) {
        isLoading.value = true;
        try {
          notifications.value = await props.adapter.fetchNotifications(props.item.url, props.item.apikey);
        } catch (e) {
          console.error("Notification fetch failed", e);
        } finally {
          isLoading.value = false;
        }
      }
    });

    return { 
      notifications, 
      isLoading,
      notificationIcon,
      notificationIconClass,
      formatTime
    };
  }
}
</script>
