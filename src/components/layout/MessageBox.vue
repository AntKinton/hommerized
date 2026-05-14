<template>
  <div v-if="show" class="card message-banner mb-6" :class="getMessageClasses()">
    <header v-if="message.title || message.icon" class="card-header is-shadowless">
      <div class="card-header-title is-flex is-align-items-center py-3">
        <span class="icon is-medium mr-2" v-if="message.icon">
          <i :class="['fas', message.icon]"></i>
        </span>
        <span class="title is-5 mb-0">{{ message.title }}</span>
      </div>
    </header>
    <div
      v-if="message.content"
      class="card-content py-4"
    >
      <div class="content" v-html="message.content"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "MessageBox",
  props: {
    item: Object,
  },
  data: function () {
    return {
      message: {},
    };
  },
  computed: {
    show: function () {
      return this.message.title || this.message.content;
    },
  },
  watch: {
    item: function (item) {
      this.message = Object.assign({}, item);
    },
  },
  created: async function () {
    // Look for a new message if an endpoint is provided.
    this.message = Object.assign({}, this.item);
    await this.getMessage();
  },
  methods: {
    getMessageClasses: function () {
      // Fallback a is-info si el usuario no define un estilo en el yml
      return this.message.style || 'is-info';
    },
    
    
    getMessage: async function () {
      if (!this.item) {
        return;
      }
      if (this.item.url) {
        let fetchedMessage = await this.downloadMessage(this.item.url);
        if (this.item.mapping) {
          fetchedMessage = this.mapRemoteMessage(fetchedMessage);
        }

        // keep the original config value if no value is provided by the endpoint
        const message = this.message;
        for (const prop of ["title", "style", "content", "icon"]) {
          if (prop in fetchedMessage && fetchedMessage[prop] !== null) {
            message[prop] = fetchedMessage[prop];
          }
        }
        this.message = { ...message }; // Force computed property to re-evaluate
      }

      if (this.item.refreshInterval) {
        setTimeout(this.getMessage, this.item.refreshInterval);
      }
    },

    downloadMessage: function (url) {
      return fetch(url, { headers: { Accept: "application/json" } }).then(
        function (response) {
          if (response.status != 200) {
            return;
          }
          return response.json();
        },
      );
    },

    mapRemoteMessage: function (message) {
      let mapped = {};
      // map property from message into mapped according to mapping config (only if field has a value):
      for (const prop in this.item.mapping)
        if (message[this.item.mapping[prop]])
          mapped[prop] = message[this.item.mapping[prop]];
      return mapped;
    },
  },
};
</script>
