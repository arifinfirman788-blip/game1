import { reactive, computed } from 'vue';
import {
  mockDrawCard,
  mockRedeemCard,
  mockGetUserCards,
  CARD_LEVELS,
  CARD_TYPES,
  CARD_IMAGE_POOL
} from '../config/cardSystem';
import { drawCardApi, redeemCardApi } from '../api/gameApi';
import { getGameUser, usePlayerProgress } from './usePlayerProgress';
import { showToast } from 'vant';

const STORAGE_KEY = 'guizhou-card-inventory';

// 全局单例状态，确保所有组件共享同一个数据源
const globalState = reactive({
  cards: [],
  isLoading: false,
  error: null,
});

export function useCardSystem() {
  const state = globalState;


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
    state.cards.filter(card => card.status === 'redeemed' || card.status === 'added')
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
      // 从localStorage读取
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsedCards = JSON.parse(stored);
        // 强制修复缓存中的旧图片：无论缓存里存的是什么，统一从最新的 CARD_IMAGE_POOL 里匹配
        parsedCards = parsedCards.map(card => {
          // 仅在卡牌没有真实图片链接时，或者图片是旧的本地占位图时，才使用本地的占位图兜底
          if (!card.imageUrl || card.imageUrl.includes('picsum.photos') || card.imageUrl.startsWith('/image/')) {
            const template = CARD_IMAGE_POOL.find(img => img.id === card.imageId || img.name === card.name);
            if (template) {
              card.imageUrl = template.url;
              if (!card.name) card.name = template.name;
            }
          }
          
          // 如果卡牌没有具体的权益名称或者是旧的"游戏道具礼包"，也重新分配一个 mock 权益
          if (!card.reward || card.reward.name === '游戏道具礼包') {
             // 防止循环依赖或缺少引用，仅在缺失时给个默认值
             card.reward = { name: '游戏道具: 锤子+1', type: 'ingame' };
          }
          return card;
        });
        state.cards = parsedCards;
      } else {
        state.cards = [];
      }
    } catch (err) {
      state.error = err.message;
      console.error('加载卡牌失败:', err);
    } finally {
      state.isLoading = false;
    }
  }

  /** 从后端加载卡牌数据 */
  async function loadFromBackend(cardsData) {
    if (cardsData && Array.isArray(cardsData)) {
      state.cards = cardsData;
      saveToStorage();
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cards));
  }

  // 抽卡
  async function drawCard() {
    state.isLoading = true;
    state.error = null;
    try {
      const user = getGameUser();
      let card;
      // 强制开启前端Mock测试，为了给您展示严格的“3种权益”及“1分购/代金券去重”逻辑。
      // 后续如果后端接口开发完毕，将 FORCE_MOCK 改为 false 即可。
      const FORCE_MOCK = true; 
      
      if (user.uid && user.phone && !FORCE_MOCK) {
        // 调用后端API（token自动带在header中）
        card = await drawCardApi();
      } else {
        // 降级：使用本地mock逻辑
        const { mockDrawCard } = await import('../config/cardSystem');
        card = await mockDrawCard();
      }

      // 如果抽到游戏道具，直接发放并标记为已添加
      if (card && card.reward && card.reward.type === 'ingame') {
        const player = usePlayerProgress();
        let boosterType = 'hammer';
        if (card.reward.name.includes('魔法瓶')) boosterType = 'bottle';
        else if (card.reward.name.includes('花')) boosterType = 'flower';
        else if (card.reward.name.includes('面具')) boosterType = 'mask';
        else if (card.reward.name.includes('手')) boosterType = 'hand';
        
        player.addBooster(boosterType, 1);
        card.status = 'added'; // 标记为已使用（已添加至背包）
      }

      state.cards.unshift(card);
      saveToStorage();
      return card;
    } catch (err) {
      state.error = err.message;
      console.error('抽卡失败:', err);
      showToast(err.message || '抽卡失败');
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
      const user = getGameUser();
      let result;
      if (user.uid && user.phone) {
        // 调用后端API（token自动带在header中）
        result = await redeemCardApi(instanceId);
      } else {
        // 降级：使用本地mock逻辑
        const { mockRedeemCard } = await import('../config/cardSystem');
        result = await mockRedeemCard(instanceId);
      }

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
      console.error('兑换卡牌失败:', err);
      showToast(err.message || '兑换失败');
      throw err;
    } finally {
      state.isLoading = false;
    }
  }

  // 辅助方法：清空本地卡包（用于调试和重置测试环境）
  function clearInventory() {
    state.cards = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  // 初始化加载
  if (state.cards.length === 0) {
    loadCards();
  }

  return {
    state,
    cardsByLevel,
    unusedCards,
    redeemedCards,
    levelCounts,
    loadCards,
    loadFromBackend,
    drawCard,
    redeemCard,
    CARD_LEVELS,
    CARD_TYPES,
    availableLocations,
    clearInventory
  };
}
