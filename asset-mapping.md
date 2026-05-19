# 详情页素材映射

素材来源：

```text
/Users/chenyinbing/Downloads/消消乐切图
```

当前已复制到：

```text
public/assets/detail/
```

## 棋子

| 原文件 | 项目文件 | 用途 |
| --- | --- | --- |
| 图层 3.png | `public/assets/detail/pieces/chili.png` | 红色辣椒 / 肠旺辣椒棋子 |
| 图层 4.png | `public/assets/detail/pieces/bluecake.png` | 蓝靛粑棋子 |
| 图层 5.png | `public/assets/detail/pieces/greenroll.png` | 丝娃娃 / 绿色棋子 |
| 图层 6.png | `public/assets/detail/pieces/yellowcake.png` | 黄粑棋子 |
| 图层 7.png | `public/assets/detail/pieces/rosejar.png` | 玫瑰糖罐棋子 |
| 图层 8.png | `public/assets/detail/pieces/fish.png` | 酸汤鱼棋子 |
| 图层 22.png | `public/assets/detail/pieces/silver-cross.png` | 特殊银饰棋子预留 |

## 特殊棋子

| 原文件 | 项目文件 | 用途 |
| --- | --- | --- |
| 9副本.png | `public/assets/detail/specials/glow.png` | 4 连光晕奖励，叠加在当前食物棋子周围 |
| 7副本.png | `public/assets/detail/specials/line-bomb.png` | 复合 4 连炸弹奖励，交换后清除九宫格 |
| 8副本.png | `public/assets/detail/specials/rainbow.png` | 5 连彩虹球，交换后触发同类或组合消除 |

## 道具

| 原文件 | 项目文件 | 用途 |
| --- | --- | --- |
| 图层 23.png | `public/assets/detail/boosters/hammer.png` | 银锤 |
| 图层 24.png | `public/assets/detail/boosters/bottle.png` | 蜡染宝瓶 |
| 图层 25.png | `public/assets/detail/boosters/flower.png` | 银花 |
| 图层 26.png | `public/assets/detail/boosters/mask.png` | 傩戏面具 |
| 图层 27.png | `public/assets/detail/boosters/hand.png` | 银饰手掌 |

## 角色与 UI

| 原文件 | 项目文件 | 用途 |
| --- | --- | --- |
| 图层 12.png | `public/assets/detail/characters/huangxiaoxi.png` | 黄小西角色 |
| 图层 11.png | `public/assets/detail/ui/board.png` | 棋盘框 |
| 图层 43.png | `public/assets/detail/ui/chapter-building.png` | 章节建筑图标预留 |

## 代码接入位置

- 素材路径配置：[src/config/assets.js](/Users/chenyinbing/Documents/Codex/2026-05-19/files-mentioned-by-the-user-ff5a2eb964527148c40919a8a58385f2/src/config/assets.js)
- 详情页模板：[src/App.vue](/Users/chenyinbing/Documents/Codex/2026-05-19/files-mentioned-by-the-user-ff5a2eb964527148c40919a8a58385f2/src/App.vue)
- 样式适配：[src/styles.css](/Users/chenyinbing/Documents/Codex/2026-05-19/files-mentioned-by-the-user-ff5a2eb964527148c40919a8a58385f2/src/styles.css)

## 当前接入状态

- 棋子：已接入，优先显示真实 PNG。
- 道具：已接入，优先显示真实 PNG。
- 黄小西：已接入，替换占位 CSS 角色。
- 棋盘框：已接入。
- 顶部标题牌：已接入。
- 底部道具栏：已接入。
- 特殊棋子：已接入，光晕、炸弹、彩虹球分别使用独立素材；炸弹和彩虹球不叠加光晕。

未接入或预留：

- 冰块、木箱、银链障碍物暂无明确切图，当前继续使用 CSS 占位效果。
- 黄果树详情页背景已接入移动端压缩版 `public/assets/detail/backgrounds/huangguoshu-detail-bg-mobile.jpg`，由原始 15MB PNG 优化为约 276KB JPG。
