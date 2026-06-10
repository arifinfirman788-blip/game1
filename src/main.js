import { createApp } from "vue";
import Vant from "vant";
import "vant/lib/index.css";
import App from "./App.vue";
import "./styles.css";

// 开发和测试环境启用 vConsole 调试
if (import.meta.env.VITE_ENV === 'development' || import.meta.env.VITE_ENV === 'staging') {
  import('vconsole').then(module => {
    new module.default();
  });
}

createApp(App).use(Vant).mount("#app");
