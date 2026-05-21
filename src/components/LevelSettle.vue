<template>
  <section v-if="visible" class="level-settle" :class="{ 'show': show, 'exiting': exiting }">
    <!-- 1. 横幅 -->
    <div class="settle-banner" :class="{ 'banner-in': show }">
      <img :src="assetManifest.settle.banner" alt="恭喜过关" decoding="async" />
    </div>

    <!-- 2. 获得奖励框体 - 保持干净，只显示框体图 -->
    <div class="settle-reward-frame" :class="{ 'frame-in': show }">
      <img :src="assetManifest.settle.rewardFrame" alt="获得奖励" decoding="async" />
    </div>

    <!-- 3. 结算详情 - 3板块 -->
    <div class="settle-detail-frame" :class="{ 'frame-in': show }">
      <img class="detail-bg" :src="assetManifest.settle.detailFrameNew" alt="结算详情" decoding="async" />
      <div class="detail-panels">
        <!-- 板块1: 星级(只显示获得的) + 完美通关 + 总分 -->
        <div class="detail-panel panel-stars">
          <div class="stars-row">
            <img
              v-for="index in result.stars"
              :key="index"
              :src="starImage"
              class="lit"
              alt=""
            />
          </div>
          <span class="panel-tag" :class="`perfect-${result.stars}`">{{ perfectText }}</span>
          <strong class="panel-score">{{ displayScore.toLocaleString('zh-CN') }}</strong>
        </div>

        <!-- 板块2: 连击奖励 -->
        <div class="detail-panel panel-combo" style="transform: translateX(-12px);">
          <span class="panel-title">连击奖励</span>
          <strong class="panel-bonus">+{{ (result.comboBonus || 0).toLocaleString('zh-CN') }}</strong>
          <span class="panel-sub">最高连击 {{ result.maxCombo || 0 }}</span>
        </div>

        <!-- 板块3: 步数奖励 -->
        <div class="detail-panel panel-moves" style="transform: translateX(-20px);">
          <span class="panel-title">步数奖励</span>
          <strong class="panel-bonus">+{{ (result.movesBonus || 0).toLocaleString('zh-CN') }}</strong>
          <span class="panel-sub">剩余步数 {{ result.remainingMoves || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- 4. 对话框 -->
    <div class="settle-dialog" :class="{ 'dialog-in': show }">
      <img :src="assetManifest.ui.dialogBubble" alt="" decoding="async" />
      <p>太棒啦！我们又一起收获了满满的银饰宝藏！下一站，苗乡更精彩！</p>
    </div>

    <!-- 5. 按钮 -->
    <div class="settle-buttons" :class="{ 'buttons-in': showButtons }">
      <button class="settle-btn retry" @click="$emit('retry')">
        <img :src="assetManifest.settle.btnRetry" alt="重新挑战" decoding="async" />
      </button>
      <button v-if="!result.isLastLevel" class="settle-btn next" @click="$emit('next')">
        <img :src="assetManifest.settle.btnNext" alt="下一关" decoding="async" />
      </button>
    </div>

    <!-- 人物：固定在结算画面左下角，与背景左下角重合 -->
    <div class="settle-character" :class="{ 'char-in': show }">
      <img :src="assetManifest.settle.character" alt="黄小西" decoding="async" />
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { assetManifest } from '../config/assets';

const props = defineProps({
  visible: Boolean,
  result: {
    type: Object,
    default: () => ({}),
  },
  displayScore: {
    type: Number,
    default: 0,
  },
});

defineEmits(['next', 'retry']);

const show = ref(false);
const exiting = ref(false);
const showButtons = ref(false);

// 只使用1星素材，根据获得的星级数量重复显示
const starImage = assetManifest.settle.star1;

const perfectText = computed(() => {
  const texts = ['再接再厉', '表现不错', '完美通关'];
  return texts[(props.result.stars || 1) - 1] || texts[0];
});

watch(() => props.visible, (val) => {
  if (val) {
    exiting.value = false;
    show.value = false;
    showButtons.value = false;
    requestAnimationFrame(() => {
      show.value = true;
      setTimeout(() => { showButtons.value = true; }, 700);
    });
  }
}, { immediate: true });

function close() {
  exiting.value = true;
  setTimeout(() => {
    show.value = false;
    exiting.value = false;
  }, 400);
}

defineExpose({ close });
</script>

<style scoped>
/* 结算画面 - 替换棋盘区和道具区 */
.level-settle {
  position: relative;
  z-index: 100;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 102px 0 0;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 350ms ease, transform 350ms ease;
}

.level-settle.show {
  opacity: 1;
  transform: translateY(0);
}

.level-settle.exiting {
  opacity: 0;
  transform: translateY(6px);
}

/* 1. 横幅 */
.settle-banner {
  width: min(70%, 260px);
  transform: translateY(-12px) scale(0.88);
  opacity: 0;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease;
}

.settle-banner.banner-in {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.settle-banner img {
  width: 100%;
  height: auto;
  display: block;
}

/* 2. 获得奖励框体 - 干净 */
.settle-reward-frame {
  width: min(85%, 340px);
  transform: translateY(58px) scale(0.94);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 80ms, opacity 350ms ease 80ms;
}

.settle-reward-frame.frame-in {
  transform: translateY(-50px) scale(1);
  opacity: 1;
}

.settle-reward-frame img {
  width: 100%;
  height: auto;
  display: block;
}

/* 3. 结算详情 - 3板块 */
.settle-detail-frame {
  position: relative;
  width: min(83%, 346px);
  transform: translateX(20px) translateY(58px) scale(0.821);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 180ms, opacity 350ms ease 180ms;
}

.settle-detail-frame.frame-in {
  transform: translateX(40px) translateY(-50px) scale(0.864);
  opacity: 1;
}

.detail-bg {
  width: 100%;
  height: auto;
  display: block;
}

.detail-panels {
  position: absolute;
  inset: 24% 10% 18%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
}

.detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 2px;
  min-width: 0;
}

.stars-row {
  display: flex;
  gap: 2px;
}

.stars-row img {
  width: clamp(16px, 4.5vw, 22px);
  height: auto;
  animation: starPop 400ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.stars-row img:nth-child(1) { animation-delay: 0.3s; }
.stars-row img:nth-child(2) { animation-delay: 0.5s; }
.stars-row img:nth-child(3) { animation-delay: 0.7s; }

@keyframes starPop {
  0% { transform: scale(0.3); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.panel-tag {
  font-size: clamp(9px, 2.4vw, 11px);
  font-weight: 700;
}

.panel-tag.perfect-1 { color: #c4a574; }
.panel-tag.perfect-2 { color: #e0e0e0; }
.panel-tag.perfect-3 { color: #ffd740; }

.panel-score {
  font-size: clamp(14px, 4vw, 18px);
  font-weight: 900;
  color: #1a5c2e;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: clamp(9px, 2.4vw, 11px);
  color: #2d6a3f;
  white-space: nowrap;
}

.panel-bonus {
  font-size: clamp(13px, 3.6vw, 16px);
  font-weight: 900;
  color: #1a5c2e;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.panel-sub {
  font-size: clamp(8px, 2.2vw, 10px);
  color: #4a7c59;
  white-space: nowrap;
}

/* 4. 对话框 - 放大至90.75% */
.settle-dialog {
  position: relative;
  width: min(56%, 240px);
  transform: translateX(0) translateY(6px) scale(0.9075);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 300ms, opacity 350ms ease 300ms;
}

.settle-dialog.dialog-in {
  transform: translateX(25px) translateY(-80px) scale(0.9075);
  opacity: 1;
}

.settle-dialog img {
  width: 100%;
  height: auto;
  display: block;
}

.settle-dialog p {
  position: absolute;
  inset: 12% 10% 16% 14%;
  margin: 0;
  font-size: clamp(10px, 2.6vw, 12px);
  color: #5a3d1a;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 5. 按钮 */
.settle-buttons {
  display: flex;
  justify-content: center;
  gap: 10px;
  transform: translateX(0) translateY(6px);
  opacity: 0;
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1) 500ms, opacity 300ms ease 500ms;
}

.settle-buttons.buttons-in {
  transform: translateX(40px) translateY(-60px);
  opacity: 1;
}

.settle-btn {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: transform 120ms ease;
  -webkit-tap-highlight-color: transparent;
}

.settle-btn:active {
  transform: scale(0.95);
}

.settle-btn img {
  width: 100%;
  height: auto;
  display: block;
}

.settle-btn.retry {
  width: clamp(90px, 24vw, 120px);
}

.settle-btn.next {
  width: clamp(100px, 26vw, 130px);
}

/* 人物：固定在结算画面左下角，与背景左下角重合 */
.settle-character {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 5;
  width: clamp(200px, 52vw, 280px);
  pointer-events: none;
  transform: translateX(-105px) translateY(-35px);
  opacity: 0;
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 350ms, opacity 400ms ease 350ms;
}

.settle-character.char-in {
  transform: translateX(-75px) translateY(-45px);
  opacity: 1;
}

.settle-character img {
  width: 100%;
  height: auto;
  display: block;
}
</style>
