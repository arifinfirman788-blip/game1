import { computed, reactive, watch } from "vue";

const STORAGE_KEY = "guizhou-match3-progress";
const PROGRESS_VERSION = 2;
const BOOSTER_REWARD_TABLE = {
  3: { hammer: 1 },
  10: { hammer: 1, bottle: 1 },
  16: { hammer: 1, flower: 1 },
  20: { bottle: 1, mask: 1 },
  30: { hammer: 2, hand: 1 },
  40: { bottle: 1, flower: 1, mask: 1 },
  50: { hammer: 2, hand: 1, flower: 1 },
  60: { bottle: 2, mask: 1 },
  70: { hammer: 2, hand: 2 },
  80: { bottle: 2, flower: 2, mask: 1 },
  90: { hammer: 3, hand: 2 },
  100: { hammer: 3, bottle: 2, flower: 2, mask: 2, hand: 2 },
};

function createDefaultProgress() {
  return {
    version: PROGRESS_VERSION,
    unlockedLevel: 1,
    currentLevel: 1,
    levelStars: {},
    claimedRewards: {},
    inventory: {
      hammer: 0,
      bottle: 0,
      flower: 0,
      mask: 0,
      hand: 0,
    },
  };
}

function loadProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw);
    const baseProgress = createDefaultProgress();
    const shouldResetStarterInventory = Number(parsed.version || 1) < PROGRESS_VERSION;
    return {
      ...baseProgress,
      ...parsed,
      version: PROGRESS_VERSION,
      inventory: {
        ...baseProgress.inventory,
        ...(shouldResetStarterInventory ? {} : parsed.inventory || {}),
      },
    };
  } catch {
    return createDefaultProgress();
  }
}

export function usePlayerProgress() {
  const progress = reactive(loadProgress());

  watch(
    progress,
    () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    },
    { deep: true },
  );

  const totalStars = computed(() =>
    Object.values(progress.levelStars).reduce((sum, count) => sum + Number(count || 0), 0),
  );

  function getStars(level) {
    return Number(progress.levelStars[level] || 0);
  }

  function isUnlocked(level) {
    return level <= progress.unlockedLevel;
  }

  function completeLevel(level, stars) {
    progress.levelStars[level] = Math.max(getStars(level), stars);
    progress.currentLevel = Math.min(level + 1, 700);
    progress.unlockedLevel = Math.max(progress.unlockedLevel, Math.min(level + 1, 700));
  }

  function rewardKey(chapterIndex, rewardLevel) {
    return `${chapterIndex + 1}-${rewardLevel}`;
  }

  function isRewardClaimed(chapterIndex, rewardLevel) {
    return Boolean(progress.claimedRewards[rewardKey(chapterIndex, rewardLevel)]);
  }

  function isRewardClaimable(chapterIndex, rewardLevel) {
    const startLevel = chapterIndex * 100 + 1;
    const endLevel = chapterIndex * 100 + rewardLevel;
    for (let level = startLevel; level <= endLevel; level += 1) {
      if (getStars(level) <= 0) return false;
    }
    return !isRewardClaimed(chapterIndex, rewardLevel);
  }

  function claimReward(chapterIndex, rewardLevel) {
    if (!isRewardClaimable(chapterIndex, rewardLevel)) return false;
    progress.claimedRewards[rewardKey(chapterIndex, rewardLevel)] = true;
    const reward = getBoosterReward(rewardLevel);
    Object.entries(reward).forEach(([booster, count]) => {
      progress.inventory[booster] = Number(progress.inventory[booster] || 0) + count;
    });
    return reward;
  }

  function getBoosterReward(rewardLevel) {
    if (BOOSTER_REWARD_TABLE[rewardLevel]) return { ...BOOSTER_REWARD_TABLE[rewardLevel] };
    if (rewardLevel % 10 === 0) return { hammer: 1, bottle: 1 };
    return { hammer: 1 };
  }

  function consumeBooster(booster) {
    if (Number(progress.inventory[booster] || 0) <= 0) return false;
    progress.inventory[booster] -= 1;
    return true;
  }

  function resetInventory() {
    progress.inventory = {
      hammer: 0,
      bottle: 0,
      flower: 0,
      mask: 0,
      hand: 0,
    };
  }

  function seedRewardTestProgress(chapterIndex = 0, throughLocalLevel = 16) {
    const startLevel = chapterIndex * 100 + 1;
    const endLevel = chapterIndex * 100 + throughLocalLevel;
    progress.unlockedLevel = Math.max(progress.unlockedLevel, endLevel);
    for (let level = startLevel; level <= endLevel; level += 1) {
      progress.levelStars[level] = Math.max(getStars(level), 1);
    }
  }

  return {
    progress,
    totalStars,
    getStars,
    isUnlocked,
    completeLevel,
    isRewardClaimed,
    isRewardClaimable,
    claimReward,
    getBoosterReward,
    consumeBooster,
    resetInventory,
    seedRewardTestProgress,
  };
}
