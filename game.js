const ASSETS = {
  // 生成素材后，把路径填到这里即可，例如 "./assets/pieces/suantang-fish.png"。
  pieces: {
    chili: "",
    bluecake: "",
    greenroll: "",
    yellowcake: "",
    rosejar: "",
    fish: "",
  },
  boosters: {
    hammer: "",
    bottle: "",
    flower: "",
    mask: "",
    hand: "",
  },
  blockers: {
    ice: "",
    chain: "",
    crate: "",
  },
  guide: {
    normal: "",
    happy: "",
    thinking: "",
  },
  background: "",
};

const PIECES = [
  {
    id: "chili",
    name: "肠旺辣椒",
    text: "椒",
    aria: "红色辣椒棋子",
  },
  {
    id: "bluecake",
    name: "蓝靛粑",
    text: "蓝",
    aria: "蓝靛粑棋子",
  },
  {
    id: "greenroll",
    name: "丝娃娃",
    text: "丝",
    aria: "丝娃娃棋子",
  },
  {
    id: "yellowcake",
    name: "黄粑",
    text: "黄",
    aria: "黄粑棋子",
  },
  {
    id: "rosejar",
    name: "玫瑰糖",
    text: "玫",
    aria: "青岩玫瑰糖棋子",
  },
  {
    id: "fish",
    name: "酸汤鱼",
    text: "鱼",
    aria: "酸汤鱼棋子",
  },
];

const BLOCKERS = {
  ice: {
    icon: "❄",
    label: "冰块",
  },
  chain: {
    icon: "⛓",
    label: "银链",
  },
  crate: {
    icon: "",
    label: "木箱",
  },
};

const BOARD_SIZE = 9;
const LEVELS_PER_CHAPTER = 100;
const TOTAL_CHAPTERS = 7;
const TOTAL_LEVELS = LEVELS_PER_CHAPTER * TOTAL_CHAPTERS;
const INITIAL_LEVEL = getInitialLevel();
const INITIAL_SCREEN = getInitialScreen();
const SCORE_PER_TILE = 80;
const PARTICLE_COLORS = ["#fff1a4", "#ffcf58", "#6ff7df", "#ffffff", "#ff8d6f"];
const CHAPTERS = [
  {
    id: "huangguoshu",
    name: "黄果树瀑布",
    title: "第一章 瀑布酸汤宴",
    scenicSpot: "黄果树瀑布",
    featureFood: "酸汤鱼",
  },
  {
    id: "xijiang",
    name: "西江千户苗寨",
    title: "第二章 苗寨长桌宴",
    scenicSpot: "西江千户苗寨",
    featureFood: "苗家糯米饭",
  },
  {
    id: "libo",
    name: "荔波小七孔",
    title: "第三章 碧水丝娃娃",
    scenicSpot: "荔波小七孔",
    featureFood: "丝娃娃",
  },
  {
    id: "fanjing",
    name: "梵净山",
    title: "第四章 云顶黄粑香",
    scenicSpot: "梵净山",
    featureFood: "黄粑",
  },
  {
    id: "zhaoxing",
    name: "肇兴侗寨",
    title: "第五章 侗寨蓝靛席",
    scenicSpot: "肇兴侗寨",
    featureFood: "蓝靛粑",
  },
  {
    id: "wanfenglin",
    name: "万峰林",
    title: "第六章 峰林稻花宴",
    scenicSpot: "万峰林",
    featureFood: "豆腐圆子",
  },
  {
    id: "qingyan",
    name: "青岩古镇",
    title: "第七章 古镇玫瑰糖",
    scenicSpot: "青岩古镇",
    featureFood: "青岩玫瑰糖",
  },
];
const BLOCKER_RULES = [
  {
    type: "ice",
    unlockLocalLevel: 11,
    base: 4,
    perLevels: 8,
    cap: 18,
  },
  {
    type: "crate",
    unlockLocalLevel: 26,
    base: 3,
    perLevels: 9,
    cap: 15,
  },
  {
    type: "chain",
    unlockLocalLevel: 41,
    base: 2,
    perLevels: 10,
    cap: 13,
  },
];
const GUIDE_LINES = [
  "匹配美食，收集银饰，探索多彩贵州！",
  "相邻两个美食可以交换，凑齐三个就会消除。",
  "银链、冰块和木箱都是关卡目标，优先处理更稳。",
  "生成素材后替换资源路径，玩法底座不用重写。",
];

const state = {
  board: [],
  selected: null,
  currentLevel: INITIAL_LEVEL,
  levelConfig: generateLevelConfig(INITIAL_LEVEL),
  movesLeft: 0,
  score: 0,
  goals: {},
  busy: false,
  activeBooster: null,
  selectedChapterIndex: Math.floor((INITIAL_LEVEL - 1) / LEVELS_PER_CHAPTER),
  renderHints: {
    swaps: [],
    falling: new Map(),
    spawning: new Set(),
  },
};

const gameBoard = document.querySelector("#gameBoard");
const goalList = document.querySelector("#goalList");
const movesLeft = document.querySelector("#movesLeft");
const scoreValue = document.querySelector("#scoreValue");
const starFill = document.querySelector("#starFill");
const levelLabel = document.querySelector("#levelLabel");
const guideBubble = document.querySelector("#guideBubble");
const chapterFill = document.querySelector("#chapterFill");
const chapterText = document.querySelector("#chapterText");
const modal = document.querySelector("#gameModal");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");
const continueButton = document.querySelector("#continueButton");
const restartButton = document.querySelector("#restartButton");
const pauseButton = document.querySelector("#pauseButton");
const settingsButton = document.querySelector("#settingsButton");
const prevLevelButton = document.querySelector("#prevLevelButton");
const nextLevelButton = document.querySelector("#nextLevelButton");
const levelInfoButton = document.querySelector("#levelInfoButton");
const homeScreen = document.querySelector("#homeScreen");
const mapScreen = document.querySelector("#mapScreen");
const gameTopHud = document.querySelector("#gameTopHud");
const gameBoardView = document.querySelector("#gameBoardView");
const gameGuideView = document.querySelector("#gameGuideView");
const gameBottomHud = document.querySelector("#gameBottomHud");
const startJourneyButton = document.querySelector("#startJourneyButton");
const continueJourneyButton = document.querySelector("#continueJourneyButton");
const homeSettingsButton = document.querySelector("#homeSettingsButton");
const homeGiftButton = document.querySelector("#homeGiftButton");
const backHomeButton = document.querySelector("#backHomeButton");
const mapInfoButton = document.querySelector("#mapInfoButton");
const chapterTabs = document.querySelector("#chapterTabs");
const levelGrid = document.querySelector("#levelGrid");
const chapterBadge = document.querySelector("#chapterBadge");
const chapterTitle = document.querySelector("#chapterTitle");
const chapterDesc = document.querySelector("#chapterDesc");
const mapProgressText = document.querySelector("#mapProgressText");
const mapProgressFill = document.querySelector("#mapProgressFill");

function getInitialLevel() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = Number(params.get("level"));
  if (Number.isInteger(fromUrl) && fromUrl >= 1 && fromUrl <= TOTAL_LEVELS) {
    return fromUrl;
  }
  return 128;
}

function getInitialScreen() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("level")) {
    return "game";
  }
  if (params.get("screen") === "map") {
    return "map";
  }
  return "home";
}

function generateLevelConfig(globalLevel) {
  const safeLevel = clamp(globalLevel, 1, TOTAL_LEVELS);
  const chapterIndex = Math.floor((safeLevel - 1) / LEVELS_PER_CHAPTER);
  const localLevel = ((safeLevel - 1) % LEVELS_PER_CHAPTER) + 1;
  const chapter = CHAPTERS[chapterIndex];
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
    chapterProgress: {
      current: localLevel,
      total: LEVELS_PER_CHAPTER,
    },
    difficulty,
  };
}

function buildBlockerPlan(localLevel, chapterIndex) {
  const chapterBonus = chapterIndex * 2;
  return BLOCKER_RULES.map((rule) => {
    if (localLevel < rule.unlockLocalLevel) {
      return {
        type: rule.type,
        amount: 0,
        unlocked: false,
      };
    }

    const growth = Math.floor((localLevel - rule.unlockLocalLevel) / rule.perLevels);
    const lateChapterPressure = Math.floor(chapterBonus / (rule.type === "chain" ? 3 : 2));
    const amount = clamp(rule.base + growth + lateChapterPressure, 0, rule.cap);

    return {
      type: rule.type,
      amount,
      unlocked: true,
    };
  });
}

function buildGoals(blockerPlan, localLevel, difficulty) {
  const goals = {};
  blockerPlan.forEach(({ type, amount }) => {
    if (amount <= 0) {
      return;
    }
    const goalPressure = type === "ice" ? 1.1 : type === "crate" ? 1.35 : 1.25;
    goals[type] = Math.ceil(amount * goalPressure + difficulty * 2);
  });

  if (Object.keys(goals).length === 0) {
    const starterGoal = 12 + Math.floor(localLevel / 3);
    goals.food = starterGoal;
  }

  return goals;
}

function buildMoveBudget(localLevel, chapterIndex, blockerPlan) {
  const activeBlockers = blockerPlan.filter((item) => item.amount > 0);
  const blockerLoad = activeBlockers.reduce((sum, item) => sum + item.amount, 0);
  const earlyGenerosity = localLevel <= 10 ? 4 : 0;
  const pressure = Math.floor(localLevel / 18) + chapterIndex;
  return clamp(31 + earlyGenerosity + Math.floor(blockerLoad / 6) - pressure, 18, 36);
}

function buildStarTargets(localLevel, chapterIndex, goals) {
  const goalLoad = Object.values(goals).reduce((sum, count) => sum + count, 0);
  const base = 1400 + localLevel * 34 + chapterIndex * 520 + goalLoad * 38;
  return [Math.round(base), Math.round(base * 1.9), Math.round(base * 3)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomPieceId() {
  return PIECES[Math.floor(Math.random() * PIECES.length)].id;
}

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

  return {
    row,
    col,
    type,
    blocker: null,
  };
}

function resetGame() {
  state.levelConfig = generateLevelConfig(state.currentLevel);
  state.board = [];
  state.selected = null;
  state.movesLeft = state.levelConfig.moves;
  state.score = 0;
  state.goals = structuredClone(state.levelConfig.goals);
  state.busy = false;
  state.activeBooster = null;
  clearAnimationHints();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    state.board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      state.board[row][col] = createCell(row, col);
    }
  }

  placeBlockers();
  updateGuide(GUIDE_LINES[0]);
  render();
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

      if (reserved.has(key) || cell.blocker) {
        continue;
      }

      cell.blocker = blocker;
      if (blocker === "crate") {
        cell.type = null;
      }
      reserved.add(key);
      placed += 1;
    }
  });
}

function applyAssetOverrides() {
  const scene = document.querySelector(".game-scene");
  const guide = document.querySelector("#guideCharacter");

  if (ASSETS.background) {
    scene.style.setProperty("--scene-image", `url("${ASSETS.background}")`);
  }

  if (ASSETS.guide.normal) {
    guide.style.setProperty("--guide-image", `url("${ASSETS.guide.normal}")`);
    guide.classList.add("has-image");
  }

  document.querySelectorAll(".booster").forEach((button) => {
    const booster = button.dataset.booster;
    if (!ASSETS.boosters[booster]) {
      return;
    }
    button.style.setProperty("--booster-image", `url("${ASSETS.boosters[booster]}")`);
    button.classList.add("has-image");
  });
}

function showScreen(screen) {
  const isHome = screen === "home";
  const isMap = screen === "map";
  const isGame = screen === "game";

  homeScreen.classList.toggle("is-active", isHome);
  mapScreen.classList.toggle("is-active", isMap);
  [gameTopHud, gameBoardView, gameGuideView, gameBottomHud].forEach((view) => {
    view.classList.toggle("is-active", isGame);
  });

  if (isMap) {
    renderLevelMap();
  }
}

function renderLevelMap() {
  renderChapterTabs();
  renderChapterPanel();
  renderLevelNodes();
}

function renderChapterTabs() {
  chapterTabs.innerHTML = "";
  CHAPTERS.forEach((chapter, index) => {
    const button = document.createElement("button");
    button.className = "chapter-tab";
    button.type = "button";
    button.textContent = String(index + 1);
    button.setAttribute("aria-label", chapter.title);
    button.classList.toggle("is-active", index === state.selectedChapterIndex);
    button.addEventListener("click", () => {
      state.selectedChapterIndex = index;
      renderLevelMap();
    });
    chapterTabs.append(button);
  });
}

function renderChapterPanel() {
  const chapter = CHAPTERS[state.selectedChapterIndex];
  const currentLocalLevel =
    state.levelConfig.chapterIndex === state.selectedChapterIndex
      ? state.levelConfig.localLevel
      : 1;
  chapterBadge.textContent = `第 ${state.selectedChapterIndex + 1} 章`;
  chapterTitle.textContent = chapter.title.replace(/^第.章\s*/, "");
  chapterDesc.textContent = `${chapter.scenicSpot} · ${chapter.featureFood}`;
  mapProgressText.textContent = `${currentLocalLevel}/100`;
  mapProgressFill.style.width = `${currentLocalLevel}%`;
}

function renderLevelNodes() {
  levelGrid.innerHTML = "";
  const startLevel = state.selectedChapterIndex * LEVELS_PER_CHAPTER + 1;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < LEVELS_PER_CHAPTER; index += 1) {
    const globalLevel = startLevel + index;
    const localLevel = index + 1;
    const button = document.createElement("button");
    button.className = "level-node";
    button.type = "button";
    button.textContent = String(localLevel);
    button.classList.toggle("is-current", globalLevel === state.currentLevel);
    button.classList.toggle("is-boss", localLevel % 10 === 0);
    button.setAttribute("aria-label", `进入第 ${globalLevel} 关`);
    button.addEventListener("click", () => {
      state.currentLevel = globalLevel;
      resetGame();
      showScreen("game");
      updateUrl("game");
    });
    fragment.append(button);
  }

  levelGrid.append(fragment);
}

function updateUrl(screen) {
  const url = new URL(window.location.href);
  if (screen === "game") {
    url.searchParams.set("level", String(state.currentLevel));
    url.searchParams.delete("screen");
  } else if (screen === "map") {
    url.searchParams.set("screen", "map");
    url.searchParams.delete("level");
  } else {
    url.searchParams.delete("screen");
    url.searchParams.delete("level");
  }
  window.history.replaceState({}, "", url);
}

function render() {
  gameBoard.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.board.flat().forEach((cell) => {
    const button = document.createElement("button");
    button.className = "cell";
    button.type = "button";
    button.dataset.row = cell.row;
    button.dataset.col = cell.col;
    button.disabled = state.busy;
    button.setAttribute("aria-label", describeCell(cell));

    if (state.selected?.row === cell.row && state.selected?.col === cell.col) {
      button.classList.add("selected");
    }

    if (cell.type) {
      const pieceConfig = PIECES.find((piece) => piece.id === cell.type);
      const piece = document.createElement("span");
      piece.className = `piece ${cell.type}`;
      piece.textContent = pieceConfig.text;
      applyPieceAnimationHints(piece, cell);

      if (ASSETS.pieces[cell.type]) {
        piece.style.setProperty("--piece-image", `url("${ASSETS.pieces[cell.type]}")`);
        piece.textContent = "";
      }

      button.append(piece);
    }

    if (cell.blocker) {
      const blocker = document.createElement("span");
      blocker.className = `blocker ${cell.blocker}`;
      blocker.textContent = BLOCKERS[cell.blocker].icon;
      if (ASSETS.blockers[cell.blocker]) {
        blocker.style.backgroundImage = `url("${ASSETS.blockers[cell.blocker]}")`;
        blocker.style.backgroundSize = "contain";
        blocker.style.backgroundPosition = "center";
        blocker.style.backgroundRepeat = "no-repeat";
        blocker.textContent = "";
      }
      blocker.setAttribute("aria-hidden", "true");
      button.append(blocker);
    }

    fragment.append(button);
  });

  gameBoard.append(fragment);
  renderGoals();
  updateStats();
}

function applyPieceAnimationHints(piece, cell) {
  const key = cellKey(cell);
  const swapHint = state.renderHints.swaps.find((hint) => hint.to === key);

  if (swapHint) {
    piece.classList.add("swapping");
    piece.style.setProperty("--move-x", String(swapHint.fromCol - cell.col));
    piece.style.setProperty("--move-y", String(swapHint.fromRow - cell.row));
  }

  if (state.renderHints.falling.has(key)) {
    const distance = state.renderHints.falling.get(key);
    piece.classList.add("falling");
    piece.style.setProperty("--fall-y", String(-distance));
    piece.style.setProperty("--fall-delay", `${Math.min(distance * 32, 130)}ms`);
  }

  if (state.renderHints.spawning.has(key)) {
    piece.classList.add("spawning");
    piece.style.setProperty("--fall-delay", `${Math.min(cell.row * 24, 130)}ms`);
  }
}

function renderGoals() {
  goalList.innerHTML = "";
  Object.entries(state.goals).forEach(([goal, count]) => {
    const config = getGoalConfig(goal);
    const item = document.createElement("div");
    item.className = "goal-item";
    item.innerHTML = `
      <span class="goal-icon" aria-hidden="true">${config.icon}</span>
      <span class="goal-count">${Math.max(count, 0)}</span>
    `;
    item.setAttribute("aria-label", `${config.label}目标剩余${Math.max(count, 0)}`);
    goalList.append(item);
  });
}

function updateStats() {
  movesLeft.textContent = state.movesLeft;
  scoreValue.textContent = state.score.toLocaleString("zh-CN");
  levelLabel.textContent = `第 ${state.levelConfig.globalLevel} 关`;

  const progress = Math.min(100, (state.score / state.levelConfig.starTargets[2]) * 100);
  starFill.style.width = `${progress}%`;
  document.querySelectorAll(".star").forEach((star, index) => {
    star.classList.toggle("lit", state.score >= state.levelConfig.starTargets[index]);
  });

  const { current, total } = state.levelConfig.chapterProgress;
  chapterFill.style.width = `${(current / total) * 100}%`;
  chapterText.textContent = `${current}/${total}`;
  document.querySelector(".chapter-name").textContent = state.levelConfig.chapter.title;
}

function getGoalConfig(goal) {
  if (goal === "food") {
    return {
      icon: "✦",
      label: "美食",
    };
  }
  return {
    icon: BLOCKERS[goal]?.icon || "▣",
    label: BLOCKERS[goal]?.label || "目标",
  };
}

function describeCell(cell) {
  if (cell.blocker === "crate") {
    return "木箱障碍";
  }

  const piece = PIECES.find((item) => item.id === cell.type);
  const blocker = cell.blocker ? `${BLOCKERS[cell.blocker].label}覆盖的` : "";
  return `${blocker}${piece?.aria || "空格"}`;
}

function handleBoardClick(event) {
  const cellButton = event.target.closest(".cell");
  if (!cellButton || state.busy) {
    return;
  }

  const row = Number(cellButton.dataset.row);
  const col = Number(cellButton.dataset.col);

  if (state.activeBooster === "hammer") {
    useHammer(row, col);
    return;
  }

  const cell = state.board[row][col];
  if (!canSelect(cell)) {
    updateGuide("这个格子暂时不能移动，先从旁边寻找机会。");
    return;
  }

  if (!state.selected) {
    state.selected = { row, col };
    render();
    return;
  }

  if (state.selected.row === row && state.selected.col === col) {
    state.selected = null;
    render();
    return;
  }

  if (!isAdjacent(state.selected, { row, col })) {
    state.selected = { row, col };
    render();
    return;
  }

  trySwap(state.selected, { row, col });
}

function canSelect(cell) {
  return Boolean(cell.type) && cell.blocker !== "crate" && cell.blocker !== "chain";
}

function isAdjacent(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
}

async function trySwap(a, b) {
  state.busy = true;
  swapTypes(a, b);
  state.selected = null;
  setSwapHints(a, b);
  render();

  const matches = findMatches();
  if (matches.length === 0) {
    await delay(210);
    swapTypes(a, b);
    setSwapHints(a, b);
    state.busy = false;
    updateGuide("没有形成三个相同美食，再换个方向试试。");
    render();
    clearAnimationHintsSoon();
    return;
  }

  state.movesLeft -= 1;
  await delay(190);
  clearAnimationHints();
  await resolveMatches(matches);
  state.busy = false;
  render();
  clearAnimationHintsSoon();
  checkGameEnd();
}

function swapTypes(a, b) {
  const first = state.board[a.row][a.col];
  const second = state.board[b.row][b.col];
  const temp = first.type;
  first.type = second.type;
  second.type = temp;
}

function findMatches() {
  const matched = new Set();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let streak = [state.board[row][0]];
    for (let col = 1; col < BOARD_SIZE; col += 1) {
      const current = state.board[row][col];
      const previous = streak[streak.length - 1];
      if (current.type && current.type === previous.type && current.blocker !== "crate") {
        streak.push(current);
      } else {
        addStreak(streak, matched);
        streak = [current];
      }
    }
    addStreak(streak, matched);
  }

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    let streak = [state.board[0][col]];
    for (let row = 1; row < BOARD_SIZE; row += 1) {
      const current = state.board[row][col];
      const previous = streak[streak.length - 1];
      if (current.type && current.type === previous.type && current.blocker !== "crate") {
        streak.push(current);
      } else {
        addStreak(streak, matched);
        streak = [current];
      }
    }
    addStreak(streak, matched);
  }

  return [...matched].map((key) => {
    const [row, col] = key.split(",").map(Number);
    return state.board[row][col];
  });
}

function addStreak(streak, matched) {
  if (streak.length < 3) {
    return;
  }
  streak.forEach((cell) => {
    if (cell.type && cell.blocker !== "crate") {
      matched.add(`${cell.row},${cell.col}`);
    }
  });
}

async function resolveMatches(initialMatches) {
  let matches = initialMatches;
  let combo = 0;

  while (matches.length > 0) {
    combo += 1;
    playMatchEffects(matches, combo);
    await delay(330);
    clearMatches(matches, combo);
    damageAdjacentCrates(matches);
    const fallHints = collapseBoard();
    const spawnHints = refillBoard();
    state.renderHints.falling = fallHints;
    state.renderHints.spawning = spawnHints;
    render();
    await delay(360);
    clearAnimationHints();
    matches = findMatches();
  }

  updateGuide(combo > 1 ? `漂亮！${combo} 连消，多彩贵州一路畅行。` : "消除成功，继续收集关卡目标。");
}

function clearMatches(matches, combo) {
  matches.forEach((cell) => {
    if (cell.blocker) {
      reduceGoal(cell.blocker);
      cell.blocker = null;
      if (!cell.type) {
        cell.type = randomPieceId();
      }
    } else {
      reduceGoal("food");
      cell.type = null;
    }
  });

  state.score += matches.length * SCORE_PER_TILE * combo;
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
      if (!inBounds(row, col)) {
        return;
      }

      const neighbor = state.board[row][col];
      if (neighbor.blocker === "crate") {
        reduceGoal("crate");
        neighbor.blocker = null;
        neighbor.type = null;
        state.score += SCORE_PER_TILE;
      }
    });
  });
}

function playMatchEffects(matches, combo = 1) {
  const center = getMatchCenter(matches);
  showFloatScore(center, matches.length * SCORE_PER_TILE * combo);
  if (combo > 1) {
    showComboBanner(combo);
  }

  matches.forEach((cell) => {
    const cellElement = getCellElement(cell);
    const piece = cellElement?.querySelector(".piece");
    cellElement?.classList.add("clearing");
    piece?.classList.add("matching");
    spawnParticles(cellElement, cell.type);
    spawnMatchRing(cellElement);
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
        falling.push({
          type: cell.type,
          fromRow: row,
        });
        cell.type = null;
      }
    }

    fillColumnSegment(col, 0, falling, fallHints);
  }
  return fallHints;
}

function fillColumnSegment(col, segmentStart, falling, fallHints) {
  for (let row = BOARD_SIZE - 1; row >= segmentStart; row -= 1) {
    const cell = state.board[row][col];
    if (cell.blocker === "crate") {
      continue;
    }
    const next = falling.shift();
    cell.type = next?.type || null;
    if (next && next.fromRow !== row) {
      fallHints.set(`${row},${col}`, row - next.fromRow);
    }
  }
}

function refillBoard() {
  const spawnHints = new Set();
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = state.board[row][col];
      if (!cell.type && cell.blocker !== "crate") {
        cell.type = randomPieceId();
        spawnHints.add(`${row},${col}`);
      }
    }
  }
  return spawnHints;
}

function reduceGoal(goal) {
  if (state.goals[goal] > 0) {
    state.goals[goal] -= 1;
  }
}

function setSwapHints(a, b) {
  state.renderHints.swaps = [
    {
      from: cellKey(a),
      to: cellKey(b),
      fromRow: a.row,
      fromCol: a.col,
    },
    {
      from: cellKey(b),
      to: cellKey(a),
      fromRow: b.row,
      fromCol: b.col,
    },
  ];
  state.renderHints.falling = new Map();
  state.renderHints.spawning = new Set();
}

function clearAnimationHints() {
  state.renderHints.swaps = [];
  state.renderHints.falling = new Map();
  state.renderHints.spawning = new Set();
}

function clearAnimationHintsSoon() {
  window.setTimeout(clearAnimationHints, 420);
}

function cellKey(cell) {
  return `${cell.row},${cell.col}`;
}

function getCellElement(cell) {
  return gameBoard.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
}

function getMatchCenter(matches) {
  const boardRect = gameBoard.getBoundingClientRect();
  const centers = matches
    .map((cell) => getCellElement(cell)?.getBoundingClientRect())
    .filter(Boolean)
    .map((rect) => ({
      x: rect.left - boardRect.left + rect.width / 2,
      y: rect.top - boardRect.top + rect.height / 2,
    }));

  if (!centers.length) {
    return { x: boardRect.width / 2, y: boardRect.height / 2 };
  }

  return {
    x: centers.reduce((sum, item) => sum + item.x, 0) / centers.length,
    y: centers.reduce((sum, item) => sum + item.y, 0) / centers.length,
  };
}

function showFloatScore(center, amount) {
  const score = document.createElement("span");
  score.className = "float-score";
  score.textContent = `+${amount}`;
  score.style.setProperty("--score-x", `${center.x}px`);
  score.style.setProperty("--score-y", `${center.y}px`);
  gameBoard.append(score);
  score.addEventListener("animationend", () => score.remove(), { once: true });
}

function showComboBanner(combo) {
  const banner = document.createElement("span");
  banner.className = "combo-banner";
  banner.textContent = `${combo} 连消`;
  gameBoard.append(banner);
  banner.addEventListener("animationend", () => banner.remove(), { once: true });
}

function spawnMatchRing(cellElement) {
  if (!cellElement) {
    return;
  }
  const ring = document.createElement("span");
  ring.className = "match-ring";
  cellElement.append(ring);
  ring.addEventListener("animationend", () => ring.remove(), { once: true });
}

function spawnParticles(cellElement, pieceType) {
  if (!cellElement) {
    return;
  }

  const colorOffset = Math.max(0, PIECES.findIndex((piece) => piece.id === pieceType));
  for (let index = 0; index < 7; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 7 - Math.PI / 2;
    const distance = 18 + (index % 3) * 8;
    particle.className = "particle";
    particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty(
      "--particle-color",
      PARTICLE_COLORS[(index + colorOffset) % PARTICLE_COLORS.length],
    );
    particle.style.setProperty("--particle-delay", `${index * 12}ms`);
    cellElement.append(particle);
    particle.addEventListener("animationend", () => particle.remove(), { once: true });
  }
}

function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

async function useHammer(row, col) {
  const cell = state.board[row][col];
  if (!cell.type && !cell.blocker) {
    updateGuide("这里已经是空格，银锤换个位置更值。");
    return;
  }

  state.activeBooster = null;
  document.querySelectorAll(".booster").forEach((button) => button.classList.remove("active"));

  state.busy = true;
  playMatchEffects([cell], 1);
  await delay(300);

  if (cell.blocker) {
    reduceGoal(cell.blocker);
    cell.blocker = null;
  } else {
    cell.type = null;
  }

  state.score += 120;
  state.renderHints.falling = collapseBoard();
  state.renderHints.spawning = refillBoard();
  render();
  await delay(340);
  clearAnimationHints();

  const matches = findMatches();
  if (matches.length > 0) {
    await resolveMatches(matches);
    state.busy = false;
    render();
    checkGameEnd();
  } else {
    state.busy = false;
    updateGuide("银锤敲开一个关键格，继续找下一步。");
    render();
    checkGameEnd();
  }
}

function activateBooster(event) {
  const button = event.target.closest(".booster");
  if (!button || state.busy) {
    return;
  }

  const booster = button.dataset.booster;
  document.querySelectorAll(".booster").forEach((item) => item.classList.remove("active"));

  if (state.activeBooster === booster) {
    state.activeBooster = null;
    updateGuide("已取消道具选择。");
    return;
  }

  state.activeBooster = booster;
  button.classList.add("active");

  if (booster === "hammer") {
    updateGuide("选择棋盘上的一个格子，银锤会直接敲开它。");
  } else {
    updateGuide("这个道具位置已经预留，后续可以接入正式技能。");
  }
}

function checkGameEnd() {
  const isWin = Object.values(state.goals).every((count) => count <= 0);
  if (isWin) {
    const stars = state.levelConfig.starTargets.filter((target) => state.score >= target).length;
    const nextLabel =
      state.currentLevel < TOTAL_LEVELS ? `下一关：第 ${state.currentLevel + 1} 关` : "七大章节已全部完成";
    openModal("通关成功", `获得 ${Math.max(stars, 1)} 星，黄小西收集到了新的景区纪念章。${nextLabel}`);
    return;
  }

  if (state.movesLeft <= 0) {
    openModal("步数用完", "还差一点点，再试一次一定能打开局面。");
  }
}

function openModal(title, text) {
  modalTitle.textContent = title;
  modalText.textContent = text;
  if (!modal.open) {
    modal.showModal();
  }
}

function changeLevel(nextLevel) {
  state.currentLevel = clamp(nextLevel, 1, TOTAL_LEVELS);
  state.selectedChapterIndex = Math.floor((state.currentLevel - 1) / LEVELS_PER_CHAPTER);
  resetGame();
  updateUrl("game");
  updateGuide(
    `${state.levelConfig.chapter.name}第 ${state.levelConfig.localLevel} 小关，今天跟黄小西继续吃遍贵州。`,
  );
}

function updateGuide(text) {
  guideBubble.textContent = text;
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

gameBoard.addEventListener("click", handleBoardClick);
document.querySelector(".booster-bar").addEventListener("click", activateBooster);

pauseButton.addEventListener("click", () => {
  showScreen("map");
  updateUrl("map");
});

settingsButton.addEventListener("click", () => {
  openModal("设置", "音效、震动、语言等入口已经预留。");
});

homeSettingsButton.addEventListener("click", () => {
  openModal("设置", "音效、震动、账号授权等入口已经预留。");
});

homeGiftButton.addEventListener("click", () => {
  openModal("今日奖励", "扫码进入可领取文旅小礼包，奖励系统入口已经预留。");
});

startJourneyButton.addEventListener("click", () => {
  showScreen("map");
  updateUrl("map");
});

continueJourneyButton.addEventListener("click", () => {
  showScreen("game");
  updateUrl("game");
});

backHomeButton.addEventListener("click", () => {
  showScreen("home");
  updateUrl("home");
});

mapInfoButton.addEventListener("click", () => {
  openModal("关卡规则", "7 大景区，每个景区 100 小关。前期收集美食，随后逐步加入冰块、木箱和银链。");
});

prevLevelButton.addEventListener("click", () => {
  changeLevel(state.currentLevel - 1);
});

nextLevelButton.addEventListener("click", () => {
  changeLevel(state.currentLevel + 1);
});

levelInfoButton.addEventListener("click", () => {
  const config = state.levelConfig;
  const blockerText = config.blockerPlan
    .filter((item) => item.amount > 0)
    .map((item) => `${getGoalConfig(item.type).label} ${item.amount}`)
    .join("、");
  const goalText = Object.entries(config.goals)
    .map(([goal, count]) => `${getGoalConfig(goal).label} ${count}`)
    .join("、");
  openModal(
    `${config.chapter.title}`,
    `${config.chapter.scenicSpot} · 第 ${config.localLevel}/100 关。目标：${goalText}。障碍：${blockerText || "本关暂无障碍"}。`,
  );
});

continueButton.addEventListener("click", () => {
  modal.close();
});

restartButton.addEventListener("click", () => {
  modal.close();
  resetGame();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.open) {
    modal.close();
  }
});

let lineIndex = 0;
window.setInterval(() => {
  if (state.busy || modal.open) {
    return;
  }
  lineIndex = (lineIndex + 1) % GUIDE_LINES.length;
  updateGuide(GUIDE_LINES[lineIndex]);
}, 9000);

applyAssetOverrides();
resetGame();
showScreen(INITIAL_SCREEN);
