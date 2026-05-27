import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import viteImagemin from "vite-plugin-imagemin";
import viewport from "postcss-mobile-forever";

export default defineConfig({
  base: process.env.VITE_BASE || "/",
  server: {
    proxy: {
      '/game/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        viewport({
          viewportWidth: 393, // 设计稿宽度（常见iPhone 14/15 宽度为393或375）
          maxDisplayWidth: 430, // 桌面端最大显示宽度
          rootSelector: "#app", // 限制在 app 根节点
          border: true, // 桌面端显示边框
        }),
      ],
    },
  },
  plugins: [
    vue(),
    // viteImagemin 已禁用 — Windows 下原生二进制编译失败，生产构建时可在 CI 中启用
  ],
});
