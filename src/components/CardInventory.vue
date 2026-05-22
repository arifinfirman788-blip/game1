<template>
  <section class="card-inventory" :class="{ 'show': show }">
    <header class="inventory-header">
      <button class="back-btn" @click="handleBack">
        <span>←</span>
      </button>
      <h2>我的卡牌</h2>
      <span class="card-count">共 {{ totalCards }} 张</span>
    </header>

    <!-- 等级筛选标签 -->
    <div class="level-tabs">
      <button
        v-for="level in levelList"
        :key="level.id"
        class="tab-btn"
        :class="{ active: activeLevel === level.id }"
        @click="activeLevel = level.id"
      >
        <span class="tab-dot" :style="{ background: level.color }"></span>
        {{ level.name }}
        <span class="tab-count">({{ levelCounts[level.id] || 0 }})</span>
      </button>
    </div>

    <!-- 卡牌列表 -->
    <div class="cards-grid">
      <div
        v-for="card in filteredCards"
        :key="card.instanceId"
        class="inventory-card"
        :class="[card.level, { 'redeemed': card.status === 'redeemed' }]"
        @click="handleCardClick(card)"
      >
        <div class="card-image">
          <img :src="card.imageUrl" :alt="card.name" decoding="async" />
          <div v-if="card.status === 'redeemed'" class="redeemed-badge">已兑换</div>
        </div>
        <div class="card-info">
          <span class="card-name">{{ card.name }}</span>
          <span class="card-reward">{{ card.reward?.name }}</span>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredCards.length === 0" class="empty-state">
      <span class="empty-icon">🎴</span>
      <p>还没有{{ activeLevelName }}卡牌</p>
      <p class="empty-hint">通关关卡即可获得卡牌</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { CARD_LEVELS } from '../config/cardSystem';
import { useCardSystem } from '../composables/useCardSystem';

const emit = defineEmits(['back', 'select-card']);

const props = defineProps({
  show: Boolean,
});

const { state, levelCounts } = useCardSystem();

const activeLevel = ref('all');

const levelList = [
  { id: 'all', name: '全部', color: '#999' },
  ...Object.values(CARD_LEVELS),
];

const activeLevelName = computed(() => {
  const level = levelList.find(l => l.id === activeLevel.value);
  return level ? level.name : '';
});

const totalCards = computed(() => state.cards.length);

const filteredCards = computed(() => {
  if (activeLevel.value === 'all') {
    return state.cards;
  }
  return state.cards.filter(card => card.level === activeLevel.value);
});

function handleBack() {
  emit('back');
}

function handleCardClick(card) {
  emit('select-card', card);
}
</script>

<style scoped>
.card-inventory {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: linear-gradient(180deg, #f5f0e8 0%, #e8e0d0 100%);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1);
}

.card-inventory.show {
  transform: translateX(0);
}

.inventory-header {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(196, 165, 116, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #5a3d1a;
  cursor: pointer;
}

.inventory-header h2 {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #5a3d1a;
  margin: 0;
}

.card-count {
  font-size: 12px;
  color: #8b7355;
}

.level-tabs {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(196, 165, 116, 0.3);
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  font-size: 12px;
  color: #5a3d1a;
  white-space: nowrap;
  cursor: pointer;
  transition: all 200ms ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #c4a574 0%, #d4b584 100%);
  color: #fff;
  border-color: transparent;
}

.tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tab-count {
  font-size: 10px;
  opacity: 0.7;
}

.cards-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  overflow-y: auto;
}

.inventory-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.inventory-card:active {
  transform: scale(0.97);
}

.inventory-card.blue {
  border: 2px solid rgba(59, 130, 246, 0.3);
}

.inventory-card.purple {
  border: 2px solid rgba(147, 51, 234, 0.3);
}

.inventory-card.gold {
  border: 2px solid rgba(234, 179, 8, 0.4);
}

.inventory-card.red {
  border: 2px solid rgba(239, 68, 68, 0.4);
}

.inventory-card.redeemed {
  opacity: 0.6;
}

.card-image {
  position: relative;
  aspect-ratio: 3/4;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.redeemed-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  border-radius: 10px;
}

.card-info {
  padding: 8px;
}

.card-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #5a3d1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-reward {
  display: block;
  font-size: 10px;
  color: #8b7355;
  margin-top: 2px;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
  color: #8b7355;
  margin: 0;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}
</style>
