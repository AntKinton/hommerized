<template>
  <nav v-cloak v-if="links" class="navbar" :class="{ 'is-active': showMenu }" role="navigation" aria-label="main navigation">
    <div class="container">
      <div class="navbar-brand">
        <a
          role="button"
          aria-label="menu"
          aria-expanded="false"
          class="navbar-burger"
          :class="{ 'is-active': showMenu }"
          @click="$emit('navbar-toggle')"
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>
      
      <div class="navbar-menu" :class="{ 'is-active': showMenu }">
        <div class="navbar-start">
          <a
            v-for="(link, key) in links"
            :key="key"
            class="navbar-item"
            rel="noreferrer"
            :href="link.url"
            :target="link.target"
          >
            <span v-if="link.icon" class="icon is-small mr-2">
               <i :class="link.icon"></i>
            </span>
            <span>{{ link.name }}</span>
          </a>
        </div>
        
        <div class="navbar-end is-align-items-center">
          <slot></slot>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavbarContainer",
  props: {
    open: {
      type: Boolean,
      default: false,
    },
    links: {
      /** @type {import('vue').PropType<LinkItem[]>} */
      type: Array,
      default: () => [],
    },
  },
  emits: ["navbar-toggle"],
  computed: {
    showMenu: function () {
      return this.open && this.isSmallScreen();
    },
  },
  methods: {
    isSmallScreen: function () {
      return window.matchMedia("screen and (max-width: 1023px)").matches;
    },
  },
};
</script>

