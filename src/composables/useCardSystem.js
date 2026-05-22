import { reactive, computed } from 'vue';
import {
  mockDrawCard,
  mockRedeemCard,
  mockGetUserCards,
  CARD_LEVELS,
  CARD_TYPES,
  CARD_IMAGE_POOL
} from '../config/cardSystem';

const STORAGE_KEY = 'guizhou-card-inventory';

export function useCardSystem() {
  const state = reactive({
    cards: [],
    isLoading: false,
    error: null,
  });

  // 动态计算所有存在的地区
  const availableLocations = computed(() => {
    const locations = new Set();
    CARD_IMAGE_POOL.forEach(img => {
      if (img.location) locations.add(img.location);
    });
    return Array.from(locations).sort();
  });

  // 按等级分组的卡牌
  const cardsByLevel = computed(() => {
    const grouped = { blue: [], purple: [], gold: [], red: [] };
    state.cards.forEach(card => {
      if (grouped[card.level]) {
        grouped[card.level].push(card);
      }
    });
    return grouped;
  });

  // 未使用的卡牌
  const unusedCards = computed(() =>
    state.cards.filter(card => card.status === 'unused')
  );

  // 已兑换的卡牌
  const redeemedCards = computed(() =>
    state.cards.filter(card => card.status === 'redeemed')
  );

  // 统计各等级数量
  const levelCounts = computed(() => ({
    blue: cardsByLevel.value.blue.length,
    purple: cardsByLevel.value.purple.length,
    gold: cardsByLevel.value.gold.length,
    red: cardsByLevel.value.red.length,
  }));

  // 加载用户卡牌
  async function loadCards() {
    state.isLoading = true;
    state.error = null;
    try {
      // TODO: 替换为真实API
      // const response = await fetch('/api/card/list');
      // const data = await response.json();
      const data = await mockGetUserCards();
      state.cards = data;
    } catch (err) {
      state.error = err.message;
      console.error('加载卡牌失败:', err);
    } finally {
      state.isLoading = false;
    }
  }

  // 抽卡
  async function drawCard() {
    state.isLoading = true;
    state.error = null;
    try {
      // TODO: 替换为真实API
      // const response = await fetch('/api/card/draw', { method: 'POST' });
      // const data = await response.json();
      const card = await mockDrawCard();
      state.cards.unshift(card);
      saveToStorage();
      return card;
    } catch (err) {
      state.error = err.message;
      console.error('抽卡失败:', err);
      return null;
    } finally {
      state.isLoading = false;
    }
  }

  // 兑换卡牌
  async function redeemCard(instanceId) {
    state.isLoading = true;
    state.error = null;
    try {
      // TODO: 替换为真实API
      // const response = await fetch('/api/card/redeem', {
      //   method: 'POST',
      //   body: JSON.stringify({ instanceId })
      // });
      // const data = await response.json();
      const result = await mockRedeemCard(instanceId);

      // 更新本地状态
      const card = state.cards.find(c => c.instanceId === instanceId);
      if (card) {
        card.status = 'redeemed';
        card.redemptionCode = result.redemptionCode;
        card.expireAt = result.expireAt;
        saveToStorage();
      }

      return result;
    } catch (err) {
      state.error = err.message;
      console.error('兑换失败:', err);
      return null;
    } finally {
      state.isLoading = false;
    }
  }

  // 保存到本地存储
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cards));
  }

  // 初始化加载
  loadCards();

  return {
    state,
    cardsByLevel,
    unusedCards,
    redeemedCards,
    levelCounts,
    loadCards,
    drawCard,
    redeemCard,
    CARD_LEVELS,
    CARD_TYPES,
    availableLocations
  };
}
