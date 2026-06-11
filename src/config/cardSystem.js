// ============================================
// 卡牌系统配置
// ============================================
// TODO: 后端API接入后，替换为真实数据接口

// 引入本地图片作为占位，但主要使用真实的在线实景图片
import blueCardUrl from '../../image/card-blue.png';
import purpleCardUrl from '../../image/card-purple.png';
import goldCardUrl from '../../image/card-gold.png';

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
    shortName: 'AR',
    color: '#9333ea',
    probability: 0.25,
    glowColor: 'rgba(147, 51, 234, 0.9)',
  },
  gold: {
    id: 'gold',
    name: '史诗',
    shortName: 'SSR',
    color: '#eab308',
    probability: 0.05,
    glowColor: 'rgba(234, 179, 8, 0.9)',
  },
  red: {
    id: 'red',
    name: '传说',
    shortName: 'SR',
    color: '#ef4444',
    probability: 0.1,
    glowColor: 'rgba(239, 68, 68, 0.9)',
  },
};

// 卡牌图片库（Mock数据，使用真实的网图，这里使用 Picsum 防止 ORB 拦截）
// TODO: 接入后端后，通过 API GET /api/card/image-pool 获取
export const CARD_IMAGE_POOL = [
  {
    id: 'img_001',
    url: '/assets/home-bg-new.jpg', // 瀑布意境图
    name: '黄果树瀑布',
    description: '亚洲第一大瀑布，气势磅礴',
    level: 'blue',
    location: '安顺市',
    type: 'scenic',
  },
  {
    id: 'img_002',
    url: '/assets/home-bg-new.jpg', // 绿水意境图
    name: '荔波小七孔',
    description: '地球腰带上的绿宝石',
    level: 'blue',
    location: '黔南州',
    type: 'scenic',
  },
  {
    id: 'img_003',
    url: '/assets/home-bg-new.jpg', // 苗寨意境图
    name: '西江千户苗寨',
    description: '世界上最大的苗族聚居村寨',
    level: 'purple',
    location: '黔东南州',
    type: 'culture',
  },
  {
    id: 'img_004',
    url: '/assets/home-bg-new.jpg', // 古镇意境图
    name: '镇远古镇',
    description: '滇楚锁钥，黔东门户',
    level: 'purple',
    location: '黔东南州',
    type: 'culture',
  },
  {
    id: 'img_005',
    url: '/assets/home-bg-new.jpg', // 梵净山红云金顶意境图
    name: '梵净山',
    description: '梵天净土，弥勒道场',
    level: 'gold',
    location: '铜仁市',
    type: 'scenic',
  },
  {
    id: 'img_006',
    url: '/assets/home-bg-new.jpg', // 丹霞山意境图
    name: '赤水丹霞',
    description: '世界自然遗产，千瀑之城',
    level: 'gold',
    location: '遵义市',
    type: 'scenic',
  },
  {
    id: 'img_007',
    url: '/assets/home-bg-new.jpg', // 会议建筑意境图
    name: '遵义会议会址',
    description: '历史转折点',
    level: 'red',
    location: '遵义市',
    type: 'culture',
  },
  {
    id: 'img_008',
    url: '/assets/home-bg-new.jpg', // 酸汤鱼意境图
    name: '凯里酸汤鱼',
    description: '一口鲜酸开胃，像瀑布水汽一样爽快',
    level: 'blue',
    location: '黔东南州',
    type: 'food',
  },
  {
    id: 'img_009',
    url: '/assets/home-bg-new.jpg', // 羊肉粉意境图
    name: '遵义羊肉粉',
    description: '热汤滚香，米粉柔滑，赶路也要吃得踏实',
    level: 'purple',
    location: '遵义市',
    type: 'food',
  },
  {
    id: 'img_010',
    url: '/assets/home-bg-new.jpg', // 肠旺面意境图
    name: '肠旺面',
    description: '肥肠与血旺的完美交响',
    level: 'blue',
    location: '贵阳市',
    type: 'food',
  },
  {
    id: 'img_011',
    url: '/assets/home-bg-new.jpg', // 溶洞意境图
    name: '天河潭',
    description: '水旱溶洞，奇特喀斯特景观',
    level: 'gold',
    location: '贵阳市',
    type: 'scenic',
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
  // 游戏道具 (R卡 蓝, AR卡 紫)
  {
    id: 'reward_ingame_001',
    name: '游戏道具: 锤子+1',
    description: '砸碎任意一个障碍物',
    type: 'ingame',
    applicableLevels: ['blue', 'purple'],
    miniProgramPath: '',
    icon: '🔨',
  },
  {
    id: 'reward_ingame_002',
    name: '游戏道具: 魔法瓶+1',
    description: '消除同色元素',
    type: 'ingame',
    applicableLevels: ['blue', 'purple'],
    miniProgramPath: '',
    icon: '🧪',
  },
  // 代金券 (SR卡 红)
  {
    id: 'reward_voucher_001',
    name: '酸汤鱼代金券',
    description: '满100减20元',
    type: 'voucher',
    applicableLevels: ['red'],
    miniProgramPath: '',
    icon: '🍲',
  },
  {
    id: 'reward_voucher_002',
    name: '特产礼包代金券',
    description: '满200减50元',
    type: 'voucher',
    applicableLevels: ['red'],
    miniProgramPath: '',
    icon: '🎁',
  },
  // 1分购 (SSR卡 金)
  {
    id: 'reward_discount_001',
    name: '黄果树门票1分购',
    description: '1分钱购买黄果树瀑布门票',
    type: 'discount',
    applicableLevels: ['gold'],
    miniProgramPath: '/pages/ticket/detail?id=hgs',
    icon: '🎫',
  },
  {
    id: 'reward_discount_002',
    name: '小七孔门票1分购',
    description: '1分钱购买荔波小七孔门票',
    type: 'discount',
    applicableLevels: ['gold'],
    miniProgramPath: '/pages/ticket/detail?id=xqk',
    icon: '🎫',
  },
  {
    id: 'reward_discount_003',
    name: '苗银手作体验1分购',
    description: '1分钱体验苗银锻造',
    type: 'discount',
    applicableLevels: ['gold'],
    miniProgramPath: '/pages/experience/silver',
    icon: '🔨',
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
    level = 'red'; // SR 代金券
  } else if (random < CARD_LEVELS.red.probability + CARD_LEVELS.gold.probability) {
    level = 'gold'; // SSR 1分购
  } else if (random < CARD_LEVELS.red.probability + CARD_LEVELS.gold.probability + CARD_LEVELS.purple.probability) {
    level = 'purple'; // AR 游戏道具
  } else {
    level = 'blue'; // R 游戏道具
  }

  // 获取用户已经拥有的权益（用于代金券和1分购的去重）
  const stored = localStorage.getItem('guizhou-card-inventory');
  let ownedRewardIds = [];
  if (stored) {
    try {
      const parsedCards = JSON.parse(stored);
      ownedRewardIds = parsedCards.map(c => c.reward?.id).filter(Boolean);
    } catch (e) {}
  }

  // 从适用权益中筛选，对于 voucher 和 discount 需要去重
  let applicableRewards = REWARD_POOL.filter(r => r.applicableLevels.includes(level));
  if (level === 'red' || level === 'gold') {
    applicableRewards = applicableRewards.filter(r => !ownedRewardIds.includes(r.id));
    // 如果当前级别的所有奖品都已经抽过了，就降级为游戏道具 (blue)
    if (applicableRewards.length === 0) {
      level = 'blue';
      applicableRewards = REWARD_POOL.filter(r => r.applicableLevels.includes('blue'));
    }
  }

  // 从对应等级的图片中随机选择
  const levelImages = CARD_IMAGE_POOL.filter(img => img.level === level);
  // 如果没有对应等级的图片（极少情况），使用所有图片兜底
  const imagesPool = levelImages.length > 0 ? levelImages : CARD_IMAGE_POOL;
  const image = imagesPool[Math.floor(Math.random() * imagesPool.length)];

  // 从过滤后的适用权益中随机选择
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
        card.name = template.name; // 同步更新名称，防止缓存里的旧名称
      }
      return card;
    });
    return cards;
  }
  return [];
}
