export const BOARD_SIZE = 8;
export const LEVELS_PER_CHAPTER = 100;
export const TOTAL_CHAPTERS = 7;
export const TOTAL_LEVELS = LEVELS_PER_CHAPTER * TOTAL_CHAPTERS;
export const REWARD_LEVELS = [3, 10, 16, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export const pieces = [
  { id: "chili", name: "肠旺辣椒", text: "椒", aria: "红色辣椒棋子" },
  { id: "bluecake", name: "蓝靛粑", text: "蓝", aria: "蓝靛粑棋子" },
  { id: "greenroll", name: "丝娃娃", text: "丝", aria: "丝娃娃棋子" },
  { id: "yellowcake", name: "黄粑", text: "黄", aria: "黄粑棋子" },
  { id: "rosejar", name: "玫瑰糖", text: "玫", aria: "青岩玫瑰糖棋子" },
  { id: "fish", name: "酸汤鱼", text: "鱼", aria: "酸汤鱼棋子" },
];

export const blockers = {
  ice: { icon: "❄", label: "冰块" },
  chain: { icon: "⛓", label: "银链" },
  crate: { icon: "", label: "木箱" },
};

export const chapters = [
  { id: "huangguoshu", name: "黄果树瀑布", title: "第一章 瀑布酸汤宴", scenicSpot: "黄果树瀑布", featureFood: "酸汤鱼" },
  { id: "libo", name: "荔波小七孔", title: "第二章 碧水丝娃娃", scenicSpot: "荔波小七孔", featureFood: "丝娃娃" },
  { id: "xijiang", name: "西江苗寨", title: "第三章 苗寨长桌宴", scenicSpot: "西江千户苗寨", featureFood: "苗家糯米饭" },
  { id: "zhenyuan", name: "镇远古镇", title: "第四章 古镇米酒席", scenicSpot: "镇远古镇", featureFood: "米豆腐" },
  { id: "chishui", name: "赤水丹霞", title: "第五章 丹霞竹香宴", scenicSpot: "赤水丹霞", featureFood: "竹笋宴" },
  { id: "wanfenglin", name: "万峰林", title: "第六章 峰林稻花宴", scenicSpot: "万峰林", featureFood: "豆腐圆子" },
  { id: "fanjing", name: "梵净山", title: "第七章 云顶黄粑香", scenicSpot: "梵净山", featureFood: "黄粑" },
];

export const blockerRules = [
  { type: "ice", unlockLocalLevel: 11, base: 4, perLevels: 8, cap: 18 },
  { type: "crate", unlockLocalLevel: 26, base: 3, perLevels: 9, cap: 15 },
  { type: "chain", unlockLocalLevel: 41, base: 2, perLevels: 10, cap: 13 },
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
  const chapterBonus = chapterIndex * 2;
  return blockerRules.map((rule) => {
    if (localLevel < rule.unlockLocalLevel) {
      return { type: rule.type, amount: 0, unlocked: false };
    }
    const growth = Math.floor((localLevel - rule.unlockLocalLevel) / rule.perLevels);
    const lateChapterPressure = Math.floor(chapterBonus / (rule.type === "chain" ? 3 : 2));
    const amount = clamp(rule.base + growth + lateChapterPressure, 0, rule.cap);
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
    const goalPressure = type === "ice" ? 1.45 : type === "crate" ? 1.7 : 1.55;
    goals[type] = Math.ceil(amount * goalPressure + difficulty * 3);
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
