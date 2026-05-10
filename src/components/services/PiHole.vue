<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="percentage">
          {{ percentage }}&percnt; blocked
        </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "PiHole",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const status = ref("");
    const percent_blocked = ref(0);
    const sessionId = ref(null);
    const sessionExpiry = ref(null);
    const retryCount = ref(0);
    const maxRetries = ref(3);
    const retryDelay = ref(5000);

    const percentage = computed(() => {
      if (percent_blocked.value >= 0) {
        return percent_blocked.value.toFixed(1);
      }
      return "";
    });

    const isAuthenticated = computed(() => {
      return (
        sessionId.value && sessionExpiry.value && Date.now() < sessionExpiry.value
      );
    });

    const handleError = (error, statusValue) => {
      console.error(error);
      props.item.subtitle = error;
      status.value = statusValue;
    };

    const loadCachedSession = () => {
      try {
        const cachedSession = localStorage.getItem(
          `pihole_session_${props.item.url}`,
        );
        if (cachedSession) {
          const session = JSON.parse(cachedSession);
          if (session.expiry > Date.now()) {
            sessionId.value = session.sid;
            sessionExpiry.value = session.expiry;
          } else {
            removeCacheSession();
          }
        }
      } catch (e) {
        handleError(`Failed to load cached session: ${e}`, "error");
        removeCacheSession();
      }
    };

    const removeCacheSession = () => {
      localStorage.removeItem(`pihole_session_${props.item.url}`);
      sessionId.value = null;
      sessionExpiry.value = null;
    };

    const authenticate = async () => {
      try {
        const authResponse = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: props.item.apikey }),
        });

        if (authResponse?.session?.sid) {
          sessionId.value = authResponse.session.sid;
          sessionExpiry.value =
            Date.now() + authResponse.session.validity * 1000;

          localStorage.setItem(
            `pihole_session_${props.item.url}`,
            JSON.stringify({
              sid: sessionId.value,
              expiry: sessionExpiry.value,
            }),
          );

          retryCount.value = 0;
          return true;
        }
        throw new Error("Invalid authentication response");
      } catch (e) {
        handleError(`Authentication failed: ${e}`, "disabled");
        return false;
      }
    };

    const retryWithDelay = async () => {
      //console.log("Retrying authentication...");
      if (retryCount.value < maxRetries.value) {
        retryCount.value++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay.value));
        return fetchStatus();
      }
      return false;
    };

    const fetchStatus = async () => {
      try {
        if (!isAuthenticated.value && props.item.apikey) {
          const authenticated = await authenticate();
          if (!authenticated) return;
        }

        const [summary_response, status_response] = await Promise.all([
          fetch(
            `api/stats/summary?sid=${encodeURIComponent(sessionId.value)}`,
          ),
          fetch(
            `api/dns/blocking?sid=${encodeURIComponent(sessionId.value)}`,
          ),
        ]);

        if (
          summary_response?.queries?.percent_blocked === undefined ||
          status_response?.blocking === undefined
        ) {
          throw new Error("Invalid response format");
        }

        status.value = status_response.blocking;
        percent_blocked.value = summary_response.queries.percent_blocked;
        retryCount.value = 0;
      } catch (e) {
        const isAuthError =
          e.message.includes("401 error") || e.message.includes("403 error");
        if (isAuthError && props.item.apikey) {
          removeCacheSession();
          return retryWithDelay();
        }
        handleError(`Failed to fetch status: ${e.message || e}`, "error");
        removeCacheSession();
      }
    };

    const fetchStatus_v5 = async () => {
      const authQueryParams = props.item.apikey
        ? `?summaryRaw&auth=${props.item.apikey}`
        : "";
      try {
        const result = await fetch(`/api.php${authQueryParams}`);
        status.value = result.status;
        percent_blocked.value = result.ads_percentage_today;
      } catch (e) {
        handleError(`Failed to fetch status: ${e}`, "error");
      }
    };

    // Setup based on API version
    if (parseInt(props.item.apiVersion, 10) === 6) {
      loadCachedSession();
      initAutoUpdate(fetchStatus);
    } else {
      initAutoUpdate(fetchStatus_v5);
    }

    // Initial data fetch
    if (parseInt(props.item.apiVersion, 10) === 6) {
      fetchStatus();
    } else {
      fetchStatus_v5();
    }

    return {
      status,
      percent_blocked,
      sessionId,
      sessionExpiry,
      retryCount,
      maxRetries,
      retryDelay,
      percentage,
      isAuthenticated,
      fetchStatus,
      fetchStatus_v5
    };
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.enabled:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.disabled:before {
    background-color: #f5a623;
    border-color: #e59400;
    box-shadow: 0 0 5px 1px #f5a623;
  }

  &.error:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
