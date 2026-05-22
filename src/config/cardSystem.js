// ============================================
// 卡牌系统配置
// ============================================
// TODO: 后端API接入后，替换为真实数据接口

// 引入本地图片，确保Vite能正确打包并处理路径
import blueCardUrl from '../../image/card-blue.png';
import purpleCardUrl from '../../image/card-purple.png';
import goldCardUrl from '../../image/card-gold.png';
import redCardUrl from '../../image/card-gold.png'; // 暂用金色卡片代替，如果有红色卡片请修改此路径

// 卡牌等级配置
export const CARD_LEVELS = {
  blue: {
    id: 'blue',
    name: '普通',
    shortName: 'R',
    color: '#3b82f6',
    probability: 0.6,
    glowColor: 'rgba(59, 130, 246, 0.9)',
  },
  purple: {
    id: 'purple',
    name: '稀有',
    shortName: 'SR',
    color: '#9333ea',
    probability: 0.3,
    glowColor: 'rgba(147, 51, 234, 0.9)',
  },
  gold: {
    id: 'gold',
    name: '史诗',
    shortName: 'SSR',
    color: '#eab308',
    probability: 0.09,
    glowColor: 'rgba(234, 179, 8, 0.9)',
  },
  red: {
    id: 'red',
    name: '传说',
    shortName: 'UR',
    color: '#ef4444',
    probability: 0.01,
    glowColor: 'rgba(239, 68, 68, 0.9)',
  },
};

// 卡牌图片库（Mock数据）
// TODO: 接入后端后，通过 API GET /api/card/image-pool 获取
export const CARD_IMAGE_POOL = [
  {
    id: 'img_001',
    url: blueCardUrl,
    name: '黄果树瀑布',
    description: '亚洲第一大瀑布，气势磅礴',
    level: 'blue',
    location: '安顺市',
    type: 'scenic',
  },
  {
    id: 'img_002',
    url: blueCardUrl,
    name: '荔波小七孔',
    description: '地球腰带上的绿宝石',
    level: 'blue',
    location: '黔南州',
    type: 'scenic',
  },
  {
    id: 'img_003',
    url: purpleCardUrl,
    name: '西江千户苗寨',
    description: '世界上最大的苗族聚居村寨',
    level: 'purple',
    location: '黔东南州',
    type: 'culture',
  },
  {
    id: 'img_004',
    url: purpleCardUrl,
    name: '镇远古镇',
    description: '滇楚锁钥，黔东门户',
    level: 'purple',
    location: '黔东南州',
    type: 'culture',
  },
  {
    id: 'img_005',
    url: goldCardUrl,
    name: '梵净山',
    description: '梵天净土，弥勒道场',
    level: 'gold',
    location: '铜仁市',
    type: 'scenic',
  },
  {
    id: 'img_006',
    url: goldCardUrl,
    name: '赤水丹霞',
    description: '世界自然遗产，千瀑之城',
    level: 'gold',
    location: '遵义市',
    type: 'scenic',
  },
  {
    id: 'img_007',
    url: redCardUrl,
    name: '遵义会议会址',
    description: '历史转折点',
    level: 'red',
    location: '遵义市',
    type: 'culture',
  },
  {
    id: 'img_008',
    url: blueCardUrl,
    name: '凯里酸汤鱼',
    description: '一口鲜酸开胃，像瀑布水汽一样爽快',
    level: 'blue',
    location: '黔东南州',
    type: 'food',
  },
  {
    id: 'img_009',
    url: purpleCardUrl,
    name: '遵义羊肉粉',
    description: '热汤滚香，米粉柔滑，赶路也要吃得踏实',
    level: 'purple',
    location: '遵义市',
    type: 'food',
  }
];

// 卡牌分类配置
export const CARD_TYPES = {
  scenic: { id: 'scenic', name: '景区' },
  culture: { id: 'culture', name: '文化' },
  food: { id: 'food', name: '美食' },
};

// 权益池（Mock数据）
// TODO: 接入后端后，通过 API GET /api/card/reward-pool 获取
export const REWARD_POOL = [
  {
    id: 'reward_001',
    name: '游戏道具礼包',
    description: '锤子×3 + 步数+5',
    type: 'ingame',
    applicableLevels: ['blue'],
    miniProgramPath: '',
    icon: '🎁',
  },
  {
    id: 'reward_002',
    name: '景区门票9折',
    description: '贵州任意景区门票9折优惠',
    type: 'discount',
    applicableLevels: ['blue', 'purple'],
    miniProgramPath: '/pages/ticket/list',
    icon: '🎫',
  },
  {
    id: 'reward_003',
    name: '酸汤鱼代金券',
    description: '满100减20元',
    type: 'coupon',
    applicableLevels: ['purple', 'gold'],
    miniProgramPath: '/pages/coupon/detail?id=123',
    icon: '🍲',
  },
  {
    id: 'reward_004',
    name: '苗银手作体验',
    description: '免费体验苗银锻造1次',
    type: 'experience',
    applicableLevels: ['gold', 'red'],
    miniProgramPath: '/pages/experience/silver',
    icon: '🔨',
  },
  {
    id: 'reward_005',
    name: '贵州5日游免单',
    description: '包含机票+酒店+门票',
    type: 'grand',
    applicableLevels: ['red'],
    miniProgramPath: '/pages/travel/detail?id=999',
    icon: '✈️',
  },
];

// 卡牌背面模板
export const CARD_BACK_TEMPLATE = purpleCardUrl;

// ============================================
// Mock API 接口（预留后端接入点）
// ============================================

/**
 * 模拟抽卡API
 * TODO: 替换为真实API调用
 * POST /api/card/draw
 */
export async function mockDrawCard() {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 随机确定卡牌等级
  const random = Math.random();
  let level;
  if (random < CARD_LEVELS.red.probability) {
    level = 'red';
  } else if (random < CARD_LEVELS.red.probability + CARD_LEVELS.gold.probability) {
    level = 'gold';
  } else if (random < CARD_LEVELS.red.probability + CARD_LEVELS.gold.probability + CARD_LEVELS.purple.probability) {
    level = 'purple';
  } else {
    level = 'blue';
  }

  // 从对应等级的图片中随机选择
  const levelImages = CARD_IMAGE_POOL.filter(img => img.level === level);
  const image = levelImages[Math.floor(Math.random() * levelImages.length)];

  // 从适用权益中随机选择
  const applicableRewards = REWARD_POOL.filter(r => r.applicableLevels.includes(level));
  const reward = applicableRewards[Math.floor(Math.random() * applicableRewards.length)];

  return {
    instanceId: `card_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    imageId: image.id,
    name: image.name,
    description: image.description,
    imageUrl: image.url,
    level: level,
    location: image.location,
    type: image.type,
    reward: {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      miniProgramPath: reward.miniProgramPath,
      icon: reward.icon,
    },
    obtainedAt: new Date().toISOString(),
    status: 'unused',
    redemptionCode: null,
  };
}

/**
 * 模拟兑换API
 * TODO: 替换为真实API调用
 * POST /api/card/redeem
 */
export async function mockRedeemCard(instanceId) {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    redemptionCode: `GUI${Date.now().toString(36).toUpperCase()}`,
    expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    miniProgramPath: '/pages/redeem/detail',
  };
}

/**
 * 模拟获取用户卡牌列表
 * TODO: 替换为真实API调用
 * GET /api/card/list
 */
export async function mockGetUserCards() {
  await new Promise(resolve => setTimeout(resolve, 200));
  // 从localStorage读取
  const stored = localStorage.getItem('guizhou-card-inventory');
  if (stored) {
    let cards = JSON.parse(stored);
    // 兼容处理：修正缓存中带有旧的 /image/ 绝对路径的情况，使用最新的资源引用
    cards = cards.map(card => {
      const template = CARD_IMAGE_POOL.find(img => img.id === card.imageId);
      if (template) {
        card.imageUrl = template.url;
      }
      return card;
    });
    return cards;
  }
  return [];
}
