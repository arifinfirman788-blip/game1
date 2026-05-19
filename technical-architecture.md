# 贵州文旅三消 H5 技术架构文档

## 1. 项目定位

本项目为微信/浏览器扫码进入的 H5 三消小游戏页面，核心链路为：

```text
扫码进入首页 -> 选择关卡页面 -> 单关游戏详情页
```

当前已按 Vue 单页应用方式重构，后续素材替换、接口接入、关卡地图和运营活动都基于该架构继续扩展。

## 2. 技术栈

| 模块 | 技术 |
| --- | --- |
| 前端框架 | Vue 3.2 |
| 构建工具 | Vite |
| UI 组件库 | Vant UI |
| 页面类型 | H5 单页应用 |
| 语言 | JavaScript |
| 样式 | CSS |
| 状态管理 | 当前使用 Vue Composition API，后续可升级 Pinia |
| 动画 | CSS keyframes + Vue 状态驱动 |

## 3. Vant UI 使用要求

通用 UI 优先使用 Vant 组件，不手写重复基础组件。

当前已使用或预留使用：

- `van-button`：首页按钮、关卡按钮、道具按钮、规则按钮。
- `van-icon`：设置、奖励、返回、规则说明等图标。
- `van-dialog`：设置、奖励、规则、通关、失败提示。
- `showToast`：轻提示。
- `showLoadingToast`：进入关卡 Loading。
- `van-progress`：章节进度。
- `van-tabs` / `van-tab`：7 大章节切换。
- `van-grid` / `van-grid-item`：首页数据概览、关卡节点列表。
- `van-badge`：道具数量角标。
- `van-nav-bar`：选关页顶部导航。

后续表单、列表、弹层也应优先使用：

- `van-list`：排行榜、奖励记录、任务列表。
- `van-form` / `van-field`：用户信息补充、手机号授权后的资料填写。
- `van-popup`：道具详情、景区介绍、活动弹层。
- `van-loading`：接口请求或资源加载。
- `van-empty`：无记录状态。

## 4. 当前目录结构

```text
.
├── index.html
├── package.json
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── styles.css
│   ├── config/
│   │   ├── assets.js
│   │   └── levels.js
│   └── composables/
│       └── useMatch3Game.js
├── assets/
│   └── README.md
├── app-flow.md
├── level-design.md
└── technical-architecture.md
```

## 5. 前端模块说明

### `src/App.vue`

负责页面视图和用户交互：

- 首页
- 选关页
- 单关游戏页
- Vant Dialog / Toast / Loading 调用
- URL 参数切换

### `src/composables/useMatch3Game.js`

负责三消核心玩法：

- 棋盘生成
- 棋子交换
- 有效消除判断
- 连锁消除
- 掉落补位
- 道具触发
- 分数与星级
- 通关与失败判断
- 消除动效状态

### `src/composables/usePlayerProgress.js`

负责玩家进度与奖励状态，当前使用 `localStorage` 临时存储，后续可替换为后端接口：

- 已解锁最高关卡
- 当前关卡
- 每关历史最高星级
- 每章宝箱领取状态
- 道具库存
- 道具领取和消耗
- 通关后星级回写

### `src/config/levels.js`

负责关卡规则：

- 7 大章 x 100 小关
- 障碍加入节奏
- 步数生成
- 目标生成
- 三星分数生成
- 4 连、复合 4 连、5 连特殊棋子生成规则
- 道具奖励表和库存规则可由后端配置化下发

### `src/config/assets.js`

负责素材路径映射：

- 棋子
- 障碍
- 道具
- 黄小西角色
- 背景

生成正式素材后优先在这里替换路径。

## 6. 后端是否需要

结论：正式上线建议需要后端；纯展示 Demo 或本地试玩可以暂时不需要。

### 可以先不接后端的内容

这些内容可以由前端本地完成：

- 三消玩法逻辑
- 关卡规则生成
- 页面跳转
- 素材展示
- 本地最高关卡缓存
- 本地道具数量缓存
- 临时星级记录
- 选关页星级回显
- 未解锁关卡锁定
- 路线宝箱奖励节点

可使用 `localStorage` 临时保存：

```text
currentLevel
unlockedLevel
levelStars
boosterInventory
```

### 正式上线建议接后端的内容

正式运营、文旅活动、扫码传播场景建议接后端：

- 用户身份识别
- 微信授权登录
- 关卡进度云端保存
- 道具库存
- 每日奖励
- 活动任务
- 排行榜
- 景区纪念章收集
- 防作弊校验
- 数据埋点

## 7. 推荐后端架构

| 模块 | 建议 |
| --- | --- |
| API 类型 | REST API |
| 登录 | 微信 OAuth / 小程序 WebView 授权 / 短 token |
| 数据库 | MySQL / PostgreSQL |
| 缓存 | Redis，可用于排行榜和活动计数 |
| 静态资源 | CDN |
| 管理后台 | 关卡配置、活动配置、奖励配置、数据统计 |

## 8. 建议接口清单

### 用户初始化

```http
GET /api/game/bootstrap
```

返回：

```json
{
  "user": {
    "id": "u_001",
    "nickname": "游客",
    "avatar": ""
  },
  "progress": {
    "unlockedLevel": 128,
    "currentLevel": 128,
    "stars": {
      "1": 3,
      "2": 2
    }
  },
  "inventory": {
    "hammer": 12,
    "bottle": 8,
    "flower": 6,
    "mask": 5,
    "hand": 7
  }
}
```

### 提交通关结果

```http
POST /api/game/level/complete
```

请求：

```json
{
  "level": 128,
  "score": 15680,
  "stars": 3,
  "movesLeft": 4,
  "usedBoosters": {
    "hammer": 1
  }
}
```

返回：

```json
{
  "ok": true,
  "unlockedLevel": 129,
  "rewards": [
    {
      "type": "coin",
      "count": 100
    }
  ]
}
```

### 领取宝箱奖励

```http
POST /api/game/reward/claim
```

请求：

```json
{
  "chapter": 1,
  "rewardLevel": 10
}
```

返回：

```json
{
  "ok": true,
  "rewards": {
    "hammer": 1,
    "bottle": 1
  },
  "inventory": {
    "hammer": 13,
    "bottle": 9,
    "flower": 6,
    "mask": 5,
    "hand": 7
  }
}
```

### 消耗道具

```http
POST /api/game/booster/use
```

请求：

```json
{
  "level": 128,
  "booster": "hammer",
  "clientActionId": "act_001"
}
```

返回：

```json
{
  "ok": true,
  "inventory": {
    "hammer": 12,
    "bottle": 9,
    "flower": 6,
    "mask": 5,
    "hand": 7
  }
}
```

说明：正式上线时，前端可以先做本地动效反馈，但最终库存以服务端返回为准，避免刷新、重复点击或异常结算导致库存不一致。

### 获取排行榜

```http
GET /api/game/rank?scope=daily
```

### 领取每日奖励

```http
POST /api/game/reward/daily
```

### 获取活动任务

```http
GET /api/game/activity/tasks
```

### 领取章节奖励

```http
POST /api/game/chapter/reward
```

## 9. 防作弊建议

H5 游戏逻辑运行在前端，不能完全防止篡改。正式运营时建议：

- 后端校验关卡号、步数、目标、分数是否在合理范围。
- 提交通关结果时带上关卡开始时间、结束时间、使用道具数量。
- 对异常高分、极短通关时间做风控。
- 排行榜只使用后端认可的数据。
- 重要奖励由后端发放，不由前端直接决定。

## 10. 分期建议

### 第一阶段：前端 Demo

- Vue 3.2 + Vant UI 页面完成。
- 本地关卡逻辑完成。
- 素材替换完成。
- 本地存档。

### 第二阶段：轻后端

- 用户初始化。
- 云端存档。
- 通关结果提交。
- 道具库存。

### 第三阶段：运营能力

- 每日奖励。
- 活动任务。
- 排行榜。
- 景区纪念章。
- 后台配置。

## 11. 运行方式

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

构建：

```bash
npm run build
```
