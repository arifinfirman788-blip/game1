<template>
  <main class="phone-shell" aria-label="贵州文旅三消游戏">
    <section class="game-scene" :class="{ 'has-scene-image': currentSceneImage }" :style="sceneStyle">
      <div class="mountain-layer" aria-hidden="true"></div>
      <div class="village-layer" aria-hidden="true"></div>

      <section v-if="screen === 'home'" class="home-screen">
        <header class="home-top">
          <van-button round icon="setting-o" class="vant-round" aria-label="设置" @click="openSettings" />
          <span class="home-pill">贵州文旅三消</span>
          <van-button round icon="gift-o" class="vant-round" aria-label="奖励" @click="openGift" />
        </header>

        <div class="home-hero">
          <div class="home-title-card">
            <p>黄小西的晚饭地图</p>
            <h1>黄小西带你游贵州</h1>
            <span>边吃边闯关，收集多彩贵州景区纪念章</span>
          </div>
          <div class="home-guide" aria-hidden="true">
            <div class="guide-character home-character" :class="{ 'has-image': assetManifest.guide.normal }" :style="guideImageStyle">
              <div class="silver-crown"></div>
              <div class="guide-face"></div>
              <div class="guide-body"></div>
            </div>
          </div>
        </div>

        <div class="home-actions">
          <van-button block round type="primary" class="start-button" @click="goMap">开始旅行</van-button>
          <van-button block round type="warning" class="continue-button" @click="goGame(game.state.currentLevel)">
            继续第 {{ game.state.currentLevel }} 关
          </van-button>
        </div>

        <van-grid :border="false" :column-num="3" class="home-summary">
          <van-grid-item text="大景区"><strong>7</strong></van-grid-item>
          <van-grid-item text="小关卡"><strong>700</strong></van-grid-item>
          <van-grid-item text="星挑战"><strong>3</strong></van-grid-item>
        </van-grid>
      </section>

      <section v-else-if="screen === 'map'" class="map-screen">
        <van-nav-bar title="多彩贵州 · 山水人文之旅" left-arrow @click-left="goHome">
          <template #right>
            <van-icon name="wap-nav" size="24" @click="openMapInfo" />
          </template>
        </van-nav-bar>

        <section class="chapter-panel">
          <div class="chapter-list" aria-label="7大关">
            <van-button
              v-for="(chapter, index) in chapters"
              :key="chapter.id"
              block
              class="chapter-list-button"
              :class="{ active: index === game.state.selectedChapterIndex }"
              @click="game.state.selectedChapterIndex = index"
            >
              <span>{{ index + 1 }}</span>{{ chapter.name }}
            </van-button>
          </div>

          <div class="chapter-visual">
            <span>第 {{ game.state.selectedChapterIndex + 1 }} 章</span>
            <h3>{{ selectedChapter.title.replace(/^第.章\s*/, "") }}</h3>
            <p>{{ selectedChapter.scenicSpot }} · {{ selectedChapter.featureFood }}</p>
            <div class="food-strip">
              <span v-for="piece in chapterFoods" :key="piece.id" class="food-token" :class="piece.id">{{ piece.text }}</span>
            </div>
          </div>

          <div class="chapter-speed">
            <p>米火关进度</p>
            <strong><van-icon name="star" /> {{ chapterStarTotal }}/300</strong>
            <van-progress :percentage="chapterStarPercent" stroke-width="10" color="#85c341" :show-pivot="false" />
          </div>
        </section>

        <section class="map-body">
          <div class="route-map">
            <button
              v-for="level in visibleChapterLevels"
              :key="level.globalLevel"
              type="button"
              class="level-node"
              :class="{
                'is-current': level.globalLevel === game.state.currentLevel,
                'is-boss': level.localLevel % 10 === 0,
                locked: !player.isUnlocked(level.globalLevel),
              }"
              :style="routeNodeStyle(level)"
              @click="handleLevelNode(level)"
            >
              <span>{{ level.localLevel }}</span>
              <small v-if="player.isUnlocked(level.globalLevel)" class="node-stars">
                <i v-for="index in 3" :key="index" :class="{ lit: player.getStars(level.globalLevel) >= index }">★</i>
              </small>
              <van-icon v-else name="lock" class="node-lock" />
            </button>

            <button
              v-for="reward in visibleRewards"
              :key="reward.localLevel"
              type="button"
              class="reward-chest"
              :class="{ claimable: player.isRewardClaimable(game.state.selectedChapterIndex, reward.localLevel), claimed: player.isRewardClaimed(game.state.selectedChapterIndex, reward.localLevel) }"
              :style="routeNodeStyle(reward)"
              @click="claimChapterReward(reward)"
            >
              🎁
            </button>
          </div>

          <aside class="guide-rules">
            <h3>玩法说明</h3>
            <van-list>
              <div v-for="rule in mapRules" :key="rule.title" class="rule-item">
                <span>{{ rule.index }}</span>
                <div>
                  <strong>{{ rule.title }}</strong>
                  <p>{{ rule.text }}</p>
                </div>
              </div>
            </van-list>
          </aside>
        </section>

        <aside class="map-guide">
          <div class="guide-character" :class="{ 'has-image': assetManifest.guide.normal }" :style="guideImageStyle" aria-hidden="true">
            <div class="silver-crown"></div>
            <div class="guide-face"></div>
            <div class="guide-body"></div>
          </div>
          <div class="guide-bubble">美景、美食、文化一周打尽！一起开启多彩贵州之旅。</div>
        </aside>

        <footer class="map-footer">
          <van-button icon="orders-o" type="primary" round>关卡</van-button>
          <van-button icon="gift-o" type="warning" round @click="openGift">奖励</van-button>
        </footer>
      </section>

      <section v-else class="play-screen">
        <header class="top-hud">
          <div class="hud-side left">
            <van-button round icon="setting-o" class="vant-round" aria-label="设置" @click="openSettings" />
            <span>设置</span>
          </div>
          <div class="title-plaque">黄小西带你游贵州</div>
          <div class="hud-side right">
            <van-button round class="vant-round pause-round" aria-label="暂停" @click="goMap">Ⅱ</van-button>
            <span>暂停</span>
          </div>

          <div class="mission-panel">
            <div class="goal-card">
              <p class="panel-label">关卡目标</p>
              <p v-if="game.state.goalsCompleted && currentStarCount < 3" class="goal-cleared">目标完成，冲三星</p>
              <div class="goal-list">
                <div v-for="item in topGoalSlots" :key="item.id" class="goal-item" :class="{ empty: item.empty }">
                  <template v-if="!item.empty">
                    <span class="goal-icon">
                      <img v-if="goalImage(item.goal)" :src="goalImage(item.goal)" :alt="game.getGoalConfig(item.goal).label" />
                      <template v-else>{{ game.getGoalConfig(item.goal).icon }}</template>
                    </span>
                    <span class="goal-count">{{ Math.max(item.count, 0) }}</span>
                  </template>
                </div>
              </div>
            </div>
            <div class="moves-card">
              <p class="panel-label">剩余步数</p>
              <strong>{{ game.state.movesLeft }}</strong>
            </div>
            <div class="score-card">
              <p class="panel-label">分数：{{ game.state.score.toLocaleString("zh-CN") }}</p>
              <div class="star-meter">
                <span class="meter-fill" :style="{ width: `${starProgressPercent}%` }"></span>
                <span v-for="index in 3" :key="index" class="star" :class="[`star-${index}`, { lit: currentStarCount >= index }]"></span>
              </div>
            </div>
          </div>
          <span id="levelLabel">第 {{ game.state.levelConfig.globalLevel }} 关</span>
        </header>

        <section class="board-wrap">
          <div class="game-board asset-board">
            <button
              v-for="cell in flatBoard"
              :key="`${cell.row}-${cell.col}`"
              class="cell"
              :class="{ selected: isSelected(cell), clearing: game.state.effects.clearing.has(cellKey(cell)) }"
              :disabled="game.state.busy"
              @click="game.selectCell(cell)"
            >
              <span v-if="cell.type" class="piece" :class="[cell.type, specialClass(cell), pieceEffectClass(cell)]" :style="pieceStyle(cell)">
                {{ pieceText(cell.type) }}
                <span v-if="cell.special" class="special-mark" aria-hidden="true"></span>
              </span>
              <span v-if="cell.blocker" class="blocker" :class="cell.blocker">{{ blockers[cell.blocker].icon }}</span>
              <span v-for="ring in ringsForCell(cell)" :key="ring.id" class="match-ring"></span>
              <span
                v-for="particle in particlesForCell(cell)"
                :key="particle.id"
                class="particle"
                :style="particleStyle(particle)"
              ></span>
            </button>
            <span
              v-for="score in game.state.effects.floatScores"
              :key="score.id"
              class="float-score"
              :style="{ '--score-x': score.x, '--score-y': score.y }"
            >
              +{{ score.amount }}
            </span>
            <span v-if="game.state.effects.combo" class="combo-banner">{{ game.state.effects.combo.text }}</span>
          </div>
        </section>

        <aside class="guide-wrap">
          <div class="guide-character" :class="{ 'has-image': assetManifest.guide.normal }" :style="guideImageStyle" aria-hidden="true">
            <div class="silver-crown"></div>
            <div class="guide-face"></div>
            <div class="guide-body"></div>
          </div>
          <div class="guide-bubble">{{ game.state.guideText }}</div>
        </aside>

        <footer class="bottom-hud">
          <div class="booster-bar">
            <van-button
              v-for="booster in boosters"
              :key="booster.id"
              round
              class="booster"
              :class="{ active: game.state.activeBooster === booster.id }"
              @click="game.activateBooster(booster.id)"
            >
              <span class="booster-icon">
                <img v-if="booster.image" :src="booster.image" :alt="booster.id" />
                <template v-else>{{ booster.icon }}</template>
              </span>
              <van-badge :content="booster.count" class="badge-anchor" />
            </van-button>
          </div>
          <div class="travel-progress">
            <img class="chapter-building" :src="assetManifest.ui.chapterBuilding" alt="" />
            <span class="chapter-name">{{ game.state.levelConfig.chapter.title }}</span>
            <div class="chapter-meter">
              <span :style="{ width: `${chapterProgressPercent}%` }"></span>
              <strong>{{ game.state.levelConfig.localLevel }}/100</strong>
            </div>
            <van-button size="small" round type="warning" class="treasure-claim">
              <img :src="assetManifest.ui.treasureChest" alt="" />
              <span>10关领取</span>
            </van-button>
          </div>
          <div class="level-tools">
            <van-button size="small" round @click="changeLevel(game.state.currentLevel - 1)">上一关</van-button>
            <van-button size="small" round type="primary" @click="openLevelInfo">规则</van-button>
            <van-button size="small" round @click="changeLevel(game.state.currentLevel + 1)">下一关</van-button>
          </div>
        </footer>
      </section>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, watch, watchEffect } from "vue";
import { showDialog, showLoadingToast, showToast } from "vant";
import { blockers, chapters, LEVELS_PER_CHAPTER, pieces, TOTAL_LEVELS } from "./config/levels";
import { assetManifest } from "./config/assets";
import { useMatch3Game } from "./composables/useMatch3Game";
import { usePlayerProgress } from "./composables/usePlayerProgress";

const params = new URLSearchParams(window.location.search);
const initialLevel = Number(params.get("level")) || 128;
const screen = ref(params.has("level") ? "game" : params.get("screen") === "map" ? "map" : "home");
const player = usePlayerProgress();
const game = useMatch3Game(initialLevel, {
  onLevelComplete: handleLevelComplete,
  getBoosterCount: (booster) => player.progress.inventory[booster] || 0,
});
if (!params.has("level")) {
  game.changeLevel(player.progress.currentLevel);
}
const boosters = [
  { id: "hammer", icon: "🔨", image: assetManifest.boosters.hammer },
  { id: "bottle", icon: "🏺", image: assetManifest.boosters.bottle },
  { id: "flower", icon: "✿", image: assetManifest.boosters.flower },
  { id: "mask", icon: "🎭", image: assetManifest.boosters.mask },
  { id: "hand", icon: "✋", image: assetManifest.boosters.hand },
].map((booster) => ({
  ...booster,
  get count() {
    return player.progress.inventory[booster.id] || 0;
  },
}));

const flatBoard = computed(() => game.state.board.flat());
const selectedChapter = computed(() => chapters[game.state.selectedChapterIndex]);
const currentStarCount = computed(() => game.starCount.value);
const starProgressPercent = computed(() => game.starProgress.value);
const chapterProgressPercent = computed(() => game.chapterProgress.value);
const chapterLevels = computed(() => {
  const start = game.state.selectedChapterIndex * LEVELS_PER_CHAPTER + 1;
  return Array.from({ length: LEVELS_PER_CHAPTER }, (_, index) => ({
    globalLevel: start + index,
    localLevel: index + 1,
  }));
});
const visibleChapterLevels = computed(() => chapterLevels.value.slice(0, 20));
const visibleRewards = computed(() =>
  [3, 10, 16].map((localLevel) => ({
    globalLevel: game.state.selectedChapterIndex * LEVELS_PER_CHAPTER + localLevel,
    localLevel,
  })),
);
const chapterStarTotal = computed(() =>
  chapterLevels.value.reduce((sum, level) => sum + player.getStars(level.globalLevel), 0),
);
const chapterStarPercent = computed(() => Math.round((chapterStarTotal.value / 300) * 100));
const chapterFoods = computed(() => pieces.slice(0, 6));
const topGoalSlots = computed(() => {
  const entries = Object.entries(game.state.goals).slice(0, 3).map(([goal, count]) => ({
    id: goal,
    goal,
    count,
    empty: false,
  }));
  while (entries.length < 3) {
    entries.push({ id: `empty-${entries.length}`, empty: true });
  }
  return entries;
});
const guideImageStyle = computed(() =>
  assetManifest.guide.normal ? { "--guide-image": `url("${assetManifest.guide.normal}")` } : {},
);
const currentSceneImage = computed(() => {
  if (screen.value !== "game") return assetManifest.background;
  return assetManifest.backgrounds?.[game.state.levelConfig.chapter.id] || assetManifest.background;
});
const sceneStyle = computed(() =>
  currentSceneImage.value ? { "--scene-image": `url("${currentSceneImage.value}")` } : {},
);
const preloadedImages = new Set();

watchEffect(() => {
  if (!currentSceneImage.value || preloadedImages.has(currentSceneImage.value)) return;
  preloadedImages.add(currentSceneImage.value);
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = currentSceneImage.value;
  document.head.appendChild(link);
});
const mapRules = [
  { index: 1, title: "通关策略", text: "匹配3个或更多美食，完成目标即可通关。" },
  { index: 2, title: "星级回显", text: "历史星级会显示在关卡节点下方。" },
  { index: 3, title: "奖励宝箱", text: "完成阶段关卡后，可领取路线上的宝箱。" },
  { index: 4, title: "关卡解锁", text: "完成当前关卡后自动解锁下一关。" },
  { index: 5, title: "障碍升级", text: "冰块、木箱、银链会随关卡进度逐步加入。" },
  { index: 6, title: "道具使用", text: "银锤等道具可在困难局面中破局。" },
  { index: 7, title: "三星挑战", text: "高分通关并保留步数，可获得更高最终分。" },
];

function goHome() {
  screen.value = "home";
  updateUrl("home");
}

function goMap() {
  screen.value = "map";
  updateUrl("map");
}

function goGame(level) {
  if (!player.isUnlocked(level)) {
    showToast("先完成前置关卡再来挑战吧");
    return;
  }
  const toast = showLoadingToast({ message: "加载关卡...", forbidClick: true, duration: 0 });
  game.changeLevel(level);
  screen.value = "game";
  updateUrl("game");
  window.setTimeout(() => toast.close(), 260);
}

function handleLevelComplete(result) {
  player.completeLevel(result.level, result.stars);
  const bonusText =
    result.bonusScore > 0
      ? `剩余 ${result.remainingMoves} 步已折算为 ${result.bonusScore} 分。`
      : "本关目标已全部完成。";

  showDialog({
    title: "关卡完成",
    message: `最终得分 ${result.finalScore.toLocaleString("zh-CN")}。${bonusText}`,
    confirmButtonText: result.isLastLevel ? "返回选关" : "进入下一关",
    cancelButtonText: "返回选关",
    showCancelButton: true,
  })
    .then(() => {
      if (result.isLastLevel) {
        goMap();
        return;
      }
      goGame(result.nextLevel);
    })
    .catch(() => {
      goMap();
    });
}

watch(
  () => game.state.boosterUsed,
  (booster) => {
    if (!booster) return;
    player.consumeBooster(booster);
    game.state.boosterUsed = null;
  },
);

function handleLevelNode(level) {
  goGame(level.globalLevel);
}

function routeNodeStyle(level) {
  const index = level.localLevel - 1;
  const row = Math.floor(index / 4);
  const col = index % 4;
  const reversedCol = row % 2 === 0 ? col : 3 - col;
  return {
    left: `${10 + reversedCol * 23}%`,
    top: `${5 + row * 18}%`,
  };
}

function claimChapterReward(reward) {
  if (player.isRewardClaimed(game.state.selectedChapterIndex, reward.localLevel)) {
    showToast("这个宝箱已经领取过啦");
    return;
  }
  const rewardItems = player.claimReward(game.state.selectedChapterIndex, reward.localLevel);
  if (!rewardItems) {
    showToast("完成前面的关卡后再来领取");
    return;
  }
  const rewardText = Object.entries(rewardItems)
    .map(([booster, count]) => `${boosterName(booster)} +${count}`)
    .join("、");
  showDialog({
    title: "领取成功",
    message: `获得 ${rewardText}，继续出发吧。`,
    confirmButtonText: "好",
  });
}

function boosterName(booster) {
  const names = {
    hammer: "银锤",
    bottle: "蜡染宝瓶",
    flower: "银花",
    mask: "傩戏面具",
    hand: "银饰手掌",
  };
  return names[booster] || "道具";
}

function changeLevel(level) {
  game.changeLevel(Math.min(TOTAL_LEVELS, Math.max(1, level)));
  updateUrl("game");
}

function updateUrl(target) {
  const url = new URL(window.location.href);
  if (target === "game") {
    url.searchParams.set("level", String(game.state.currentLevel));
    url.searchParams.delete("screen");
  } else if (target === "map") {
    url.searchParams.set("screen", "map");
    url.searchParams.delete("level");
  } else {
    url.searchParams.delete("screen");
    url.searchParams.delete("level");
  }
  window.history.replaceState({}, "", url);
}

function openSettings() {
  showDialog({ title: "设置", message: "音效、震动、账号授权等入口已经预留。" });
}

function openGift() {
  showDialog({ title: "今日奖励", message: "扫码进入可领取文旅小礼包，奖励系统入口已经预留。" });
}

function openMapInfo() {
  showDialog({ title: "关卡规则", message: "7 大景区，每个景区 100 小关。前期收集美食，随后逐步加入冰块、木箱和银链。" });
}

function openLevelInfo() {
  const config = game.state.levelConfig;
  const goalText = Object.entries(config.goals)
    .map(([goal, count]) => `${game.getGoalConfig(goal).label} ${count}`)
    .join("、");
  showDialog({
    title: config.chapter.title,
    message: `${config.chapter.scenicSpot} · 第 ${config.localLevel}/100 关。目标：${goalText}。`,
  });
}

function isSelected(cell) {
  return game.state.selected?.row === cell.row && game.state.selected?.col === cell.col;
}

function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

function pieceText(type) {
  return assetManifest.pieces[type] ? "" : game.pieces.find((piece) => piece.id === type)?.text || "";
}

function goalImage(goal) {
  return assetManifest.pieces[goal] || assetManifest.blockers[goal] || "";
}

function pieceEffectClass(cell) {
  const key = cellKey(cell);
  return {
    matching: game.state.effects.matching.has(key),
    swapping: game.state.effects.swapping.has(key),
    falling: game.state.effects.falling.has(key),
    spawning: game.state.effects.spawning.has(key),
  };
}

function specialClass(cell) {
  return {
    "is-special": Boolean(cell.special),
    "glow-special": cell.special?.kind === "glow",
    "line-row": cell.special?.direction === "row",
    "line-col": cell.special?.direction === "col",
    "bomb-special": cell.special?.kind === "bomb",
    "rainbow-special": cell.special?.kind === "rainbow",
  };
}

function pieceEffectStyle(cell) {
  const key = cellKey(cell);
  const swap = game.state.effects.swapping.get(key);
  const fallDistance = game.state.effects.falling.get(key);
  const style = {};
  if (swap) {
    style["--move-x"] = swap.fromCol - cell.col;
    style["--move-y"] = swap.fromRow - cell.row;
  }
  if (fallDistance) {
    style["--fall-y"] = -fallDistance;
    style["--fall-delay"] = `${Math.min(fallDistance * 32, 130)}ms`;
  }
  if (game.state.effects.spawning.has(key)) {
    style["--fall-delay"] = `${Math.min(cell.row * 24, 130)}ms`;
  }
  return style;
}

function pieceStyle(cell) {
  const style = pieceEffectStyle(cell);
  const image = assetManifest.pieces[cell.type];
  if (image) {
    style["--piece-image"] = `url("${image}")`;
  }
  if (cell.special?.kind === "glow") {
    style["--special-glow"] = `url("${assetManifest.specials.glow}")`;
  }
  if (cell.special?.kind === "rainbow") {
    style["--special-image"] = `url("${assetManifest.specials.rainbow}")`;
  } else if (cell.special?.kind === "bomb") {
    style["--special-image"] = `url("${assetManifest.specials.lineBomb}")`;
  }
  return style;
}

function ringsForCell(cell) {
  return game.state.effects.rings.filter((ring) => ring.row === cell.row && ring.col === cell.col);
}

function particlesForCell(cell) {
  return game.state.effects.particles.filter((particle) => particle.row === cell.row && particle.col === cell.col);
}

function particleStyle(particle) {
  const angle = (Math.PI * 2 * particle.index) / 7 - Math.PI / 2;
  const distance = 18 + (particle.index % 3) * 8;
  return {
    "--particle-x": `${Math.cos(angle) * distance}px`,
    "--particle-y": `${Math.sin(angle) * distance}px`,
    "--particle-delay": `${particle.index * 12}ms`,
  };
}

showToast({ message: "黄小西准备好啦", duration: 900 });
</script>
