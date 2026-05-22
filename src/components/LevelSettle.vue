<template>
  <section v-if="visible" class="level-settle" :class="{ 'show': show, 'exiting': exiting }">
    <div class="settle-content-wrap">
      <div class="settle-banner" :class="{ 'banner-in': show }">
        <img :src="assetManifest.settle.banner" alt="恭喜过关" decoding="async" />
      </div>

      <div class="settle-reward-frame" :class="{ 'frame-in': show }">
        <img :src="assetManifest.settle.rewardFrame" alt="获得奖励" decoding="async" />
        <div class="reward-cards" :class="{ 'has-selected': selectedCardIndex !== -1 }">
          <div
            v-for="(card, index) in displayCards"
            :key="index"
            class="reward-card"
            :class="[
              card.revealed ? card.type : 'purple',
              { 'glow-active': glowingCard === index || (selectedCardIndex === index && card.revealed) },
              { 'fade-out': selectedCardIndex !== -1 && selectedCardIndex !== index },
              { 'move-center': selectedCardIndex === index }
            ]"
            :style="selectedCardIndex === index ? getCenterOffset(index) : {}"
            @click="handleCardClick(index)"
          >
            <img :src="card.revealed ? card.image : assetManifest.cards.purple" :alt="card.label" decoding="async" />
          </div>
        </div>
      </div>

      <div class="settle-detail-frame" :class="{ 'frame-in': show }">
        <img class="detail-bg" :src="assetManifest.settle.detailFrameNew" alt="结算详情" decoding="async" />
        <div class="detail-panels">
          <div class="detail-panel panel-stars" :class="{ 'panel-in': panelPhase >= 1 }">
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

          <div class="detail-panel panel-combo" :class="{ 'panel-in': panelPhase >= 2 }">
            <span class="panel-title">连击奖励</span>
            <strong class="panel-bonus">+{{ (result.comboBonus || 0).toLocaleString('zh-CN') }}</strong>
            <span class="panel-sub">最高连击 {{ result.maxCombo || 0 }}</span>
          </div>

          <div class="detail-panel panel-moves" :class="{ 'panel-in': panelPhase >= 3 }">
            <span class="panel-title">步数奖励</span>
            <strong class="panel-bonus">+{{ (result.movesBonus || 0).toLocaleString('zh-CN') }}</strong>
            <span class="panel-sub">自动消除得分</span>
          </div>
        </div>
      </div>

      <div class="settle-dialog" :class="{ 'dialog-in': show && panelPhase >= 3 }">
        <img :src="assetManifest.ui.dialogBubble" alt="" decoding="async" />
        <p>太棒啦！我们又一起收获了满满的银饰宝藏！下一站，苗乡更精彩！</p>
      </div>

      <div class="settle-buttons" :class="{ 'buttons-in': showButtons }">
        <button class="settle-btn retry" @click="handleRetry">
          <img :src="assetManifest.settle.btnRetry" alt="重新挑战" decoding="async" />
        </button>
        <button v-if="!result.isLastLevel" class="settle-btn next" @click="handleNext">
          <img :src="assetManifest.settle.btnNext" alt="下一关" decoding="async" />
        </button>
      </div>

      <div class="settle-character" :class="{ 'char-in': show }">
        <img :src="assetManifest.settle.character" alt="黄小西" decoding="async" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue';
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

const emit = defineEmits(['next', 'retry']);

const show = ref(false);
const exiting = ref(false);
const showButtons = ref(false);
const panelPhase = ref(0);
const glowingCard = ref(-1);
const selectedCardIndex = ref(-1);

const starImage = assetManifest.settle.star1;

const cardPool = [
  { type: 'blue', label: '蓝色卡片', image: assetManifest.cards.blue },
  { type: 'purple', label: '紫色卡片', image: assetManifest.cards.purple },
  { type: 'gold', label: '金色卡片', image: assetManifest.cards.gold },
];

const displayCards = ref([
  { ...cardPool[1], revealed: false },
  { ...cardPool[1], revealed: false },
  { ...cardPool[1], revealed: false },
]);

function shuffleCards() {
  displayCards.value = displayCards.value.map(() => {
    const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)];
    return { ...randomCard, revealed: false };
  });
}

const perfectText = computed(() => {
  const texts = ['再接再厉', '表现不错', '完美通关'];
  return texts[(props.result.stars || 1) - 1] || texts[0];
});

function handleNext() {
  exiting.value = true;
  emit('next');
}

function handleRetry() {
  exiting.value = true;
  emit('retry');
}

function handleCardClick(index) {
  if (displayCards.value[index].revealed || selectedCardIndex.value !== -1) return;
  const randomCard = cardPool[Math.floor(Math.random() * cardPool.length)];
  displayCards.value[index] = { ...randomCard, revealed: true };
  glowingCard.value = index;
  selectedCardIndex.value = index;
}

function getCenterOffset(index) {
  const cardWidth = 80;
  const gap = 8;
  const totalWidth = cardWidth * 3 + gap * 2;
  const cardPositions = [
    -(cardWidth + gap),
    0,
    cardWidth + gap
  ];
  const centerOffset = cardPositions[index];
  return { '--center-offset': `${centerOffset}px` };
}

let panelTimers = [];

function clearPanelTimers() {
  panelTimers.forEach(t => clearTimeout(t));
  panelTimers = [];
}

onUnmounted(() => {
  clearPanelTimers();
});

watch(() => props.visible, (val) => {
  if (val) {
    exiting.value = false;
    show.value = false;
    showButtons.value = false;
    panelPhase.value = 0;
    clearPanelTimers();
    requestAnimationFrame(() => {
      show.value = true;
      panelTimers.push(setTimeout(() => { panelPhase.value = 1; }, 400));
      panelTimers.push(setTimeout(() => { panelPhase.value = 2; }, 900));
      panelTimers.push(setTimeout(() => { panelPhase.value = 3; }, 1400));
      panelTimers.push(setTimeout(() => { showButtons.value = true; }, 1900));
    });
  }
}, { immediate: true });

function close() {
  exiting.value = true;
  clearPanelTimers();
  setTimeout(() => {
    show.value = false;
    exiting.value = false;
    panelPhase.value = 0;
  }, 400);
}

defineExpose({ close });
</script>

<style scoped>
.level-settle {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: calc(100dvh - 140px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 10px 0 20px;
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 350ms ease, transform 350ms ease;
  z-index: 10;
}

.level-settle.show {
  opacity: 1;
  transform: translateY(0);
}

.level-settle.exiting {
  opacity: 0;
  transform: translateY(6px);
}

.settle-content-wrap {
  position: relative;
  top: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
  margin-bottom: auto;
}

.settle-banner {
  width: min(75%, 300px);
  margin-top: -60px;
  transform: translateY(-12px) scale(0.88);
  opacity: 0;
  transition: transform 450ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease;
  z-index: 5;
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

.settle-reward-frame {
  position: relative;
  width: min(85%, 340px);
  margin-top: -25px;
  transform: translateY(20px) scale(0.94);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 80ms, opacity 350ms ease 80ms;
  z-index: 4;
}

.settle-reward-frame.frame-in {
  transform: translateY(-10px) scale(1);
  opacity: 1;
}

.settle-reward-frame > img {
  width: 100%;
  height: auto;
  display: block;
}

.reward-cards {
  position: absolute;
  inset: 18% 12% 22%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  z-index: 5;
  transform: translateY(40px);
}

.reward-card {
  flex: 1;
  max-width: 80px;
  cursor: pointer;
  transition: transform 200ms ease;
  -webkit-tap-highlight-color: transparent;
}

.reward-card:active {
  transform: scale(0.92);
}

.reward-card img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  transition: filter 300ms ease, box-shadow 300ms ease;
}

.reward-card.blue.glow-active img {
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 1)) drop-shadow(0 0 24px rgba(59, 130, 246, 0.8)) drop-shadow(0 0 36px rgba(59, 130, 246, 0.6));
  animation: cardGlowBlue 600ms ease-out forwards;
}

.reward-card.purple.glow-active img {
  filter: drop-shadow(0 0 12px rgba(147, 51, 234, 1)) drop-shadow(0 0 24px rgba(147, 51, 234, 0.8)) drop-shadow(0 0 36px rgba(147, 51, 234, 0.6));
  animation: cardGlowPurple 600ms ease-out forwards;
}

.reward-card.gold.glow-active img {
  filter: drop-shadow(0 0 12px rgba(234, 179, 8, 1)) drop-shadow(0 0 24px rgba(234, 179, 8, 0.8)) drop-shadow(0 0 36px rgba(234, 179, 8, 0.6));
  animation: cardGlowGold 600ms ease-out forwards;
}

.reward-card.fade-out {
  opacity: 0;
  transform: scale(0.8);
  pointer-events: none;
  transition: opacity 400ms ease, transform 400ms ease;
}

.reward-card.move-center {
  position: relative;
  z-index: 10;
  transition: transform 500ms cubic-bezier(0.16, 1, 0.3, 1);
}

.reward-cards.has-selected .reward-card.move-center {
  transform: translateX(var(--center-offset, 0));
}

@keyframes cardGlowBlue {
  0% { filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.5)); transform: scale(1); }
  40% { filter: drop-shadow(0 0 20px rgba(59, 130, 246, 1)) drop-shadow(0 0 40px rgba(59, 130, 246, 0.8)); transform: scale(1.08); }
  100% { filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.6)); transform: scale(1); }
}

@keyframes cardGlowPurple {
  0% { filter: drop-shadow(0 0 4px rgba(147, 51, 234, 0.5)); transform: scale(1); }
  40% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 1)) drop-shadow(0 0 40px rgba(147, 51, 234, 0.8)); transform: scale(1.08); }
  100% { filter: drop-shadow(0 0 8px rgba(147, 51, 234, 0.9)) drop-shadow(0 0 16px rgba(147, 51, 234, 0.6)); transform: scale(1); }
}

@keyframes cardGlowGold {
  0% { filter: drop-shadow(0 0 4px rgba(234, 179, 8, 0.5)); transform: scale(1); }
  40% { filter: drop-shadow(0 0 20px rgba(234, 179, 8, 1)) drop-shadow(0 0 40px rgba(234, 179, 8, 0.8)); transform: scale(1.08); }
  100% { filter: drop-shadow(0 0 8px rgba(234, 179, 8, 0.9)) drop-shadow(0 0 16px rgba(234, 179, 8, 0.6)); transform: scale(1); }
}

.settle-character {
  position: absolute;
  left: -60px;
  bottom: 0px;
  width: 45%;
  max-width: 200px;
  z-index: 10;
  pointer-events: none;
  transform: translateX(-30px) translateY(20px);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, opacity 350ms ease 200ms;
}

.settle-character.char-in {
  transform: translateX(0) translateY(0);
  opacity: 1;
}

.settle-character img {
  width: 100%;
  height: auto;
  display: block;
}

.settle-detail-frame {
  position: relative;
  left: 40px;
  width: min(81%, 324px);
  margin-top: -20px;
  transform: translateX(0) translateY(20px) scale(0.9);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 180ms, opacity 350ms ease 180ms;
  z-index: 3;
}

.settle-detail-frame.frame-in {
  transform: translateX(0) translateY(0) scale(1);
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
  opacity: 0;
}

.detail-panel.panel-in {
  animation: panelReveal 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.panel-combo.panel-in {
  animation: panelRevealCombo 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.panel-moves.panel-in {
  animation: panelRevealMoves 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes panelReveal {
  from { opacity: 0; transform: translateY(10px) scale(0.88); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes panelRevealCombo {
  from { opacity: 0; transform: translateX(-12px) translateY(10px) scale(0.88); }
  to { opacity: 1; transform: translateX(-12px) translateY(0) scale(1); }
}

@keyframes panelRevealMoves {
  from { opacity: 0; transform: translateX(-20px) translateY(10px) scale(0.88); }
  to { opacity: 1; transform: translateX(-20px) translateY(0) scale(1); }
}

.stars-row {
  display: flex;
  gap: 2px;
}

.stars-row img {
  width: 18px;
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
  font-size: 9px;
  font-weight: 700;
}

.panel-tag.perfect-1 { color: #c4a574; }
.panel-tag.perfect-2 { color: #e0e0e0; }
.panel-tag.perfect-3 {
  color: #ff8c00;
  text-shadow:
    0 0 0 #fff,
    0 0 2px #fff,
    0 0 4px #fff,
    0 1px 2px rgba(0,0,0,0.5);
}

.panel-score {
  font-size: 13px;
  font-weight: 900;
  color: #1a5c2e;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.2);
}

.panel-title {
  font-size: 9px;
  color: #2d6a3f;
  white-space: nowrap;
}

.panel-bonus {
  font-size: 12px;
  font-weight: 900;
  color: #1a5c2e;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.2);
  white-space: nowrap;
}

.panel-sub {
  font-size: 8px;
  color: #4a7c59;
  white-space: nowrap;
}

.settle-dialog {
  position: relative;
  left: 35px;
  width: min(70%, 280px);
  margin-top: -5px;
  transform: translateX(0) translateY(10px) scale(0.9075);
  opacity: 0;
  transition: transform 400ms cubic-bezier(0.16, 1, 0.3, 1) 300ms, opacity 350ms ease 300ms;
  flex-shrink: 0;
  z-index: 6;
}

.settle-dialog.dialog-in {
  transform: translateX(0) translateY(0) scale(1);
  opacity: 1;
}

.settle-dialog img {
  width: 100%;
  height: auto;
  display: block;
  transform: scaleY(0.5);
  transform-origin: top;
}

.settle-dialog p {
  position: absolute;
  inset: -35% 10% 8% 14%;
  margin: 0;
  font-size: 11px;
  color: #5a3d1a;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.settle-buttons {
  position: relative;
  left: 25px;
  display: flex;
  justify-content: center;
  gap: 10px;
  transform: translateX(0) translateY(20px);
  opacity: 0;
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1) 500ms, opacity 300ms ease 500ms;
  margin-top: -45px;
  margin-bottom: 20px;
  z-index: 7;
  flex-shrink: 0;
}

.settle-buttons.buttons-in {
  transform: translateX(0) translateY(0);
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
  width: 100px;
}

.settle-btn.next {
  width: 110px;
}
</style>
