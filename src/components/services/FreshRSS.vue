<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="subscriptions > 0"
          class="notif subscriptions"
          title="Subscriptions"
        >
          {{ subscriptions }}
        </strong>
        <strong v-if="unread > 0" class="notif unread" title="Unread">
          {{ unread }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to the FreshRSS API, check url username and password in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "FreshRSS",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const subscriptions = ref(0);
    const unread = ref(0);
    const serverError = ref(false);
    let auth = null;

    const fetchConfig = async () => {
      if (!auth) {
        try {
          const body = await fetch(
            `/api/greader.php/accounts/ClientLogin?Email=${props.item.username}&Passwd=${props.item.password}`,
            { method: "GET", cache: "no-cache" },
            false,
          );
          const match = body.match(/Auth=(([([a-z0-9]+)\/([([a-z0-9]+))/i);
          if (match !== null) auth = match[1];
        } catch (e) {
          console.error(e);
          serverError.value = true;
          return;
        }
      }

      const headers = {
        Authorization: `GoogleLogin auth=${auth}`,
      };

      try {
        const subscription = await fetch(
          `/api/greader.php/reader/api/0/subscription/list?output=json`,
          { headers },
        );
        subscriptions.value = subscription.subscriptions.length;
      } catch (e) {
        console.error(e);
        serverError.value = true;
      }

      try {
        const unreadcount = await fetch(`/api/greader.php/reader/api/0/unread-count?output=json`, {
          headers,
        });
        unread.value = unreadcount.max;
      } catch (e) {
        console.error(e);
        serverError.value = true;
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchConfig);

    // Initial data fetch
    fetchConfig();

    return {
      subscriptions,
      unread,
      serverError,
      fetchConfig
    };
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.subscriptions {
      background-color: #4fb5d6;
    }

    &.unread {
      background-color: #d08d2e;
    }
  }
}
</style>
