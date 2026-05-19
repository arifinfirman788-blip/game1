import { computed, nextTick, reactive } from "vue";
import { showDialog, showToast } from "vant";
import {
  BOARD_SIZE,
  TOTAL_LEVELS,
  blockers,
  clamp,
  generateLevelConfig,
  getGoalConfig,
  pieces,
} from "../config/levels";

const SCORE_PER_TILE = 80;
const MOVE_BONUS_SCORE = 200;
const SPECIAL_SCORE = 140;
const GUIDE_LINES = [
  "匹配美食，收集银饰，探索多彩贵州！",
  "相邻两个美食可以交换，凑齐三个就会消除。",
  "银链、冰块和木箱都是关卡目标，优先处理更稳。",
  "生成素材后替换资源路径，玩法底座不用重写。",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function randomPieceId() {
  return pieces[Math.floor(Math.random() * pieces.length)].id;
}

function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

function uniqueCells(cells) {
  const seen = new Set();
  const result = [];
  cells.forEach((cell) => {
    if (!cell) return;
    const key = cellKey(cell);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(cell);
  });
  return result;
}

function flattenGroups(groups) {
  return uniqueCells(groups.flatMap((group) => group.cells));
}

export function useMatch3Game(initialLevel = 128, options = {}) {
  const state = reactive({
    board: [],
    selected: null,
    currentLevel: initialLevel,
    levelConfig: generateLevelConfig(initialLevel),
    movesLeft: 0,
    score: 0,
    goals: {},
    busy: false,
    completed: false,
    goalsCompleted: false,
    activeBooster: null,
    boosterUsed: null,
    guideText: GUIDE_LINES[0],
    selectedChapterIndex: Math.floor((initialLevel - 1) / 100),
    effects: {
      clearing: new Set(),
      matching: new Set(),
      swapping: new Map(),
      falling: new Map(),
      spawning: new Set(),
      particles: [],
      rings: [],
      floatScores: [],
      combo: null,
    },
  });

  const starCount = computed(
    () => state.levelConfig.starTargets.filter((target) => state.score >= target).length,
  );

  const starProgress = computed(() =>
    Math.min(100, (state.score / state.levelConfig.starTargets[2]) * 100),
  );

  const chapterProgress = computed(() => {
    const { current, total } = state.levelConfig.chapterProgress;
    return Math.round((current / total) * 100);
  });

  function createCell(row, col) {
    let type = randomPieceId();
    while (
      (col >= 2 &&
        state.board[row][col - 1]?.type === type &&
        state.board[row][col - 2]?.type === type) ||
      (row >= 2 &&
        state.board[row - 1]?.[col]?.type === type &&
        state.board[row - 2]?.[col]?.type === type)
    ) {
      type = randomPieceId();
    }
    return { row, col, type, blocker: null, special: null };
  }

  function resetGame(level = state.currentLevel) {
    state.currentLevel = clamp(level, 1, TOTAL_LEVELS);
    state.selectedChapterIndex = Math.floor((state.currentLevel - 1) / 100);
    state.levelConfig = generateLevelConfig(state.currentLevel);
    state.board = [];
    state.selected = null;
    state.movesLeft = state.levelConfig.moves;
    state.score = 0;
    state.goals = clone(state.levelConfig.goals);
    state.busy = false;
    state.completed = false;
    state.goalsCompleted = false;
    state.activeBooster = null;
    state.boosterUsed = null;
    clearEffects();

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      state.board[row] = [];
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        state.board[row][col] = createCell(row, col);
      }
    }

    placeBlockers();
    state.guideText = GUIDE_LINES[0];
  }

  function placeBlockers() {
    const reserved = new Set(["4,4", "0,0", "0,1", "1,0"]);
    const configs = state.levelConfig.blockerPlan
      .filter((item) => item.amount > 0)
      .map((item) => [item.type, item.amount]);

    configs.forEach(([blocker, amount]) => {
      let placed = 0;
      while (placed < amount) {
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const col = Math.floor(Math.random() * BOARD_SIZE);
        const key = `${row},${col}`;
        const cell = state.board[row][col];
        if (reserved.has(key) || cell.blocker) continue;
        cell.blocker = blocker;
        if (blocker === "crate") {
          cell.type = null;
          cell.special = null;
        }
        reserved.add(key);
        placed += 1;
      }
    });
  }

  function canSelect(cell) {
    return Boolean(cell.type) && cell.blocker !== "crate" && cell.blocker !== "chain";
  }

  function isAdjacent(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  async function selectCell(cell) {
    if (state.busy) return;
    if (state.activeBooster) {
      await useBooster(cell);
      return;
    }
    if (!canSelect(cell)) {
      state.guideText = "这个格子暂时不能移动，先从旁边寻找机会。";
      return;
    }
    if (!state.selected) {
      state.selected = { row: cell.row, col: cell.col };
      return;
    }
    if (state.selected.row === cell.row && state.selected.col === cell.col) {
      state.selected = null;
      return;
    }
    if (!isAdjacent(state.selected, cell)) {
      state.selected = { row: cell.row, col: cell.col };
      return;
    }
    await trySwap(state.selected, cell);
  }

  async function trySwap(a, b) {
    state.busy = true;
    swapTypes(a, b);
    state.selected = null;
    setSwapHints(a, b);
    await delay(210);
    const swappedCells = [state.board[a.row][a.col], state.board[b.row][b.col]];
    const rainbowCells = swappedCells.filter((cell) => cell.special?.kind === "rainbow");
    const bombCells = swappedCells.filter((cell) => cell.special?.kind === "bomb");
    const matchGroups = findMatchGroups();
    if (rainbowCells.length === 0 && bombCells.length === 0 && matchGroups.length === 0) {
      swapTypes(a, b);
      setSwapHints(a, b);
      await delay(210);
      state.busy = false;
      state.guideText = "没有形成三个相同美食，再换个方向试试。";
      clearEffects();
      return;
    }
    state.movesLeft -= 1;
    clearEffects();
    if (rainbowCells.length > 0) {
      await triggerRainbowSwap(swappedCells);
    } else if (bombCells.length > 0) {
      await triggerBombSwap(bombCells, swappedCells);
    } else {
      await resolveMatches(matchGroups, swappedCells);
    }
    state.busy = false;
    clearEffects();
    checkGameEnd();
  }

  function swapTypes(a, b) {
    const first = state.board[a.row][a.col];
    const second = state.board[b.row][b.col];
    const temp = first.type;
    const tempSpecial = first.special;
    first.type = second.type;
    first.special = second.special;
    second.type = temp;
    second.special = tempSpecial;
  }

  function findMatches() {
    return flattenGroups(findMatchGroups());
  }

  function findMatchGroups() {
    const groups = [];
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      let streak = [state.board[row][0]];
      for (let col = 1; col < BOARD_SIZE; col += 1) {
        const current = state.board[row][col];
        const previous = streak[streak.length - 1];
        if (canMatchCell(current) && canMatchCell(previous) && current.type === previous.type) {
          streak.push(current);
        } else {
          addStreak(streak, groups, "row");
          streak = [current];
        }
      }
      addStreak(streak, groups, "row");
    }
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      let streak = [state.board[0][col]];
      for (let row = 1; row < BOARD_SIZE; row += 1) {
        const current = state.board[row][col];
        const previous = streak[streak.length - 1];
        if (canMatchCell(current) && canMatchCell(previous) && current.type === previous.type) {
          streak.push(current);
        } else {
          addStreak(streak, groups, "col");
          streak = [current];
        }
      }
      addStreak(streak, groups, "col");
    }
    return groups;
  }

  function addStreak(streak, groups, orientation) {
    if (streak.length < 3) return;
    const cells = streak.filter(canMatchCell);
    if (cells.length >= 3) groups.push({ cells, orientation, length: cells.length, type: cells[0].type });
  }

  function canMatchCell(cell) {
    return Boolean(cell?.type) && cell.blocker !== "crate" && cell.special?.kind !== "bomb" && cell.special?.kind !== "rainbow";
  }

  async function resolveMatches(initialGroups, sourceCells = []) {
    let groups = initialGroups;
    let combo = 0;
    while (groups.length > 0) {
      combo += 1;
      const matches = flattenGroups(groups);
      const rewardCell = createRewardFromGroups(groups, combo === 1 ? sourceCells : []);
      const clearCells = rewardCell ? matches.filter((cell) => cell !== rewardCell) : matches;
      const expandedCells = expandSpecials(clearCells);
      playMatchEffects(expandedCells, combo);
      await delay(330);
      clearMatches(expandedCells, combo);
      damageAdjacentCrates(expandedCells);
      state.effects.falling = collapseBoard();
      state.effects.spawning = refillBoard();
      await nextTick();
      await delay(360);
      clearEffects();
      groups = findMatchGroups();
    }
    state.guideText = combo > 1 ? `漂亮！${combo} 连消，多彩贵州一路畅行。` : "消除成功，继续收集关卡目标。";
  }

  function createRewardFromGroups(groups, sourceCells) {
    const bestGroup = chooseRewardGroup(groups);
    if (!bestGroup) return null;
    const compositeCell = findCompositeCell(groups);
    const target = compositeCell || chooseRewardCell(bestGroup, sourceCells);
    if (!target || !target.type) return null;
    if (bestGroup.length >= 5) {
      target.special = { kind: "rainbow" };
      state.guideText = "5 连生成彩虹球，交换后可收集对应美食。";
      return target;
    }
    if (compositeCell) {
      target.special = { kind: "bomb" };
      state.guideText = "复合 4 连生成炸弹奖励，同类消除后清除九宫格。";
      return target;
    }
    target.special = {
      kind: "glow",
      direction: bestGroup.orientation === "row" ? "row" : "col",
    };
    state.guideText = "4 连生成光晕奖励，同类消除后清除横排或竖排。";
    return target;
  }

  function chooseRewardGroup(groups) {
    const rewardGroups = groups.filter((group) => group.length >= 4);
    if (rewardGroups.length === 0) return null;
    const fiveGroup = rewardGroups.find((group) => group.length >= 5);
    if (fiveGroup) return fiveGroup;
    const compositeGroup = rewardGroups.find((group) =>
      rewardGroups.some(
        (other) =>
          other !== group &&
          other.cells.some((cell) => group.cells.some((current) => current === cell)),
      ),
    );
    return compositeGroup || rewardGroups[0];
  }

  function findCompositeCell(groups) {
    const rewardGroups = groups.filter((group) => group.length >= 4);
    for (const group of rewardGroups) {
      const overlap = group.cells.find((cell) =>
        rewardGroups.some((other) => other !== group && other.cells.some((target) => target === cell)),
      );
      if (overlap) return overlap;
    }
    return null;
  }

  function chooseRewardCell(group, sourceCells) {
    const sourceKeySet = new Set(sourceCells.map(cellKey));
    return group.cells.find((cell) => sourceKeySet.has(cellKey(cell))) || group.cells[Math.floor(group.cells.length / 2)];
  }

  function expandSpecials(cells) {
    const queue = [...cells];
    const result = new Map();
    while (queue.length > 0) {
      const cell = queue.shift();
      if (!cell || !cell.type) continue;
      const key = cellKey(cell);
      if (result.has(key)) continue;
      result.set(key, cell);
      if (!cell.special) continue;
      state.guideText = buildSpecialGuideText(cell);
      collectSpecialTargets(cell, "match").forEach((target) => {
        if (!result.has(cellKey(target))) queue.push(target);
      });
    }
    return [...result.values()];
  }

  function collectSpecialTargets(cell, triggerMode = "match") {
    if (!cell.special) return [cell];
    if (cell.special.kind === "bomb") {
      return cellsAround(cell, 1);
    }
    if (cell.special.kind === "glow") {
      return cell.special.direction === "row" ? state.board[cell.row] : state.board.map((row) => row[cell.col]);
    }
    return [cell];
  }

  function cellsAround(center, radius) {
    const cells = [];
    for (let row = center.row - radius; row <= center.row + radius; row += 1) {
      for (let col = center.col - radius; col <= center.col + radius; col += 1) {
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) continue;
        cells.push(state.board[row][col]);
      }
    }
    return cells;
  }

  async function triggerRainbowSwap(swappedCells) {
    const rainbowCells = swappedCells.filter((cell) => cell.special?.kind === "rainbow");
    const otherCells = swappedCells.filter((cell) => cell.special?.kind !== "rainbow");
    const targets = getRainbowSwapTargets(rainbowCells, otherCells);
    playMatchEffects(targets, 1);
    await delay(360);
    clearMatches(targets, 1, { specialScore: true });
    damageAdjacentCrates(targets);
    state.effects.falling = collapseBoard();
    state.effects.spawning = refillBoard();
    await nextTick();
    await delay(360);
    clearEffects();
    const groups = findMatchGroups();
    if (groups.length > 0) await resolveMatches(groups, swappedCells);
  }

  async function triggerBombSwap(bombCells, swappedCells) {
    const targets = uniqueCells(bombCells.flatMap((cell) => collectSpecialTargets(cell, "swap")));
    state.guideText = "炸弹奖励已触发，清除当前位置九宫格。";
    playMatchEffects(targets, 1);
    await delay(360);
    clearMatches(targets, 1, { specialScore: true });
    damageAdjacentCrates(targets);
    state.effects.falling = collapseBoard();
    state.effects.spawning = refillBoard();
    await nextTick();
    await delay(360);
    clearEffects();
    const groups = findMatchGroups();
    if (groups.length > 0) await resolveMatches(groups, swappedCells);
  }

  function getRainbowSwapTargets(rainbowCells, otherCells) {
    const allCells = state.board.flat();
    if (rainbowCells.length >= 2) {
      state.guideText = "双彩虹球触发，清除当前棋盘全部可见棋子。";
      return allCells.filter((target) => target.type || target.blocker);
    }
    const pairedCell = otherCells[0];
    if (pairedCell?.special && pairedCell.type) {
      const type = randomVisiblePieceType(pairedCell.type);
      const targets = allCells.filter((target) => target.type === type);
      state.guideText = "彩虹球触发特殊组合，同时随机收集一种美食。";
      return uniqueCells([...targets, ...collectSpecialTargets(pairedCell, "match"), ...rainbowCells]);
    }
    const targetType = pairedCell?.type;
    state.guideText = "彩虹球触发，收集互换棋子的同类美食。";
    return allCells.filter((target) => target.type === targetType || rainbowCells.includes(target));
  }

  function randomVisiblePieceType(fallbackType) {
    const types = [...new Set(state.board.flat().map((cell) => cell.type).filter(Boolean))];
    if (types.length === 0) return fallbackType;
    return types[Math.floor(Math.random() * types.length)];
  }

  function buildSpecialGuideText(cell) {
    if (cell.special?.kind === "bomb") return "九宫格奖励已触发，周围棋子全部清除。";
    if (cell.special?.direction === "row") return "横排奖励已触发，整行美食被收集。";
    return "竖排奖励已触发，整列美食被收集。";
  }

  function clearMatches(matches, combo, options = {}) {
    matches.forEach((cell) => {
      if (cell.blocker) {
        reduceGoal(cell.blocker);
        cell.blocker = null;
        cell.special = null;
        if (!cell.type) {
          cell.type = randomPieceId();
          cell.special = null;
        }
      } else {
        reduceGoal(cell.type);
        cell.type = null;
        cell.special = null;
      }
    });
    state.score += matches.length * (options.specialScore ? SPECIAL_SCORE : SCORE_PER_TILE) * combo;
  }

  function damageAdjacentCrates(matches) {
    const directions = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    matches.forEach((cell) => {
      directions.forEach(([rowDelta, colDelta]) => {
        const row = cell.row + rowDelta;
        const col = cell.col + colDelta;
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return;
        const neighbor = state.board[row][col];
        if (neighbor.blocker === "crate") {
          reduceGoal("crate");
          neighbor.blocker = null;
          neighbor.type = null;
          neighbor.special = null;
          state.score += SCORE_PER_TILE;
        }
      });
    });
  }

  function collapseBoard() {
    const fallHints = new Map();
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const falling = [];
      for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
        const cell = state.board[row][col];
        if (cell.blocker === "crate") {
          fillColumnSegment(col, row + 1, falling, fallHints);
          falling.length = 0;
          continue;
        }
        if (cell.type) {
          falling.push({ type: cell.type, special: cell.special, fromRow: row });
          cell.type = null;
          cell.special = null;
        }
      }
      fillColumnSegment(col, 0, falling, fallHints);
    }
    return fallHints;
  }

  function fillColumnSegment(col, segmentStart, falling, fallHints) {
    for (let row = BOARD_SIZE - 1; row >= segmentStart; row -= 1) {
      const cell = state.board[row][col];
      if (cell.blocker === "crate") continue;
      const next = falling.shift();
      cell.type = next?.type || null;
      cell.special = next?.special || null;
      if (next && next.fromRow !== row) fallHints.set(`${row},${col}`, row - next.fromRow);
    }
  }

  function refillBoard() {
    const spawnHints = new Set();
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let col = 0; col < BOARD_SIZE; col += 1) {
        const cell = state.board[row][col];
        if (!cell.type && cell.blocker !== "crate") {
          cell.type = randomPieceId();
          cell.special = null;
          spawnHints.add(`${row},${col}`);
        }
      }
    }
    return spawnHints;
  }

  async function useBooster(cell) {
    const booster = state.activeBooster;
    if (!booster) return;
    state.activeBooster = null;
    state.busy = true;
    const handled = await applyBooster(booster, cell);
    if (handled) state.boosterUsed = booster;
    clearEffects();
    if (handled) {
      const groups = findMatchGroups();
      if (groups.length > 0) await resolveMatches(groups, [cell]);
    }
    state.busy = false;
    checkGameEnd();
  }

  async function applyBooster(booster, cell) {
    if (booster === "hammer") return useHammer(cell);
    if (booster === "bottle") return useBottle(cell);
    if (booster === "flower") return useFlower(cell);
    if (booster === "mask") return useMask(cell);
    if (booster === "hand") return useHand(cell);
    return false;
  }

  async function useHammer(cell) {
    if (!cell.type && !cell.blocker) {
      showToast("这里已经是空格，银锤换个位置更值");
      return false;
    }
    playMatchEffects([cell], 1);
    await delay(300);
    clearMatches([cell], 1, { specialScore: true });
    await settleBoosterBoard();
    state.guideText = "银锤敲开了一个关键格。";
    return true;
  }

  async function useBottle(cell) {
    if (!cell.type) {
      showToast("净瓶需要选择一个美食棋子");
      return false;
    }
    const targets = state.board.flat().filter((target) => target.type === cell.type);
    playMatchEffects(targets, 1);
    await delay(330);
    clearMatches(targets, 1, { specialScore: true });
    await settleBoosterBoard();
    state.guideText = "净瓶收集了同一种美食。";
    return true;
  }

  async function useFlower(cell) {
    const targets = expandSpecials(cellsAround(cell, 1));
    playMatchEffects(targets, 1);
    await delay(330);
    clearMatches(targets, 1, { specialScore: true });
    damageAdjacentCrates(targets);
    await settleBoosterBoard();
    state.guideText = "绣球清除了九宫格范围。";
    return true;
  }

  async function useMask(cell) {
    if (!cell.type) {
      showToast("傩面需要选择一个可变换的美食棋子");
      return false;
    }
    cell.special = { kind: "rainbow" };
    state.effects.rings.push({ id: crypto.randomUUID(), row: cell.row, col: cell.col });
    await delay(240);
    state.guideText = "傩面把当前棋子变成彩虹奖励。";
    return true;
  }

  async function useHand(cell) {
    if (!cell.type) {
      showToast("银手需要选择一个美食棋子");
      return false;
    }
    cell.special = { kind: "bomb" };
    state.effects.rings.push({ id: crypto.randomUUID(), row: cell.row, col: cell.col });
    await delay(240);
    state.guideText = "银手把当前棋子变成九宫格奖励。";
    return true;
  }

  async function settleBoosterBoard() {
    state.effects.falling = collapseBoard();
    state.effects.spawning = refillBoard();
    await delay(340);
  }

  function activateBooster(booster) {
    if (state.busy) return;
    if (options.getBoosterCount?.(booster) <= 0) {
      showToast("该道具数量不足");
      return;
    }
    if (state.activeBooster === booster) {
      state.activeBooster = null;
      showToast("已取消道具选择");
      return;
    }
    state.activeBooster = booster;
    const guides = {
      hammer: "选择一个格子，银锤会直接敲开它。",
      bottle: "选择一种美食，净瓶会收集棋盘上全部同类。",
      flower: "选择一个中心格，绣球会清除九宫格范围。",
      mask: "选择一个美食棋子，傩面会把它变成全屏彩虹奖励。",
      hand: "选择一个美食棋子，银手会把它变成九宫格奖励。",
    };
    state.guideText = guides[booster] || "选择棋盘上的一个格子使用道具。";
  }

  function playMatchEffects(matches, combo) {
    matches.forEach((cell) => {
      state.effects.clearing.add(cellKey(cell));
      state.effects.matching.add(cellKey(cell));
      state.effects.rings.push({ id: crypto.randomUUID(), row: cell.row, col: cell.col });
      for (let index = 0; index < 7; index += 1) {
        state.effects.particles.push({ id: crypto.randomUUID(), row: cell.row, col: cell.col, index });
      }
    });
    const center = getMatchCenter(matches);
    state.effects.floatScores.push({
      id: crypto.randomUUID(),
      x: center.x,
      y: center.y,
      amount: matches.length * SCORE_PER_TILE * combo,
    });
    if (combo > 1) state.effects.combo = { id: crypto.randomUUID(), text: `${combo} 连消` };
  }

  function getMatchCenter(matches) {
    const x = matches.reduce((sum, cell) => sum + cell.col, 0) / matches.length;
    const y = matches.reduce((sum, cell) => sum + cell.row, 0) / matches.length;
    return {
      x: `${((x + 0.5) / BOARD_SIZE) * 100}%`,
      y: `${((y + 0.5) / BOARD_SIZE) * 100}%`,
    };
  }

  function setSwapHints(a, b) {
    state.effects.swapping = new Map([
      [cellKey(b), { fromRow: a.row, fromCol: a.col }],
      [cellKey(a), { fromRow: b.row, fromCol: b.col }],
    ]);
  }

  function clearEffects() {
    state.effects.clearing = new Set();
    state.effects.matching = new Set();
    state.effects.swapping = new Map();
    state.effects.falling = new Map();
    state.effects.spawning = new Set();
    state.effects.particles = [];
    state.effects.rings = [];
    state.effects.floatScores = [];
    state.effects.combo = null;
  }

  function reduceGoal(goal) {
    if (state.goals[goal] > 0) state.goals[goal] -= 1;
  }

  function checkGameEnd() {
    if (state.completed) return;

    const goalsComplete = Object.values(state.goals).every((count) => count <= 0);
    if (goalsComplete) {
      state.goalsCompleted = true;

      if (starCount.value < 3 && state.movesLeft > 0) {
        state.guideText = "关卡目标已完成！还可以继续消除，冲到三星后再结算。";
        return;
      }

      completeLevel();
      return;
    }

    if (state.movesLeft <= 0) {
      showDialog({
        title: "步数用完",
        message: "还差一点点，再试一次一定能打开局面。",
        confirmButtonText: "知道了",
      });
    }
  }

  function completeLevel() {
    const starsBeforeBonus = starCount.value;
    const remainingMoves = state.movesLeft;
    const bonusScore = starsBeforeBonus >= 3 && remainingMoves > 0 ? remainingMoves * MOVE_BONUS_SCORE : 0;

    if (bonusScore > 0) {
      state.score += bonusScore;
    }

    state.completed = true;
    options.onLevelComplete?.({
      level: state.currentLevel,
      nextLevel: clamp(state.currentLevel + 1, 1, TOTAL_LEVELS),
      stars: Math.max(starCount.value, 1),
      remainingMoves,
      bonusScore,
      finalScore: state.score,
      isLastLevel: state.currentLevel >= TOTAL_LEVELS,
    });
  }

  function changeLevel(level) {
    resetGame(clamp(level, 1, TOTAL_LEVELS));
    state.guideText = `${state.levelConfig.chapter.name}第 ${state.levelConfig.localLevel} 小关，今天跟黄小西继续吃遍贵州。`;
  }

  function delay(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  resetGame(initialLevel);

  return {
    state,
    starCount,
    starProgress,
    chapterProgress,
    pieces,
    blockers,
    getGoalConfig,
    selectCell,
    activateBooster,
    resetGame,
    changeLevel,
  };
}
