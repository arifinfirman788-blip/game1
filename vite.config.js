import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import viewport from "postcss-mobile-forever";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE || "/",
    server: {
      proxy: {
        '/game/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          viewport({
            viewportWidth: 393,
            maxDisplayWidth: 430,
            rootSelector: "#app",
            border: true,
          }),
        ],
      },
    },
    plugins: [
      vue()
    ],
  };
});
