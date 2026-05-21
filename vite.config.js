import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import viteImagemin from "vite-plugin-imagemin";
import viewport from "postcss-mobile-forever";

export default defineConfig({
  base: process.env.VITE_BASE || "/",
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
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 80,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: "removeViewBox",
          },
          {
            name: "removeEmptyAttrs",
            active: false,
          },
        ],
      },
      webp: {
        quality: 80,
      },
    }),
  ],
});
