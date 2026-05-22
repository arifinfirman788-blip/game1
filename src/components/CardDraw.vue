<template>
  <div class="card-draw-container">
    <div class="card-draw-area" :class="{ 'has-drawn': drawnCard }">
      <!-- 三张背面卡牌 -->
      <template v-if="!drawnCard">
        <div
          v-for="index in 3"
          :key="index"
          class="draw-card back"
          :class="{
            'glow': isGlowing && glowingIndex === index - 1,
            'flip': isFlipping && flippingIndex === index - 1
          }"
          @click="handleDraw(index - 1)"
        >
          <img :src="cardBackImage" alt="卡牌背面" decoding="async" />
        </div>
      </template>

      <!-- 抽中的卡牌正面 -->
      <div
        v-else
        class="draw-card front"
        :class="[drawnCard.level, 'revealed']"
      >
        <div class="card-image-wrapper">
          <img :src="drawnCard.imageUrl" :alt="drawnCard.name" decoding="async" />
          <!-- 卡牌信息叠加在图片上 -->
          <div class="card-info-overlay">
            <div class="card-name">{{ drawnCard.name }}</div>
            <div class="card-level" :style="{ color: CARD_LEVELS[drawnCard.level]?.color }">
              {{ CARD_LEVELS[drawnCard.level]?.shortName }}
            </div>
            <div class="card-reward">
              <span class="reward-icon">{{ drawnCard.reward?.icon }}</span>
              <span class="reward-name">{{ drawnCard.reward?.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CARD_BACK_TEMPLATE, CARD_LEVELS } from '../config/cardSystem';
import { useCardSystem } from '../composables/useCardSystem';

const emit = defineEmits(['continue']);

const { drawCard } = useCardSystem();

const cardBackImage = CARD_BACK_TEMPLATE;
const isGlowing = ref(false);
const glowingIndex = ref(-1);
const isFlipping = ref(false);
const flippingIndex = ref(-1);
const drawnCard = ref(null);

async function handleDraw(index) {
  if (isGlowing.value || isFlipping.value || drawnCard.value) return;

  // 第一阶段：发光
  isGlowing.value = true;
  glowingIndex.value = index;

  await new Promise(resolve => setTimeout(resolve, 600));

  // 第二阶段：翻转
  isGlowing.value = false;
  isFlipping.value = true;
  flippingIndex.value = index;

  // 调用抽卡逻辑
  const card = await drawCard();

  await new Promise(resolve => setTimeout(resolve, 400));

  if (card) {
    drawnCard.value = card;
  }

  isFlipping.value = false;
  flippingIndex.value = -1;
}
</script>

<style scoped>
.card-draw-container {
  position: absolute;
  inset: 18% 12% 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.card-draw-area {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 100%;
}

.card-draw-area.has-drawn {
  gap: 0;
}

.draw-card {
  width: 22%;
  max-width: 60px;
  cursor: pointer;
  transition: transform 300ms ease, opacity 400ms ease;
  -webkit-tap-highlight-color: transparent;
}

.draw-card.back {
  animation: cardFloat 2s ease-in-out infinite;
}

.draw-card.back:nth-child(2) {
  animation-delay: 0.3s;
}

.draw-card.back:nth-child(3) {
  animation-delay: 0.6s;
}

/* 发光效果 */
.draw-card.back.glow {
  animation: cardGlow 600ms ease-out forwards;
}

.draw-card.back.glow img {
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))
          drop-shadow(0 0 24px rgba(255, 215, 0, 0.7))
          drop-shadow(0 0 36px rgba(255, 215, 0, 0.5));
}

/* 翻转效果 */
.draw-card.back.flip {
  animation: cardFlip 400ms ease-out forwards;
}

.draw-card.back.flip img {
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))
          drop-shadow(0 0 24px rgba(255, 215, 0, 0.7))
          drop-shadow(0 0 36px rgba(255, 215, 0, 0.5));
}

.draw-card.back:active {
  transform: scale(0.95);
}

.draw-card img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
}

/* 正面卡牌样式 */
.draw-card.front {
  width: 40%;
  max-width: 100px;
  margin-top: 40px;
  animation: cardReveal 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.draw-card.front.blue {
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.9))
          drop-shadow(0 0 24px rgba(59, 130, 246, 0.7));
}

.draw-card.front.purple {
  filter: drop-shadow(0 0 12px rgba(147, 51, 234, 0.9))
          drop-shadow(0 0 24px rgba(147, 51, 234, 0.7));
}

.draw-card.front.gold {
  filter: drop-shadow(0 0 16px rgba(234, 179, 8, 0.9))
          drop-shadow(0 0 32px rgba(234, 179, 8, 0.7));
}

.draw-card.front.red {
  filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.9))
          drop-shadow(0 0 40px rgba(239, 68, 68, 0.7));
}

.card-image-wrapper {
  position: relative;
  width: 100%;
}

.card-image-wrapper img {
  width: 100%;
  height: auto;
  border-radius: 6px;
  display: block;
}

/* 卡牌信息叠加层 */
.card-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 6px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 30%, rgba(0, 0, 0, 0.85) 100%);
  border-radius: 0 0 6px 6px;
  text-align: center;
}

.card-name {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.card-level {
  font-size: 10px;
  font-weight: 600;
  margin-top: 2px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.card-reward {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  margin-top: 4px;
  padding: 2px 6px;
  background: rgba(255, 244, 209, 0.95);
  border-radius: 4px;
  font-size: 9px;
  color: #5a3d1a;
}

.reward-icon {
  font-size: 10px;
}

.reward-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes cardGlow {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
}

@keyframes cardFlip {
  0% { transform: rotateY(0) scale(1.1); }
  50% { transform: rotateY(90deg) scale(1.1); }
  100% { transform: rotateY(180deg) scale(1.1); }
}

@keyframes cardReveal {
  0% { transform: scale(0.3) rotateY(180deg); opacity: 0; }
  100% { transform: scale(1) rotateY(0); opacity: 1; }
}
</style>
