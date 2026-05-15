<template>
  <div class="navbar-item">
    <form role="search" @submit.prevent>
      <div class="field">
        <div class="control">
          <input
            id="search" ref="search" name="search" type="search" class="input is-rounded" placeholder="Search services..."
            :value="value" @input.stop="search($event.target.value)" @keydown.enter.exact.prevent="open()"
            @keydown.alt.enter.prevent="open('_blank')" />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { usePoliciesStore } from "../../stores/module-policy.js";
import { useAuthStore } from "../../stores/module-auth.js";
import { useConfigStore } from "../../stores/module-config.js";

export default {
  name: "ServiceBySearch",
  props: {
    value: String,
    hotkey: {
      type: String,
      default: "/",
    },
  },
  emits: ["search-open", "search-focus", "search-cancel", "input"],
  setup() {
    const policiesStore = usePoliciesStore();
    const authStore = useAuthStore();
    const configStore = useConfigStore();

    return {
      policiesStore,
      authStore,
      configStore
    };
  },
  data() {
    return {
      keyListener: null
    };
  },
  mounted() {
    this.keyListener = function (event) {
      if (!this.hasFocus() && event.key === this.hotkey) {
        event.preventDefault();
        this.focus();
      }
      if (event.key === "Escape") {
        this.cancel();
      }
    };
    document.addEventListener("keydown", this.keyListener.bind(this));

    // fill search from get parameter.
    const search = new URLSearchParams(window.location.search).get("search");
    if (search) {
      const searchInput = /** @type {HTMLInputElement} */ (this.$refs.search);
      if (searchInput) searchInput.value = search;
      this.search(search);
      this.focus();
    }
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.keyListener);
  },
  methods: {
    open: function (target = null) {
      const searchInput = /** @type {HTMLInputElement} */ (this.$refs.search);
      if (!searchInput || !searchInput.value) {
        return;
      }
      this.$emit("search-open", target);
    },
    focus: function () {
      this.$emit("search-focus");
      this.$nextTick(() => {
        const searchInput = /** @type {HTMLInputElement} */ (this.$refs.search);
        if (searchInput) searchInput.focus();
      });
    },
    hasFocus: function () {
      return document.activeElement == this.$refs.search;
    },
    setSearchURL: function (value) {
      const url = new URL(window.location.href);
      if (value === "") {
        url.searchParams.delete("search");
      } else {
        url.searchParams.set("search", value);
      }
      window.history.replaceState("search", null, url.toString());
    },
    cancel: function () {
      this.setSearchURL("");
      const searchInput = /** @type {HTMLInputElement} */ (this.$refs.search);
      if (searchInput) {
        searchInput.value = "";
        searchInput.blur();
      }
      
      // Clear global filtering
      const config = this.configStore.currentConfig;
      if (config && config.services) {
        this.policiesStore.filterServices(config.services, this.authStore.groups, "");
      }
      
      this.$emit("search-cancel");
    },
    search: function (value) {
      this.setSearchURL(value);
      
      const config = this.configStore.currentConfig;
      if (config && config.services) {
        // Trigger global filtering in the policy store
        this.policiesStore.filterServices(
          config.services, 
          this.authStore.groups, 
          value
        );
      }
      
      this.$emit("input", value.toLowerCase());
    },
  },
};
</script>
