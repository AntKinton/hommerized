//import "./assets/app.scss";
import './styles/main.scss';
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

// Importar componentes base para registro global
import GroupDescription from "./components/layout/GroupDescription.vue";
import ServiceHandler from "./components/ServiceHandler.vue";
import GroupServices from "./components/layout/GroupServices.vue";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// Registro global para evitar problemas de resolución circular
app.component("GroupDescription", GroupDescription);
app.component("ServiceHandler", ServiceHandler);
app.component("GroupServices", GroupServices);

//import Generic from "./components/services/Generic.vue";

/*app
  .component("Generic", Generic)
  .component("DynamicStyle", (_props, context) => {
    return h("style", {}, context.slots);
  });*/

app.mount("#app-mount");
