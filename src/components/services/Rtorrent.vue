<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down">
            <i class="fas fa-download"></i> {{ downRate }}
          </span>
          <span class="up"> <i class="fas fa-upload"></i> {{ upRate }} </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <span v-if="!error" class="count"
        >{{ count }}
        <template v-if="count === 1">torrent</template>
        <template v-else>torrents</template>
      </span>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';
import { formatSpeed } from '@/utils/formatters.js';

export default {
  name: "RTorrent",
  props: { item: Object },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    // Properties for download, upload, torrent count and errors.
    const dl = ref(null);
    const ul = ref(null);
    const count = ref(null);
    const error = ref(null);

    // Computed properties for rate labels.
    const downRate = computed(() => {
      return formatSpeed(dl.value);
    });

    const upRate = computed(() => {
      return formatSpeed(ul.value);
    });

    // Combined method for scheduler - fetches both rates and count
    const fetchAllData = async () => {
      await fetchRates();
      await fetchCount();
    };

    // Perform two calls to XML-RPC service and fetch download
    // and upload rates. Values are saved to `ul` and `dl`
    // properties.
    const fetchRates = async () => {
      await getRate("throttle.global_up.rate")
        .then((ulRate) => (ul.value = ulRate))
        .catch(() => (error.value = true));

      await getRate("throttle.global_down.rate")
        .then((dlRate) => (dl.value = dlRate))
        .catch(() => (error.value = true));
    };

    // Perform a call to XML-RPC service to fetch number of
    // torrents.
    const fetchCount = async () => {
      await getCount().catch(() => (error.value = true));
    };

    // Fetch a numeric value from XML-RPC service by requesting
    // specified method name and parsing XML. The response
    // is expected to adhere to structure of a single numeric
    // value.
    const getRate = async (methodName) => {
      return await getXml(methodName).then((xml) =>
        parseInt(
          xml.getElementsByTagName("value")[0].firstChild.textContent,
          10,
        ),
      );
    };

    // Fetch number of torrents by requesting download list
    // and counting number of entries therein.
    const getCount = async () => {
      return await getXml("download_list").then((xml) => {
        const arrayEl = xml.getElementsByTagName("array");
        count.value = arrayEl
          ? arrayEl[0].getElementsByTagName("value").length
          : 0;
      });
    };

    // Perform a call to XML-RPC service and parse response
    // as XML, which is then returned.
    const getXml = async (methodName) => {
      const headers = { "Content-Type": "text/xml" };

      if (props.item.username && props.item.password) {
        headers["Authorization"] =
          `${props.item.username}:${props.item.password}`;
      }

      const response = await fetch(`${props.item.xmlrpc.replace(/\/$/, "")}/RPC2`, {
        method: "POST",
        headers,
        body: `<methodCall><methodName>${methodName}</methodName></methodCall>`,
      });

      if (!response.ok) {
        throw Error(response.statusText);
      }

      const text = await response.text();
      return new DOMParser().parseFromString(text, "text/xml");
    };

    // Initialize auto-update
    initAutoUpdate(fetchAllData);

    // Fetch initial values.
    fetchAllData();

    return {
      dl,
      ul,
      count,
      error,
      downRate,
      upRate,
      fetchAllData,
      fetchRates,
      fetchCount,
      getRate,
      getCount,
      getXml
    };
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}
.down {
  margin-right: 1em;
}
.count {
  color: var(--text);
  font-size: 0.8em;
}
</style>
