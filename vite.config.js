import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import viewport from "postcss-mobile-forever";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE || "/",
    server: {
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'https://scenicagent-h5-game-test.aihuangxiaoxi.com/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
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