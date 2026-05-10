<template>
  <Generic v-for="bookmark in bookmarks" :key="bookmark.name" :item="bookmark">
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';
import Generic from "./Generic.vue";

export default {
  name: "Linkding",
  components: {
    Generic,
  },
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const bookmarks = ref([]);

    const calculatedLimit = computed(() => {
      const limit = parseInt(props.item.limit) || 5;
      return Math.min(Math.max(limit, 1), 15);
    });

    const fetchBookmarks = async () => {
      const headers = {
        Authorization: `Token ${props.item.token}`,
        Accept: "application/json",
      };

      let query = "";
      if (props.item.query) {
        query = `&q=${encodeURIComponent(props.item.query)}`;
      }

      let url = `/api/bookmarks/?limit=${calculatedLimit.value}${query}`;

      try {
        const ld_response = await fetch(url, {
          headers,
        });
        bookmarks.value = ld_response.results.map((bookmark) => ({
          name: `${bookmark.title}`,
          subtitle: `${bookmark.description}`,
          url: bookmark.url,
          logo: `${bookmark.favicon_url}`,
          tag: `${bookmark.tag_names.join(" #")}`,
        }));
      } catch (e) {
        console.log(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchBookmarks);

    // Initial data fetch
    fetchBookmarks();

    return {
      bookmarks,
      calculatedLimit,
      fetchBookmarks
    };
  },
};
</script>
