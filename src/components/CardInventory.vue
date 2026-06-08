<template>
  <section class="card-inventory" :class="{ 'show': show }">
    <header class="inventory-header">
      <button class="back-btn" @click="handleBack">
        <span>←</span>
      </button>
      <h2>我的卡牌</h2>
      <span class="card-count">共 {{ totalCards }} 张</span>
    </header>

    <!-- 筛选大类标签 -->
    <div class="filter-categories">
      <button 
        class="category-btn" 
        :class="{ active: filterCategory === 'level' }"
        @click="filterCategory = 'level'"
      >按等级</button>
      <button 
        class="category-btn" 
        :class="{ active: filterCategory === 'type' }"
        @click="filterCategory = 'type'"
      >按类型</button>
      <button 
        class="category-btn" 
        :class="{ active: filterCategory === 'location' }"
        @click="filterCategory = 'location'"
      >按地区</button>
    </div>

    <!-- 二级筛选标签 -->
    <div class="filter-tabs">
      <button
        v-for="tab in currentTabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeFilter === tab.id }"
        @click="activeFilter = tab.id"
      >
        <span v-if="tab.color" class="tab-dot" :style="{ background: tab.color }"></span>
        {{ tab.name }}
        <span class="tab-count">({{ tab.count || 0 }})</span>
      </button>
    </div>

    <!-- 卡牌列表 -->
    <div class="cards-grid">
      <div
        v-for="card in filteredCards"
        :key="card.instanceId"
        class="inventory-card"
        :class="[card.level, { 'redeemed': card.status === 'redeemed' || card.status === 'used' || card.status === 'added' }]"
        @click="handleCardClick(card)"
      >
        <div class="card-image">
          <img :src="card.imageUrl" :alt="card.name" decoding="async" />
          <div v-if="card.status === 'redeemed' || card.status === 'used' || card.status === 'added'" class="redeemed-badge">
            {{ card.status === 'added' ? '已添加' : (card.status === 'used' ? '已核销' : '已兑换') }}
          </div>
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
      <p>还没有符合条件的卡牌</p>
      <p class="empty-hint">通关关卡即可获得卡牌</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { CARD_LEVELS, CARD_TYPES } from '../config/cardSystem';
import { useCardSystem } from '../composables/useCardSystem';

const emit = defineEmits(['back', 'select-card']);

const props = defineProps({
  show: Boolean,
});

const { state, availableLocations } = useCardSystem();

// 筛选大类：'level' | 'type' | 'location'
const filterCategory = ref('level');
// 二级筛选值
const activeFilter = ref('all');

// 当切换大类时，重置二级筛选为全部
watch(filterCategory, () => {
  activeFilter.value = 'all';
});

// 计算各类别的数量统计
const counts = computed(() => {
  const result = { level: {}, type: {}, location: {} };
  state.cards.forEach(card => {
    // 统计等级
    result.level[card.level] = (result.level[card.level] || 0) + 1;
    // 统计类型
    if (card.type) result.type[card.type] = (result.type[card.type] || 0) + 1;
    // 统计地区
    if (card.location) result.location[card.location] = (result.location[card.location] || 0) + 1;
  });
  return result;
});

// 动态生成二级标签
const currentTabs = computed(() => {
  const allTab = { id: 'all', name: '全部', count: state.cards.length };
  
  if (filterCategory.value === 'level') {
    return [
      allTab,
      ...Object.values(CARD_LEVELS).map(l => ({
        id: l.id,
        name: l.name,
        color: l.color,
        count: counts.value.level[l.id] || 0
      }))
    ];
  }
  
  if (filterCategory.value === 'type') {
    return [
      allTab,
      ...Object.values(CARD_TYPES).map(t => ({
        id: t.id,
        name: t.name,
        count: counts.value.type[t.id] || 0
      }))
    ];
  }
  
  if (filterCategory.value === 'location') {
    return [
      allTab,
      ...availableLocations.value.map(loc => ({
        id: loc,
        name: loc,
        count: counts.value.location[loc] || 0
      }))
    ];
  }
  
  return [allTab];
});

const totalCards = computed(() => state.cards.length);

const filteredCards = computed(() => {
  if (activeFilter.value === 'all') {
    return state.cards;
  }
  
  return state.cards.filter(card => {
    if (filterCategory.value === 'level') return card.level === activeFilter.value;
    if (filterCategory.value === 'type') return card.type === activeFilter.value;
    if (filterCategory.value === 'location') return card.location === activeFilter.value;
    return true;
  });
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

/* 筛选大类标签样式 */
.filter-categories {
  display: flex;
  gap: 12px;
  padding: 12px 16px 4px;
  background: rgba(255, 255, 255, 0.4);
}

.category-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  color: #8b7355;
  padding: 4px 0;
  position: relative;
  cursor: pointer;
  font-weight: 500;
}

.category-btn.active {
  color: #5a3d1a;
  font-weight: 700;
}

.category-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 3px;
  background: #c4a574;
  border-radius: 2px;
}

/* 二级筛选标签样式 */
.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 8px 16px 12px;
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
  /* 调整为更原生的瀑布流排列/紧凑多列布局 */
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 16px;
  overflow-y: auto;
  align-content: flex-start;
}

.inventory-card {
  width: calc(50% - 6px); /* 保持两列排列，间距12px的一半 */
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 200ms ease, box-shadow 200ms ease;
  display: flex;
  flex-direction: column;
}

.inventory-card:active {
  transform: scale(0.96);
}

.inventory-card.blue {
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.inventory-card.purple {
  border: 1px solid rgba(147, 51, 234, 0.4);
  box-shadow: 0 2px 8px rgba(147, 51, 234, 0.15);
}

.inventory-card.gold {
  border: 1px solid rgba(234, 179, 8, 0.5);
  box-shadow: 0 2px 8px rgba(234, 179, 8, 0.2);
}

.inventory-card.red {
  border: 1px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.inventory-card.redeemed {
  opacity: 0.7;
  filter: grayscale(0.5);
}

.card-image {
  position: relative;
  width: 100%;
  padding-top: 135%; /* 强制固定比例以模拟实体卡牌 */
  overflow: hidden;
  background-color: #eee;
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
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
