import { defineStore } from 'pinia';
import { parse } from "yaml";
import { defu } from "defu";

export const useConfigStore = defineStore('config', {
  // State: Equivalent to your reactive properties
  state: () => ({
    config: null,
    initialized: false,
  }),

  // Getters: Computed properties for the store
  getters: {
    currentConfig: (state) => state.config,
    // Safely get a specific value using path notation
    get: (state) => (path, defaultValue = null) => {
      if (!state.config) return defaultValue;
      return path.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : defaultValue;
      }, state.config);
    }
  },

  // Actions: Methods that handle business logic and state changes
  actions: {
    async initialize() {
      if (this.initialized) return;

      try {
        // Load default configuration
        const { default: defaultConfig } = await import('../config/defaults.yml?raw');
        const defaults = parse(defaultConfig);

        let config = {};

        // Load main configuration from assets
        try {
          const response = await fetch('/assets/config/config.yml');
          if (response.ok) {
            const yamlText = await response.text();
            config = parse(yamlText);
          }
        } catch (error) {
          console.log(error);
        }

        // Handle additional pages
        if (window.location.hash) {
          try {
            const pageName = window.location.hash.substring(1);
            const pageResponse = await fetch(`/assets/${pageName}.yml`);
            if (pageResponse.ok) {
              const pageYamlText = await pageResponse.text();
              const pageConfig = parse(pageYamlText);
              config = Object.assign(config, pageConfig);
            }
          } catch (error) {
            console.log(error);
          }
        }

        // Merge and update state using defu (user config takes priority)
        this.config = defu(config, defaults);

        // Restore layout and colorTheme from localStorage if present
        try {
          const storedLayout = localStorage.getItem('layout');
          if (storedLayout) this.config.defaults.layout = JSON.parse(storedLayout);

          const storedTheme = localStorage.getItem('colorTheme');
          if (storedTheme) this.config.defaults.colorTheme = JSON.parse(storedTheme);
        } catch (e) {
          // ignore parsing errors
        }

        // Apply theme immediately
        this.applyTheme(this.config.defaults.colorTheme);

        this.initialized = true;

        // Set document title
        document.title =
          this.config.documentTitle ||
          [this.config.title, this.config.subtitle].filter(Boolean).join(" | ");


        //console.log('ConfigStore initialized');

      } catch (error) {
        console.error('Error initializing ConfigStore:', error);
        // Fallback to minimal default config on critical failure
        this.config = this.getDefaultConfig();
        this.initialized = true;
      }
    },

    async reload() {
      this.initialized = false;
      await this.initialize();
    },

    updateConfig(path, value) {
      if (!this.config) return;

      const keys = path.split('.');
      let current = this.config;

      // Navigate to the parent object
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      // Set the value using Vue.set-like approach for reactivity
      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;

      // Persist specific user preferences
      if (path === 'defaults.layout') {
        localStorage.setItem('layout', JSON.stringify(value));
      } else if (path === 'defaults.colorTheme') {
        localStorage.setItem('colorTheme', JSON.stringify(value));
        this.applyTheme(value);
      }
    },

    applyTheme(theme) {
      if (!theme || theme === 'auto') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }

      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }

      // Also ensure the visual theme class is present
      const themeName = this.get('theme', 'default');
      if (themeName && themeName !== 'default') {
        document.documentElement.classList.add(`theme-${themeName}`);
      }
    },

    cycleColorTheme() {
      if (!this.config || !this.config.defaults) return;

      const availableThemes = ['auto', 'light', 'dark'];
      let currentTheme = this.config.defaults.colorTheme;
      let currentIndex = availableThemes.indexOf(currentTheme);

      if (currentIndex === -1) {
        currentIndex = 0;
      }

      const nextIndex = (currentIndex + 1) % availableThemes.length;
      const nextTheme = availableThemes[nextIndex];

      this.updateConfig('defaults.colorTheme', nextTheme);
    },

    cycleLayoutMode() {
      if (!this.config || !this.config.defaults) return;

      // Define available layouts in order
      const availableLayouts = ['columns', 'list', 'grid'];

      // Get current layout, fallback to 'columns' if invalid or undefined
      const currentLayout = this.config.defaults.layout;
      let currentIndex = availableLayouts.indexOf(currentLayout);

      if (currentIndex === -1) {
        currentIndex = 0;
      }

      // Calculate next index circularly
      const nextIndex = (currentIndex + 1) % availableLayouts.length;
      const nextLayout = availableLayouts[nextIndex];

      this.updateConfig('defaults.layout', nextLayout);
    },

    getDefaultConfig() {
      return {
        title: "Dashboard",
        subtitle: "Hommerized",
        header: true,
        footer: '<p><a href="https://github.com/antkinton/hommerized">Hommerized</a> version 26.05.2 - A fork of Homer with additional features made with <span class="has-text-danger">❤️</span> and powered by <a href="https://bulma.io/">bulma</a>, <a href="https://vuejs.org/">vuejs</a> & <a href="https://fontawesome.com/">font awesome</a> // Forked from <a href="https://github.com/bastienwirtz/homer"><i class="fab fa-github-alt"></i></a></p>',
        columns: "3",
        connectivityCheck: true,
        theme: "default",
        colors: null,
        defaults: {
          layout: "columns",
          colorTheme: "auto"
        },
        message: null,
        links: [],
        services: [],
        proxy: null
      };
    }
  }
});
