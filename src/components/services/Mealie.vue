<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="mealtext">
          {{ mealtext }}
        </template>
        <template v-else-if="statsText">
          {{ statsText }}
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Mealie",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const stats = ref(null);
    const meal = ref(null);

    const mealtext = computed(() => {
      if (meal.value && meal.value.length > 0) {
        return `Today: ${meal.value[0].recipe.name}`;
      }
      return null;
    });

    const statsText = computed(() => {
      if (stats.value) {
        return `Happily keeping ${stats.value.totalRecipes} recipes organized`;
      }
      return null;
    });

    const fetchStatus = async () => {
      const headers = {
        Authorization: "Bearer " + props.item.apikey,
        Accept: "application/json",
      };

      if (props.item.subtitle != null) return;

      try {
        meal.value = await fetch("/api/groups/mealplans/today", {
          headers,
        });
      } catch (e) {
        console.log(e);
      }

      try {
        stats.value = await fetch("/api/admin/about/statistics", {
          headers,
        });
      } catch (e) {
        console.log(e);
      }
    };

    fetchStatus();

    return {
      stats,
      meal,
      mealtext,
      statsText,
      fetchStatus
    };
  },
};
</script>
