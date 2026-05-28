<template>
  <main class="phone-shell" aria-label="贵州文旅三消游戏">
    <!-- 身份验证失败遮罩 -->
    <div v-if="authError" class="auth-error-overlay">
      <div class="auth-error-box">
        <p>{{ authError }}</p>
      </div>
    </div>
    <section class="game-scene" :class="{ 'has-scene-image': currentSceneImage, 'is-home': screen === 'home' }" :style="sceneStyle">
      <div v-if="screen !== 'home'" class="mountain-layer" aria-hidden="true"></div>
      <div v-if="screen !== 'home'" class="village-layer" aria-hidden="true"></div>

      <section v-if="screen === 'home'" class="home-screen home-new">
        <div class="home-bg" :style="{ backgroundImage: `url(${assetManifest.home.bg})` }"></div>

        <button class="home-start-hotzone" @click="goMap" aria-label="立即出发"></button>

        <div class="home-particles" aria-hidden="true">
          <span v-for="n in 12" :key="n" class="particle-dot" :style="homeParticleStyle(n)"></span>
        </div>
      </section>

      <section v-else-if="screen === 'map'" class="map-screen" :style="mapSceneStyle">
        <section class="chapter-panel">
          <img class="chapter-panel-bg" :src="assetManifest.map.titleFrame" alt="" decoding="async" fetchpriority="high" />
          <button type="button" class="map-icon-btn back" aria-label="返回首页" @click="goHome">
            <img :src="assetManifest.map.buttons.back" alt="" decoding="async" />
          </button>
          <div class="map-page-title">黄小西带你游贵州</div>
          <button type="button" class="map-icon-btn setting" aria-label="设置" @click="openSettings">
            <img :src="assetManifest.map.buttons.setting" alt="" decoding="async" />
          </button>
          <div class="chapter-list" aria-label="7大关">
            <van-button
              v-for="(chapter, index) in chapters"
              :key="chapter.id"
              block
              class="chapter-list-button"
              :class="{ active: index === game.state.selectedChapterIndex }"
              @click="game.state.selectedChapterIndex = index"
            >
              <span class="chapter-list-index">{{ index + 1 }}</span>
              <span class="chapter-list-name">{{ chapter.name }}</span>
            </van-button>
          </div>

          <div class="chapter-visual">
            <div class="chapter-visual-copy">
              <span>第 {{ game.state.selectedChapterIndex + 1 }} 章</span>
              <h3>{{ selectedChapter.title.replace(/^第.章\s*/, "") }}</h3>
              <p>{{ selectedChapter.scenicSpot }} · {{ selectedChapter.featureFood }}</p>
            </div>
            <div class="chapter-highlight-strip" aria-label="章节美食展示">
              <button
                v-for="(item, index) in chapterHighlightItems"
                :key="item.title"
                type="button"
                class="chapter-highlight-item"
                :class="{ active: selectedHighlightIndex === index }"
                :aria-label="item.title"
                @click="selectedHighlightIndex = index"
              >
                <img :src="item.image" :alt="item.title" loading="lazy" decoding="async" />
              </button>
            </div>
            <div class="chapter-highlight-desc">
              <strong>{{ selectedHighlight.title }}</strong>
              <p>{{ selectedHighlight.text }}</p>
            </div>
          </div>

          <div class="chapter-speed">
            <p>本大关进度</p>
            <strong><van-icon name="star" /> {{ chapterStarTotal }}/300</strong>
            <van-progress :percentage="chapterStarPercent" stroke-width="10" color="#85c341" :show-pivot="false" />
          </div>
        </section>

        <section class="map-body">
          <div
            class="route-map"
            @pointerdown="handleMapPointerDown"
            @pointermove="handleMapPointerMove"
            @pointerup="handleMapPointerUp"
            @pointercancel="handleMapPointerCancel"
            @lostpointercapture="handleMapPointerCancel"
          >
            <div
              class="route-map-track"
              :style="mapTrackStyle"
            >
              <div v-for="segment in mapSegments" :key="segment" class="route-segment">
                <img class="route-art" :src="assetManifest.map.route" alt="" loading="lazy" decoding="async" />
                <button
                  v-for="level in levelsForSegment(segment)"
                  :key="level.globalLevel"
                  type="button"
                  class="level-node"
                  :class="{
                    'is-current': level.globalLevel === game.state.currentLevel,
                    'is-boss': level.localLevel % 10 === 0,
                    [`stars-${player.getStars(level.globalLevel)}`]: player.isUnlocked(level.globalLevel),
                    locked: !player.isUnlocked(level.globalLevel),
                  }"
                  :style="segmentNodeStyle(level)"
                  @click.stop="handleLevelNode(level)"
                >
                  <span>{{ level.localLevel }}</span>
                  <van-icon v-if="!player.isUnlocked(level.globalLevel)" name="lock" class="node-lock" />
                </button>
                <button
                  v-for="reward in rewardsForSegment(segment)"
                  :key="`reward-${reward.globalLevel}`"
                  type="button"
                  class="reward-node"
                  :class="{
                    claimable: player.isRewardClaimable(game.state.selectedChapterIndex, reward.localLevel),
                    claimed: player.isRewardClaimed(game.state.selectedChapterIndex, reward.localLevel),
                  }"
                  :style="rewardNodeStyle(reward)"
                  @click.stop="claimChapterReward(reward)"
                >
                  <img :src="rewardChestImage(reward)" alt="" loading="lazy" decoding="async" />
                </button>
              </div>
            </div>
          </div>

          <div class="map-guide-half-container">
            <img class="map-guide-half" :src="assetManifest.map.guideHalf" alt="" loading="lazy" decoding="async" />
            <div class="map-guide-dialog">
              <img :src="assetManifest.map.guideDialog" alt="" loading="lazy" decoding="async" />
              <p>晚饭时间到啦！一起解锁更多美味吧。</p>
            </div>
          </div>

          <footer class="map-footer">
            <img class="map-footer-bg" :src="assetManifest.map.bottomBar" alt="" decoding="async" />
            <button type="button" class="map-footer-action reward" aria-label="我的卡牌" @click="showCardInventory = true">
              <img :src="assetManifest.map.buttons.reward" alt="" decoding="async" />
            </button>
            <button type="button" class="map-footer-action rules" aria-label="玩法说明" @click="openMapInfo">
              <img :src="assetManifest.map.buttons.footerRules" alt="" decoding="async" />
            </button>
            <aside class="footer-guide-rules">
              <img class="footer-guide-bg" :src="assetManifest.map.rulesPanelNew" alt="" decoding="async" />
              <div class="footer-guide-content">
                <div class="footer-rule-list">
                  <div v-for="rule in mapRules.slice(0, 3)" :key="rule.title" class="footer-rule-item">
                    <p>{{ rule.text }}</p>
                  </div>
                </div>
              </div>
            </aside>
          </footer>
        </section>

        <aside class="map-guide">
          <div class="guide-character" :class="{ 'has-image': assetManifest.guide.normal }" :style="guideImageStyle" aria-hidden="true">
            <div class="silver-crown"></div>
            <div class="guide-face"></div>
            <div class="guide-body"></div>
          </div>
          <div class="guide-bubble">美景、美食、文化一周打尽！一起开启多彩贵州之旅。</div>
        </aside>

        <div v-if="showMapRules" class="map-rules-mask" @click="showMapRules = false">
          <aside class="map-rules-panel" @click.stop>
            <img :src="assetManifest.map.rulesPanel" alt="" loading="lazy" decoding="async" />
            <div class="map-rules-copy">
              <h3>玩法说明</h3>
              <p>滑动相邻美食完成三消，完成关卡目标即可通关。</p>
              <p>每章 100 关，关卡节点会按进度解锁，通关星级会在节点素材上回显。</p>
              <p>宝箱达到指定关卡后可领取，奖励用于后续关卡破局。</p>
            </div>
            <button type="button" class="map-rules-close" @click="showMapRules = false">关闭</button>
          </aside>
        </div>
      </section>

      <section v-else class="play-screen">
        <header class="top-hud">
          <div class="hud-side left">
            <van-button round icon="setting-o" class="vant-round" aria-label="设置" @click="openSettings" />
          </div>
          <div class="title-plaque">黄小西带你游贵州</div>
          <div class="hud-side right">
            <van-button round class="vant-round pause-round" aria-label="暂停" @click="goMap">Ⅱ</van-button>
          </div>

          <div class="mission-panel">
            <div class="goal-card">
              <p class="panel-label">关卡目标</p>
              <p v-if="game.state.goalsCompleted && currentStarCount < 3" class="goal-cleared">目标完成，冲三星</p>
              <div class="goal-list">
                <div v-for="item in topGoalSlots" :key="item.id" class="goal-item" :class="{ empty: item.empty }">
                  <template v-if="!item.empty">
                    <span class="goal-icon">
                      <img v-if="goalImage(item.goal)" :src="goalImage(item.goal)" :alt="game.getGoalConfig(item.goal).label" decoding="async" />
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

        <!-- 结算画面：通关时替换棋盘区和道具区 -->
        <template v-if="settleResult && !settleResult.failed">
          <LevelSettle
            :visible="settlePhase >= 1"
            :result="settleResult"
            :display-score="settleDisplayScore"
            @next="closeSettleAndNext"
            @retry="closeSettleAndRetry"
            @view-card="handleSettleViewCard"
          />
        </template>

        <!-- 正常游戏区域：未通关时显示 -->
        <template v-else>
          <section class="board-wrap">
            <div class="game-board asset-board" :class="{ 'fast-mode': game.state.fastMode }">
              <button
                v-for="cell in flatBoard"
                :key="`${cell.row}-${cell.col}`"
                class="cell"
                :class="{ selected: isSelected(cell), clearing: game.state.effects.clearing.has(cellKey(cell)) }"
                :disabled="game.state.busy || game.state.completed || game.state.failed || game.state.movesLeft <= 0"
                @click="handleCellClick(cell)"
                @pointerdown="handleCellPointerDown($event, cell)"
                @pointerup="handleCellPointerUp($event, cell)"
                @pointercancel="clearSwipeStart"
                @pointerleave="handleCellPointerLeave($event, cell)"
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
              <span v-if="game.state.effects.levelClearBanner" class="level-clear-banner">🎉 通关！结算中</span>
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
                  <img v-if="booster.image" :src="booster.image" :alt="booster.id" loading="lazy" decoding="async" />
                  <template v-else>{{ booster.icon }}</template>
                </span>
                <van-badge :content="booster.count" class="badge-anchor" />
              </van-button>
            </div>
            <div class="travel-progress">
              <img class="chapter-building" :src="assetManifest.ui.chapterBuilding" alt="" loading="lazy" decoding="async" />
              <span class="chapter-name">{{ game.state.levelConfig.chapter.title }}</span>
              <div class="chapter-meter">
                <span :style="{ width: `${detailTreasurePercent}%` }"></span>
                <strong>{{ game.state.levelConfig.localLevel }}/{{ nextRewardLevel }}</strong>
              </div>
              <van-button size="small" round type="warning" class="treasure-claim" @click="claimDetailTreasure">
                <img :src="assetManifest.ui.treasureChest" alt="" loading="lazy" decoding="async" />
                <span v-if="detailTreasureStatus === 'claimable'">可领取{{ claimableRewardLevels.length > 1 ? `(${claimableRewardLevels.length})` : '' }}</span>
                <span v-else-if="detailTreasureStatus === 'claimed'">已领取</span>
              </van-button>
            </div>
            <div class="level-tools">
              <van-button size="small" round @click="changeLevel(game.state.currentLevel - 1)">上一关</van-button>
              <van-button size="small" round type="primary" @click="openLevelInfo">规则</van-button>
              <van-button size="small" round @click="changeLevel(game.state.currentLevel + 1)">下一关</van-button>
            </div>
          </footer>
        </template>

        <!-- 失败结算：保持原有弹窗 -->
        <aside v-if="settleResult && settleResult.failed" class="settle-overlay" :class="[`phase-${settlePhase}`, { exiting: settlePhase === 3 }]">
          <div class="settle-card">
            <div class="settle-header failed">
              <span class="settle-title-icon">😔</span>
              <h2>挑战失败</h2>
              <p>第 {{ settleResult.level }} 关 · {{ game.state.levelConfig.chapter.name }}</p>
            </div>

            <div class="settle-score">
              <p class="settle-score-label">最终得分</p>
              <strong class="settle-score-value">{{ settleDisplayScore.toLocaleString("zh-CN") }}</strong>
            </div>

            <div class="settle-actions" v-if="settlePhase >= 2">
              <van-button
                block
                round
                type="primary"
                class="settle-btn"
                @click="closeSettleAndRetry"
              >再来一次</van-button>
              <van-button
                block
                round
                class="settle-btn settle-btn-secondary"
                @click="closeSettleAndGoMap"
              >返回选关</van-button>
            </div>
          </div>
        </aside>
      </section>
    </section>

    <!-- 卡牌背包 -->
    <CardInventory
      :show="showCardInventory"
      @back="showCardInventory = false"
      @select-card="handleSelectCard"
    />

    <!-- 卡牌详情 -->
    <CardDetail
      :show="showCardDetail"
      :card="selectedCard"
      @close="showCardDetail = false"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from "vue";
import { showToast, showDialog } from "vant";
import { blockers, chapters, LEVELS_PER_CHAPTER, pieces, REWARD_LEVELS, TOTAL_LEVELS } from "./config/levels";
import { assetManifest } from "./config/assets";
import { useMatch3Game } from "./composables/useMatch3Game";
import { usePlayerProgress, setGameUser } from "./composables/usePlayerProgress";
import { verifyToken, setTokens } from "./api/gameApi";
import LevelSettle from "./components/LevelSettle.vue";
import CardInventory from "./components/CardInventory.vue";
import CardDetail from "./components/CardDetail.vue";

const params = new URLSearchParams(window.location.search);
const initialLevel = Number(params.get("level")) || 128;
const screen = ref(params.has("level") ? "game" : params.get("screen") === "map" ? "map" : "home");
const gameAccessToken = params.get("accessToken") || "";
const gameRefreshToken = params.get("refreshToken") || "";
const authError = ref("");
const homeAnimReady = ref(false);
const showMapRules = ref(false);
const showCardInventory = ref(false);
const showCardDetail = ref(false);
const selectedCard = ref(null);
const settleResult = ref(null);
const settlePhase = ref(0);
const settleDisplayScore = ref(0);
const isTransitioning = ref(false);
const player = usePlayerProgress();
const game = useMatch3Game(initialLevel, {
  onLevelComplete: handleLevelComplete,
  onLevelFail: handleLevelFail,
  getBoosterCount: (booster) => player.progress.inventory[booster] || 0,
});
const swipeStart = ref(null);
const didSwipe = ref(false);
const selectedHighlightIndex = ref(0);
const mapPage = ref(0);
const viewportHeight = ref(window.innerHeight);
const mapDragState = ref({
  dragging: false,
  startX: 0,
  currentX: 0,
  startY: 0,
  currentY: 0,
});
const SWIPE_THRESHOLD = 18;
const MAP_PAGE_SWIPE_THRESHOLD = 50;
const appViewportStyle = computed(() => ({
  "--app-height": `${viewportHeight.value}px`,
}));
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
const visibleRewards = computed(() =>
  REWARD_LEVELS.map((localLevel) => ({
    globalLevel: game.state.selectedChapterIndex * LEVELS_PER_CHAPTER + localLevel,
    localLevel,
  })),
);
const nextRewardLevel = computed(() => {
  const localLevel = game.state.levelConfig.localLevel;
  return REWARD_LEVELS.find((rewardLevel) => rewardLevel >= localLevel) || LEVELS_PER_CHAPTER;
});
const detailTreasurePercent = computed(() =>
  Math.min(100, Math.round((game.state.levelConfig.localLevel / nextRewardLevel.value) * 100)),
);
const claimableRewardLevels = computed(() =>
  REWARD_LEVELS.filter((rewardLevel) =>
    player.isRewardClaimable(game.state.levelConfig.chapterIndex, rewardLevel),
  ),
);
const detailTreasureStatus = computed(() => {
  if (claimableRewardLevels.value.length > 0) return "claimable";
  const nextLevel = nextRewardLevel.value;
  if (player.isRewardClaimed(game.state.levelConfig.chapterIndex, nextLevel)) return "claimed";
  return "locked";
});
const mapSegments = computed(() => [0, 1, 2, 3, 4]);
const maxUnlockedMapPage = computed(() => {
  const chapterStart = game.state.selectedChapterIndex * LEVELS_PER_CHAPTER + 1;
  const unlockedInChapter = Math.max(1, Math.min(LEVELS_PER_CHAPTER, player.progress.unlockedLevel - chapterStart + 1));
  return Math.floor((unlockedInChapter - 1) / 20);
});
const mapTrackStyle = computed(() => ({
  transform: `translateX(${-mapPage.value * 100}%)`,
  transition: "transform 300ms ease",
}));
const chapterStarTotal = computed(() =>
  chapterLevels.value.reduce((sum, level) => sum + player.getStars(level.globalLevel), 0),
);
const chapterStarPercent = computed(() => Math.round((chapterStarTotal.value / 300) * 100));
const chapterHighlightCopy = [
  { title: "凯里酸汤鱼", text: "一口鲜酸开胃，像瀑布水汽一样爽快。" },
  { title: "遵义羊肉粉", text: "热汤滚香，米粉柔滑，赶路也要吃得踏实。" },
  { title: "兴义羊肉粉", text: "山野香气更浓，暖胃又有峰林烟火气。" },
  { title: "五色糯米饭", text: "五彩入盘，软糯香甜，带着民族节庆的好彩头。" },
  { title: "南白黄粑", text: "糯香绵密，甜而不腻，是旅途里的温柔一口。" },
  { title: "织金发粑", text: "松软发甜，越嚼越香，适合闯关前补满元气。" },
];
const chapterHighlightItems = computed(() =>
  assetManifest.map.highlights.map((image, index) => ({
    image,
    ...chapterHighlightCopy[index],
  })),
);
const selectedHighlight = computed(() => chapterHighlightItems.value[selectedHighlightIndex.value] || chapterHighlightItems.value[0]);
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
  if (screen.value === "home") return null;
  if (screen.value !== "game") return assetManifest.background;
  return assetManifest.backgrounds?.[game.state.levelConfig.chapter.id] || assetManifest.background;
});
const sceneStyle = computed(() => {
  if (screen.value === "home") return appViewportStyle.value;
  return currentSceneImage.value ? { ...appViewportStyle.value, "--scene-image": `url("${currentSceneImage.value}")` } : appViewportStyle.value;
});
const mapSceneStyle = computed(() => ({}));
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

function updateViewportHeight() {
  const height = window.visualViewport?.height || window.innerHeight;
  viewportHeight.value = height;
  document.documentElement.style.setProperty("--app-height", `${height}px`);
}

onMounted(async () => {
  updateViewportHeight();
  window.addEventListener("resize", updateViewportHeight);
  window.visualViewport?.addEventListener("resize", updateViewportHeight);
  window.setTimeout(() => { homeAnimReady.value = true; }, 100);

  // 后端初始化：验证token + 加载游戏数据
  if (gameAccessToken) {
    try {
      // 先设置 accessToken 和 refreshToken，后续请求自动带 Authorization header
      setTokens(gameAccessToken, gameRefreshToken);
      const verifyResult = await verifyToken(gameAccessToken);
      if (!verifyResult.valid) {
        authError.value = "accessToken无效或已过期，请重新进入游戏";
        return;
      }
      // 从验证结果获取 uid/phone
      const uid = verifyResult.uid || '';
      const phone = verifyResult.phone || '';
      if (!uid || !phone) {
        authError.value = "用户信息缺失，请重新进入游戏";
        return;
      }
      setGameUser(uid, phone);
      const gameData = await player.loadFromBackend();
      // 将后端返回的卡牌数据写入localStorage，供useCardSystem读取
      if (gameData && gameData.cards) {
        window.localStorage.setItem('guizhou-card-inventory', JSON.stringify(gameData.cards));
      }
    } catch (err) {
      authError.value = err.message || "身份验证失败，无法进入游戏";
    }
  } else {
    authError.value = "缺少身份凭证，请从微信小程序重新进入游戏";
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", updateViewportHeight);
  window.visualViewport?.removeEventListener("resize", updateViewportHeight);
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

watch(
  () => game.state.selectedChapterIndex,
  () => {
    mapPage.value = 0;
    resetMapDrag();
  },
);

watch(maxUnlockedMapPage, (maxPage) => {
  if (mapPage.value > maxPage) {
    mapPage.value = maxPage;
  }
});

function goHome() {
  screen.value = "home";
  updateUrl("home");
}

function goMap() {
  isTransitioning.value = true;
  window.setTimeout(() => {
    screen.value = "map";
    updateUrl("map");
    isTransitioning.value = false;
  }, 500);
}

function goGame(level) {
  if (!player.isUnlocked(level)) {
    showToast("先完成前置关卡再来挑战吧");
    return;
  }
  game.changeLevel(level);
  screen.value = "game";
  updateUrl("game");
}

function handleLevelComplete(result) {
  player.completeLevel(result.level, result.stars);
  settleResult.value = result;
  settlePhase.value = 0;
  settleDisplayScore.value = 0;

  window.setTimeout(() => { settlePhase.value = 1; }, 400);
  animateScoreCounter(result.finalScore, 1200, () => {
    settlePhase.value = 2;
  });
}

function animateScoreCounter(target, duration, onDone) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    settleDisplayScore.value = Math.round(target * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      settleDisplayScore.value = target;
      onDone?.();
    }
  }
  requestAnimationFrame(tick);
}

function handleLevelFail(result) {
  settleResult.value = { ...result, stars: 0, finalScore: result.score, isLastLevel: false, nextLevel: result.level, failed: true };
  settlePhase.value = 0;
  settleDisplayScore.value = 0;

  window.setTimeout(() => { settlePhase.value = 1; }, 300);
  animateScoreCounter(result.score, 800, () => {
    settlePhase.value = 2;
  });
}

function closeSettleAndNext() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  settlePhase.value = 3;

  const nextLevel = settleResult.value?.nextLevel || game.state.currentLevel + 1;
  const isLast = settleResult.value?.isLastLevel;

  window.setTimeout(() => {
    settleResult.value = null;
    settlePhase.value = 0;
    isTransitioning.value = false;
    if (isLast) {
      goMap();
    } else {
      goGame(nextLevel);
    }
    
    setTimeout(() => {
      const scene = document.querySelector('.game-scene');
      if (scene) scene.scrollTop = 0;
    }, 0);
  }, 500);
}

function closeSettleAndRetry() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  settlePhase.value = 3;

  const level = settleResult.value?.level || game.state.currentLevel;
  window.setTimeout(() => {
    settleResult.value = null;
    settlePhase.value = 0;
    isTransitioning.value = false;
    game.changeLevel(level);

    setTimeout(() => {
      const scene = document.querySelector('.game-scene');
      if (scene) scene.scrollTop = 0;
    }, 0);
  }, 500);
}

function closeSettleAndGoMap() {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  settlePhase.value = 3;

  window.setTimeout(() => {
    settleResult.value = null;
    settlePhase.value = 0;
    isTransitioning.value = false;
    goMap();
  }, 500);
}

function handleSelectCard(card) {
  selectedCard.value = card;
  showCardDetail.value = true;
}

function handleSettleViewCard(card) {
  selectedCard.value = card;
  showCardDetail.value = true;
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
  if (mapDragState.value.dragging && Math.abs(mapDragState.value.currentX - mapDragState.value.startX) > 5) {
    return; // 忽略滑动过程中的点击
  }
  goGame(level.globalLevel);
}

function resetMapDrag() {
  mapDragState.value = {
    dragging: false,
    startX: 0,
    currentX: 0,
    startY: 0,
    currentY: 0,
  };
}

function handleMapPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  mapDragState.value = {
    dragging: true,
    startX: event.clientX,
    currentX: event.clientX,
    startY: event.clientY,
    currentY: event.clientY,
  };
  // 取消 setPointerCapture，避免劫持子元素（关卡节点）的 click 事件
  // event.currentTarget.setPointerCapture?.(event.pointerId);
}

function handleMapPointerMove(event) {
  if (!mapDragState.value.dragging) return;
  mapDragState.value = {
    ...mapDragState.value,
    currentX: event.clientX,
    currentY: event.clientY,
  };
}

function handleMapPointerUp(event) {
  if (!mapDragState.value.dragging) return;
  
  // event.currentTarget.releasePointerCapture?.(event.pointerId);
  const deltaX = mapDragState.value.currentX - mapDragState.value.startX;
  const deltaY = mapDragState.value.currentY - mapDragState.value.startY;
  const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
  if (!isHorizontalSwipe) {
    resetMapDrag();
    return;
  }
  const wantsNextPage = deltaX < -MAP_PAGE_SWIPE_THRESHOLD;
  const wantsPrevPage = deltaX > MAP_PAGE_SWIPE_THRESHOLD;
  if (wantsNextPage) {
    if (mapPage.value < maxUnlockedMapPage.value) {
      mapPage.value += 1;
    } else {
      showToast("完成前面的关卡后再继续前进");
    }
  } else if (wantsPrevPage && mapPage.value > 0) {
    mapPage.value -= 1;
  }
  resetMapDrag();
}

function handleMapPointerCancel(event) {
  if (!mapDragState.value.dragging) return;
  // event.currentTarget.releasePointerCapture?.(event.pointerId);
  resetMapDrag();
}

const routePoints = [
  { left: 12, top: 16 },
  { left: 30, top: 18 },
  { left: 51, top: 14 },
  { left: 75, top: 16 },
  { left: 90, top: 27 },
  { left: 76, top: 35 },
  { left: 53, top: 35 },
  { left: 27, top: 36 },
  { left: 14, top: 43 },
  { left: 28, top: 49 },
  { left: 51, top: 51 },
  { left: 76, top: 51 },
  { left: 87, top: 62 },
  { left: 75, top: 70 },
  { left: 52, top: 70 },
  { left: 28, top: 70 },
  { left: 17, top: 80 },
  { left: 35, top: 86 },
  { left: 59, top: 84 },
  { left: 76, top: 82 },
];

function levelsForSegment(segment) {
  const start = segment * 20;
  return chapterLevels.value.slice(start, start + 20);
}

function rewardsForSegment(segment) {
  const start = segment * 20;
  const end = start + 20;
  return visibleRewards.value.filter((reward) => reward.localLevel > start && reward.localLevel <= end);
}

function segmentPoint(localLevel) {
  return routePoints[(localLevel - 1) % 20];
}

function segmentNodeStyle(level) {
  const point = segmentPoint(level.localLevel);
  return {
    left: `${point.left}%`,
    top: `${point.top}%`,
  };
}

function rewardNodeStyle(reward) {
  const isSegmentEndReward = reward.localLevel % 20 === 0;
  const startLevel = isSegmentEndReward ? reward.localLevel - 1 : reward.localLevel;
  const endLevel = isSegmentEndReward ? reward.localLevel : reward.localLevel + 1;
  const startPoint = segmentPoint(startLevel);
  const endPoint = segmentPoint(endLevel);
  const left = (startPoint.left + endPoint.left) / 2;
  const top = (startPoint.top + endPoint.top) / 2;
  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

function rewardChestImage(reward) {
  if (player.isRewardClaimed(game.state.selectedChapterIndex, reward.localLevel)) {
    return assetManifest.map.chests.opened;
  }
  if (player.isRewardClaimable(game.state.selectedChapterIndex, reward.localLevel)) {
    return assetManifest.map.chests.ready;
  }
  return assetManifest.map.chests.closed;
}

function claimChapterReward(reward) {
  if (mapDragState.value.dragging && Math.abs(mapDragState.value.currentX - mapDragState.value.startX) > 5) {
    return; // 忽略滑动过程中的点击
  }
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

function claimDetailTreasure() {
  const chapterIndex = game.state.levelConfig.chapterIndex;
  const claimableLevels = REWARD_LEVELS.filter(
    (rewardLevel) => player.isRewardClaimable(chapterIndex, rewardLevel),
  );
  if (claimableLevels.length === 0) {
    const nextLevel = nextRewardLevel.value;
    if (player.isRewardClaimed(chapterIndex, nextLevel)) {
      showToast("这个宝箱已经领取过啦");
    } else {
      showToast(`通关到第 ${nextLevel} 小关后可领取`);
    }
    return;
  }
  const allRewards = {};
  claimableLevels.forEach((rewardLevel) => {
    const rewardItems = player.claimReward(chapterIndex, rewardLevel);
    if (rewardItems) {
      Object.entries(rewardItems).forEach(([booster, count]) => {
        allRewards[booster] = (allRewards[booster] || 0) + count;
      });
    }
  });
  const rewardText = Object.entries(allRewards)
    .map(([booster, count]) => `${boosterName(booster)} +${count}`)
    .join("、");
  const suffix = claimableLevels.length > 1 ? `，共领取 ${claimableLevels.length} 个宝箱` : "";
  showDialog({
    title: "领取成功",
    message: `获得 ${rewardText}${suffix}，选关页宝箱状态已同步更新。`,
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
  showCardInventory.value = true;
}

function openMapInfo() {
  showMapRules.value = true;
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

function handleCellPointerDown(event, cell) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  swipeStart.value = {
    row: cell.row,
    col: cell.col,
    x: event.clientX,
    y: event.clientY,
  };
  didSwipe.value = false;
}

async function handleCellPointerUp(event, cell) {
  const start = swipeStart.value;
  swipeStart.value = null;
  if (!start || start.row !== cell.row || start.col !== cell.col) return;
  const deltaX = event.clientX - start.x;
  const deltaY = event.clientY - start.y;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;
  didSwipe.value = true;
  const direction =
    absX > absY
      ? { row: 0, col: deltaX > 0 ? 1 : -1 }
      : { row: deltaY > 0 ? 1 : -1, col: 0 };
  await game.swipeCell(cell, direction);
}

async function handleCellPointerLeave(event, cell) {
  if (!swipeStart.value || event.buttons !== 1) return;
  await handleCellPointerUp(event, cell);
}

function handleCellClick(cell) {
  if (didSwipe.value) {
    didSwipe.value = false;
    return;
  }
  if (game.state.activeBooster) {
    game.selectCell(cell);
  }
}

function clearSwipeStart() {
  swipeStart.value = null;
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

function homeParticleStyle(n) {
  const top = Math.random() * 100;
  const left = Math.random() * 100;
  const size = 3 + Math.random() * 5;
  const delay = Math.random() * 4;
  const duration = 3 + Math.random() * 4;
  return {
    top: `${top}%`,
    left: `${left}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  };
}

showToast({ message: "黄小西准备好啦", duration: 900 });
</script>
