<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <div class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <div class="select is-small">
          <select v-model="theme" @change="switchTheme">
            <option value="" disabled selected>Available themes</option>
            <option value="theme-classic">classic</option>
            <option value="theme-neon">neon</option>
            <option value="theme-walkxcode">walkxcode</option>
          </select>
        </div>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';

let currentTheme;
const app = document.getElementById("app");

export default {
  name: "ThemeChooser",
  props: {
    item: Object,
  },
  setup() {
    const theme = ref(null);

    currentTheme = Array.from(app.classList).filter((word) =>
      word.startsWith("theme-"),
    )[0];
    theme.value = currentTheme;

    const switchTheme = () => {
      app.classList.replace(currentTheme, theme.value);
      currentTheme = theme.value;
    };

    return {
      theme,
      switchTheme
    };
  },
};
</script>

<style scoped lang="scss">
.select,
select {
  width: 100%;
  background-color: var(--card-background);
}
</style>
