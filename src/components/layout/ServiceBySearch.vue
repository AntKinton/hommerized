<template>
  <div class="navbar-item">
    <form role="search" @submit.prevent>
      <div class="field">
        <p class="control has-icons-left">
          <input id="search" ref="search" name="search" type="search" class="input is-rounded" placeholder="Search..."
            :value="value" @input.stop="search($event.target.value)" @keydown.enter.exact.prevent="open()"
            @keydown.alt.enter.prevent="open('_blank')" />
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { usePoliciesStore } from "../../stores/module-policy.js";

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

    return {
      policiesStore
    };
  },
  mounted() {
    this._keyListener = function (event) {
      if (!this.hasFocus() && event.key === this.hotkey) {
        event.preventDefault();
        this.focus();
      }
      if (event.key === "Escape") {
        this.cancel();
      }
    };
    document.addEventListener("keydown", this._keyListener.bind(this));

    // fill search from get parameter.
    const search = new URLSearchParams(window.location.search).get("search");
    if (search) {
      this.$refs.search.value = search;
      this.search(search);
      this.focus();
    }
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this._keyListener);
  },
  methods: {
    open: function (target = null) {
      if (!this.$refs.search.value) {
        return;
      }
      this.$emit("search-open", target);
    },
    focus: function () {
      this.$emit("search-focus");
      this.$nextTick(() => {
        this.$refs.search.focus();
      });
    },
    hasFocus: function () {
      return document.activeElement == this.$refs.search;
    },
    setSearchURL: function (value) {
      const url = new URL(window.location);
      if (value === "") {
        url.searchParams.delete("search");
      } else {
        url.searchParams.set("search", value);
      }
      window.history.replaceState("search", null, url);
    },
    cancel: function () {
      this.setSearchURL("");
      this.$refs.search.value = "";
      this.$refs.search.blur();
      this.$emit("search-cancel");
    },
    search: function (value) {
      this.setSearchURL(value);
      // Optimized search: only search within already filtered data
      const searchResults = this.policiesStore.getFilteredServices;
      this.$emit("input", value.toLowerCase(), searchResults);
    },
  },
};
</script>
