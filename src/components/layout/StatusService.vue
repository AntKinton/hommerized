<template>
  <div
    v-if="offline"
    class="notification is-danger is-light has-text-centered my-6"
    role="alert"
    aria-live="polite"
  >
    <span class="icon is-large has-text-danger mb-2">
      <i class="fa-solid fa-triangle-exclamation fa-2x"></i>
    </span>
    
    <h1 class="title is-4 is-flex is-align-items-center is-justify-content-center">
      Network unreachable
      <button
        aria-label="Retry connection check"
        class="button is-ghost is-small ml-2"
        @click="checkOffline"
      >
        <span class="icon has-text-danger">
          <i class="fas fa-redo-alt"></i>
        </span>
      </button>
    </h1>
    
    <p>
      <a
        class="has-text-weight-bold has-text-danger-dark"
        href="https://github.com/antkinton/hommerized/blob/main/docs/configuration.md#connectivity-checks"
      >
        More information &rarr;
      </a>
    </p>
  </div>
</template>

<script>
export default {
  name: "StatusService",
  data: function () {
    return {
      offline: false,
    };
  },
  created: function () {
    if (/t=\d+/.test(window.location.href)) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    this.checkOffline();

    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
      false,
    );
    window.addEventListener("online", this.handleOnline, false);
    window.addEventListener("offline", this.handleOffline, false);
  },
  beforeUnmount: function () {
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);
  },
  methods: {
    handleVisibilityChange: function () {
      if (document.visibilityState === "visible") {
        this.checkOffline();
      }
    },
    handleOnline: function () {
      this.checkOffline();
    },
    handleOffline: function () {
      this.offline = true;
    },
    checkOffline: function () {
      // Global online check
      if (!navigator.onLine) {
        this.offline = true;
        return;
      }

      // Check if the current URL is reachable
      let that = this;

      const aliveCheckUrl = new URL(window.location);
      aliveCheckUrl.searchParams.set("t", new Date().valueOf());

      return fetch(aliveCheckUrl, {
        method: "HEAD",
        cache: "no-store",
        redirect: "manual",
      })
        .then(function (response) {
          // opaqueredirect means request has been redirected, to auth provider probably
          if (
            (response.type === "opaqueredirect" && !response.ok) ||
            [401, 403].indexOf(response.status) != -1
          ) {
            window.location.href = aliveCheckUrl;
          }
          that.offline = !response.ok;
        })
        .catch(function () {
          that.offline = true;
        })
        .finally(function () {
          that.$emit("network-status-update", that.offline);
        });
    },
  },
};
</script>
