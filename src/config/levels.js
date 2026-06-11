export const BOARD_SIZE = 8;
export const LEVELS_PER_CHAPTER = 100;
export const TOTAL_CHAPTERS = 8;
export const TOTAL_LEVELS = LEVELS_PER_CHAPTER * TOTAL_CHAPTERS;
export const REWARD_LEVELS = Array.from({ length: LEVELS_PER_CHAPTER / 20 }, (_, groupIndex) => {
  const offset = groupIndex * 20;
  return [3, 10, 16, 20].map((level) => level + offset);
}).flat();

export const pieces = [
  { id: "chili", name: "肠旺辣椒", text: "椒", aria: "红色辣椒棋子" },
  { id: "bluecake", name: "蓝靛粑", text: "蓝", aria: "蓝靛粑棋子" },
  { id: "greenroll", name: "丝娃娃", text: "丝", aria: "丝娃娃棋子" },
  { id: "yellowcake", name: "黄粑", text: "黄", aria: "黄粑棋子" },
  { id: "rosejar", name: "玫瑰糖", text: "玫", aria: "青岩玫瑰糖棋子" },
  { id: "fish", name: "酸汤鱼", text: "鱼", aria: "酸汤鱼棋子" },
];

export const blockers = {
  ice: { icon: "❄", label: "冰层" },
  chain: { icon: "⛓", label: "铁链" },
  crate: { icon: "", label: "木箱" },
  iceblock: { icon: "🧊", label: "冰块" },
};

export const chapters = [
  { id: "huangguoshu", name: "黄果树瀑布", title: "第一章 瀑布酸汤宴", scenicSpot: "黄果树瀑布", featureFood: "酸汤鱼" },
  { id: "libo", name: "荔波小七孔", title: "第二章 碧水丝娃娃", scenicSpot: "荔波小七孔", featureFood: "丝娃娃" },
  { id: "xijiang", name: "西江苗寨", title: "第三章 苗寨长桌宴", scenicSpot: "西江千户苗寨", featureFood: "苗家糯米饭" },
  { id: "zhenyuan", name: "镇远古镇", title: "第四章 古镇米酒席", scenicSpot: "镇远古镇", featureFood: "米豆腐" },
  { id: "chishui", name: "赤水丹霞", title: "第五章 丹霞竹香宴", scenicSpot: "赤水丹霞", featureFood: "竹笋宴" },
  { id: "wanfenglin", name: "万峰林", title: "第六章 峰林稻花宴", scenicSpot: "万峰林", featureFood: "豆腐圆子" },
  { id: "fanjing", name: "梵净山", title: "第七章 云顶黄粑香", scenicSpot: "梵净山", featureFood: "黄粑" },
  { id: "tianhetan", name: "天河潭", title: "第八章 溶洞肠旺香", scenicSpot: "天河潭", featureFood: "肠旺面" },
];

export const blockerRules = [
  { type: "ice", unlockLocalLevel: 11, base: 4, perLevels: 5, cap: 15 },
  { type: "chain-2", unlockLocalLevel: 21, base: 3, perLevels: 6, cap: 12 },
  { type: "crate-2", unlockLocalLevel: 31, base: 2, perLevels: 7, cap: 10 },
  { type: "iceblock-2", unlockLocalLevel: 41, base: 2, perLevels: 8, cap: 8 },
];

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function generateLevelConfig(globalLevel) {
  const safeLevel = clamp(globalLevel, 1, TOTAL_LEVELS);
  const chapterIndex = Math.floor((safeLevel - 1) / LEVELS_PER_CHAPTER);
  const localLevel = ((safeLevel - 1) % LEVELS_PER_CHAPTER) + 1;
  const chapter = chapters[chapterIndex];
  const chapterDifficulty = chapterIndex * 0.42;
  const localDifficulty = localLevel / LEVELS_PER_CHAPTER;
  const difficulty = chapterDifficulty + localDifficulty;
  const blockerPlan = buildBlockerPlan(localLevel, chapterIndex);
  const goals = buildGoals(blockerPlan, localLevel, difficulty);
  const moves = buildMoveBudget(localLevel, chapterIndex, blockerPlan);
  const starTargets = buildStarTargets(localLevel, chapterIndex, goals);

  return {
    globalLevel: safeLevel,
    localLevel,
    chapterIndex,
    chapter,
    moves,
    goals,
    blockerPlan,
    starTargets,
    chapterProgress: { current: localLevel, total: LEVELS_PER_CHAPTER },
    difficulty,
  };
}

function buildBlockerPlan(localLevel, chapterIndex) {
  if (localLevel <= 10) return [];

  // 获取当前关卡已解锁的所有障碍物规则
  const unlockedRules = blockerRules.filter(r => localLevel >= r.unlockLocalLevel);

  // 决定当前关卡出现几种障碍物
  let numTypes = 1;
  if (localLevel >= 25) numTypes = 2; // 25关以后常规出现2种
  if (localLevel >= 50 && localLevel % 5 === 0) numTypes = 3; // 50关以后的 Boss 关出现3种
  if (localLevel >= 80 && localLevel % 10 === 0) numTypes = 4; // 80关以后的 大Boss 关出现4种

  numTypes = Math.min(numTypes, unlockedRules.length);

  // 使用 localLevel 作为种子，保证同一个关卡的障碍物组合是固定的
  const pickedRules = [];
  let seed = localLevel * 17 + chapterIndex * 31;
  const tempRules = [...unlockedRules];

  // 保证在刚解锁新障碍物的关卡，必定会出现该新障碍物
  if ([11, 21, 31, 41].includes(localLevel)) {
    const newRule = tempRules.pop();
    pickedRules.push(newRule);
    numTypes -= 1;
  }

  // 伪随机抽取剩余需要的障碍物种类
  for (let i = 0; i < numTypes; i++) {
    const index = seed % tempRules.length;
    pickedRules.push(tempRules[index]);
    tempRules.splice(index, 1);
    seed = (seed * 9301 + 49297) % 233280;
  }

  const chapterBonus = chapterIndex * 2;
  // 当同时出现多种障碍物时，对每种障碍物的生成数量打个折扣，避免把棋盘塞满死局
  const multiTypeDiscount = pickedRules.length > 1 ? (pickedRules.length > 2 ? 0.6 : 0.8) : 1.0;

  return pickedRules.map((rule) => {
    const growth = Math.floor((localLevel - rule.unlockLocalLevel) / rule.perLevels);
    const lateChapterPressure = Math.floor(chapterBonus / (rule.type.startsWith("chain") ? 3 : 2));
    let amount = Math.floor((rule.base + growth + lateChapterPressure) * multiTypeDiscount);
    amount = clamp(amount, 1, rule.cap);
    return { type: rule.type, amount, unlocked: true };
  });
}

function buildGoals(blockerPlan, localLevel, difficulty) {
  const goals = {};
  const primaryPiece = pieces[(localLevel - 1) % pieces.length];
  const secondaryPiece = pieces[(localLevel + 1) % pieces.length];
  const targetGoalCount = localLevel <= 4 ? 1 : localLevel <= 10 ? 2 : 3;
  const earlyEase = localLevel <= 4 ? -8 : localLevel <= 10 ? -5 : 0;
  goals[primaryPiece.id] = Math.max(10, 18 + Math.floor(localLevel / 4) + Math.floor(difficulty * 3) + earlyEase);
  blockerPlan.forEach(({ type, amount }) => {
    if (amount <= 0) return;
    const baseType = type.split("-")[0];
    goals[baseType] = (goals[baseType] || 0) + amount;
  });
  if (Object.keys(goals).length < targetGoalCount) {
    goals[secondaryPiece.id] = Math.max(8, 13 + Math.floor(localLevel / 5) + Math.floor(difficulty * 2) + earlyEase);
  }
  if (Object.keys(goals).length < targetGoalCount) {
    const tertiaryPiece = pieces[(localLevel + 3) % pieces.length];
    goals[tertiaryPiece.id] = 12 + Math.floor(localLevel / 6) + Math.floor(difficulty * 2);
  }
  return goals;
}

function buildMoveBudget(localLevel, chapterIndex, blockerPlan) {
  const activeBlockers = blockerPlan.filter((item) => item.amount > 0);
  const blockerLoad = activeBlockers.reduce((sum, item) => sum + item.amount, 0);
  const earlyGenerosity = localLevel <= 4 ? 4 : localLevel <= 10 ? 2 : 0;
  const pressure = Math.floor(localLevel / 14) + chapterIndex;
  return clamp(25 + earlyGenerosity + Math.floor(blockerLoad / 10) - pressure, 16, 30);
}

function buildStarTargets(localLevel, chapterIndex, goals) {
  const goalLoad = Object.values(goals).reduce((sum, count) => sum + count, 0);
  const base = 1400 + localLevel * 34 + chapterIndex * 520 + goalLoad * 38;
  return [Math.round(base), Math.round(base * 1.9), Math.round(base * 3)];
}

export function getGoalConfig(goal) {
  const piece = pieces.find((item) => item.id === goal);
  if (piece) return { icon: piece.text, label: piece.name, pieceId: piece.id };
  return { icon: blockers[goal]?.icon || "▣", label: blockers[goal]?.label || "目标" };
}
