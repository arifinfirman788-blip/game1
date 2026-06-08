<template>
  <div class="card-draw-container">
    <div class="card-draw-area" :class="{ 'has-drawn': drawnCard }">
      <!-- 三张背面卡牌 -->
      <template v-if="!drawnCard">
        <div
          v-for="index in 3"
          :key="index"
          class="draw-card back"
          :class="[
            {
              'glow': isGlowing && glowingIndex === index - 1,
              'flip': isFlipping && flippingIndex === index - 1
            },
            ((isGlowing && glowingIndex === index - 1) || (isFlipping && flippingIndex === index - 1)) && predictedLevel ? `glow-${predictedLevel}` : ''
          ]"
          @click="handleDraw(index - 1)"
        >
          <img :src="cardBackImage" alt="卡牌背面" decoding="async" />
        </div>
      </template>

      <!-- 抽中的卡牌正面 -->
      <div
        v-else
        class="draw-card front physical-card"
        :class="[(drawnCard.level || drawnCard.cardLevel || 'blue').toLowerCase(), 'revealed']"
        :style="{ '--level-color': CARD_LEVELS[(drawnCard.level || drawnCard.cardLevel || 'blue').toLowerCase()]?.color }"
      >
        <div class="physical-card-inner">
          <!-- 上方风景图 -->
          <div class="card-top-scenic">
            <img :src="drawnCard.imageUrl" :alt="drawnCard.name" decoding="async" />
            <div class="card-badge">{{ CARD_LEVELS[(drawnCard.level || drawnCard.cardLevel || 'blue').toLowerCase()]?.shortName }}</div>
          </div>
          <!-- 下方权益区 -->
          <div class="card-bottom-content">
            <div class="scenic-name">{{ drawnCard.name }}</div>
            <div class="divider"></div>
            <div class="reward-box">
              <div class="reward-title">包含权益</div>
              <div class="reward-info">
                <span class="reward-name">{{ drawnCard.reward?.name }}</span>
              </div>
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
const predictedLevel = ref(null); // 预测即将抽到的卡牌等级，用于发光颜色对应

async function handleDraw(index) {
  if (isGlowing.value || isFlipping.value || drawnCard.value) return;

  // 第一阶段：发光前先获取抽卡结果，以知晓颜色
  const card = await drawCard();
  if (card) {
    // 确保level统一为小写，防止后端返回大写导致样式不匹配
    predictedLevel.value = (card.level || card.cardLevel || 'blue').toLowerCase();
  }

  isGlowing.value = true;
  glowingIndex.value = index;

  await new Promise(resolve => setTimeout(resolve, 600));

  // 第二阶段：翻转
  isGlowing.value = false;
  isFlipping.value = true;
  flippingIndex.value = index;

  await new Promise(resolve => setTimeout(resolve, 400));

  if (card) {
    drawnCard.value = card;
  }

  isFlipping.value = false;
  flippingIndex.value = -1;
  predictedLevel.value = null;
}
</script>

<style scoped>
.card-draw-container {
  position: absolute;
  inset: 12% 10% 12%;
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
  transform: translateY(35px);
}

.draw-card {
  width: 25%;
  max-width: 55px;
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

/* 发光效果 - 默认及各等级光晕 */
.draw-card.back.glow {
  animation: cardGlow 600ms ease-out forwards;
}

/* 蓝卡 (普通) */
.draw-card.back.glow.glow-blue img,
.draw-card.back.flip.glow-blue img {
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.9))
          drop-shadow(0 0 24px rgba(59, 130, 246, 0.7))
          drop-shadow(0 0 36px rgba(59, 130, 246, 0.5));
}

/* 紫卡 (稀有) */
.draw-card.back.glow.glow-purple img,
.draw-card.back.flip.glow-purple img {
  filter: drop-shadow(0 0 12px rgba(147, 51, 234, 0.9))
          drop-shadow(0 0 24px rgba(147, 51, 234, 0.7))
          drop-shadow(0 0 36px rgba(147, 51, 234, 0.5));
}

/* 金卡 (史诗) */
.draw-card.back.glow.glow-gold img,
.draw-card.back.flip.glow-gold img {
  filter: drop-shadow(0 0 12px rgba(234, 179, 8, 0.9))
          drop-shadow(0 0 24px rgba(234, 179, 8, 0.7))
          drop-shadow(0 0 36px rgba(234, 179, 8, 0.5));
}

/* 红卡 (传说) */
.draw-card.back.glow.glow-red img,
.draw-card.back.flip.glow-red img {
  filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))
          drop-shadow(0 0 24px rgba(239, 68, 68, 0.7))
          drop-shadow(0 0 36px rgba(239, 68, 68, 0.5));
}

/* 翻转效果 */
.draw-card.back.flip {
  animation: cardFlip 400ms ease-out forwards;
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

/* 正面卡牌样式 - 实体卡片造型 */
.draw-card.front.physical-card {
  width: 50%;
  max-width: 110px;
  margin-top: 0px;
  animation: cardReveal 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.physical-card-inner {
  width: 100%;
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15), inset 0 0 0 1px var(--level-color, #ccc);
  display: flex;
  flex-direction: column;
}

.card-top-scenic {
  position: relative;
  width: 100%;
  height: 85px;
  background-color: #f0f0f0;
}

.card-top-scenic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.card-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--level-color, #ccc);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.card-bottom-content {
  padding: 6px 4px;
  text-align: center;
  background: linear-gradient(180deg, #ffffff 0%, #fdfbf7 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.scenic-name {
  font-size: 11px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.divider {
  width: 70%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent);
  margin: 0 auto 4px;
}

.reward-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.reward-title {
  font-size: 8px;
  color: #888;
}

.reward-info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 244, 209, 0.95);
  padding: 2px 4px;
  border-radius: 8px;
  border: 1px solid rgba(217, 119, 6, 0.2);
  width: 95%;
  box-sizing: border-box;
}

/* 删除reward-icon相关样式 */

.reward-name {
  font-size: 9px;
  color: #d97706;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 1.1;
  text-align: center;
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
