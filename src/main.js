import "./assets/app.scss";
import { createApp, h } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

import Generic from "./components/services/Generic.vue";

app
  .component("Generic", Generic)
  .component("DynamicStyle", (_props, context) => {
    return h("style", {}, context.slots);
  });

app.mount("#app-mount");
