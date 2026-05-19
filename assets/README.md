# 素材替换说明

当前 H5 底座使用 CSS 占位图形和文字棋子。生成正式素材后，建议按下面目录命名，再到 `game.js` 顶部的 `ASSETS` 对象中填写路径。

## 建议目录

```text
assets/
  backgrounds/
    huangguoshu.webp
    xijiang-miao-village.webp
  pieces/
    chili.webp
    bluecake.webp
    greenroll.webp
    yellowcake.webp
    rosejar.webp
    fish.webp
  blockers/
    ice.webp
    chain.webp
    crate.webp
  boosters/
    hammer.webp
    bottle.webp
    flower.webp
    mask.webp
    hand.webp
  characters/
    huangxiaoxi-normal.webp
    huangxiaoxi-happy.webp
    huangxiaoxi-thinking.webp
```

## 替换入口

打开 `game.js`，修改文件顶部：

```js
const ASSETS = {
  pieces: {
    chili: "./assets/pieces/chili.webp",
    bluecake: "./assets/pieces/bluecake.webp",
    greenroll: "./assets/pieces/greenroll.webp",
    yellowcake: "./assets/pieces/yellowcake.webp",
    rosejar: "./assets/pieces/rosejar.webp",
    fish: "./assets/pieces/fish.webp",
  },
  boosters: {
    hammer: "./assets/boosters/hammer.webp",
    bottle: "./assets/boosters/bottle.webp",
    flower: "./assets/boosters/flower.webp",
    mask: "./assets/boosters/mask.webp",
    hand: "./assets/boosters/hand.webp",
  },
  blockers: {
    ice: "./assets/blockers/ice.webp",
    chain: "./assets/blockers/chain.webp",
    crate: "./assets/blockers/crate.webp",
  },
  guide: {
    normal: "./assets/characters/huangxiaoxi-normal.webp",
    happy: "./assets/characters/huangxiaoxi-happy.webp",
    thinking: "./assets/characters/huangxiaoxi-thinking.webp",
  },
  background: "./assets/backgrounds/huangguoshu.webp",
};
```

棋子替换后会自动隐藏文字，占位圆形仍保留阴影和动效。背景、角色、障碍物和道具图标也已经接入替换入口。

## 动效说明

当前底座已内置以下消除反馈，替换素材后仍会自动生效：

- 相邻交换：棋子从原格滑入新格。
- 无效交换：棋子滑回原位。
- 三消命中：棋子发亮、缩放爆开。
- 消除爆点：每个命中格生成光圈和粒子。
- 分数反馈：消除中心出现飘分。
- 连锁消除：第二轮及以后出现连消提示。
- 掉落补位：旧棋子下落，新棋子从上方入场。
- 银锤道具：敲击目标时使用同一套爆开和掉落反馈。

这些动效都在 `styles.css` 的 `@keyframes` 和 `game.js` 的消除时序中控制。后续只替换图片素材，不需要重写动画逻辑。
