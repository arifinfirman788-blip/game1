import cardBlueImg from '../../image/card-blue.png';
import cardPurpleImg from '../../image/card-purple.png';
import cardGoldImg from '../../image/card-gold.png';

const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

// -
export const assetManifest = {
  home: {
    bg: asset("/assets/home-bg-new.jpg"),
  },
  pieces: {
    chili: asset("/assets/detail/pieces/chili.png"),
    bluecake: asset("/assets/detail/pieces/bluecake.png"),
    greenroll: asset("/assets/detail/pieces/greenroll.png"),
    yellowcake: asset("/assets/detail/pieces/yellowcake.png"),
    rosejar: asset("/assets/detail/pieces/rosejar.png"),
    fish: asset("/assets/detail/pieces/fish.png"),
  },
  boosters: {
    hammer: asset("/assets/detail/boosters/hammer.png"),
    bottle: asset("/assets/detail/boosters/bottle.png"),
    flower: asset("/assets/detail/boosters/flower.png"),
    mask: asset("/assets/detail/boosters/mask.png"),
    hand: asset("/assets/detail/boosters/hand.png"),
  },
  specials: {
    glow: asset("/assets/detail/specials/glow.png"),
    lineBomb: asset("/assets/detail/specials/line-bomb.png"),
    rainbow: asset("/assets/detail/specials/rainbow.png"),
  },
  blockers: {
    ice: "", // 依然使用 CSS 生成的样式
    chain2: asset("/assets/detail/blockers/chain-2.png"),
    chain1: asset("/assets/detail/blockers/chain-2.png"), // 同一张图，CSS 增加透明度/滤镜区分
    crate2: asset("/assets/detail/blockers/crate-2.png"),
    crate1: asset("/assets/detail/blockers/crate-1.png"),
    iceblock2: asset("/assets/detail/blockers/iceblock-2.png"),
    iceblock1: asset("/assets/detail/blockers/iceblock-1.png"),
  },
  guide: {
    normal: asset("/assets/detail/characters/huangxiaoxi.png"),
    happy: "",
    thinking: "",
  },
  background: asset("/assets/custom-bg.png"),
  backgrounds: {
    huangguoshu: asset("/assets/detail/backgrounds/huangguoshu-detail-bg-mobile.jpg"),
  },
  ui: {
    board: asset("/assets/detail/ui/mobile/board-mobile.png"),
    boosterFrame: asset("/assets/detail/ui/booster-frame.png"),
    dialogBubble: asset("/assets/detail/ui/dialog-bubble.png"),
    pauseButton: asset("/assets/detail/ui/pause-button.png"),
    settingButton: asset("/assets/detail/ui/setting-button.png"),
    topPanel: asset("/assets/detail/ui/top-panel.webp"),
    chapterBuilding: asset("/assets/detail/ui/chapter-building.png"),
    progressFrame: asset("/assets/detail/ui/progress-frame.png"),
    treasureChest: asset("/assets/detail/ui/treasure-chest.png"),
    starGray: asset("/assets/detail/ui/star-gray.png"),
  },
  settle: {
    banner: asset("/assets/settle/banner.png"),
    rewardFrame: asset("/assets/settle/reward-frame.png"),
    detailFrame: asset("/assets/settle/detail-frame.png"),
    detailFrameNew: asset("/assets/settle/detail-frame-new.png"),
    btnRetry: asset("/assets/settle/btn-retry.png"),
    btnNext: asset("/assets/settle/btn-next.png"),
    character: asset("/assets/settle/character.png"),
    star1: asset("/assets/settle/star-1.png"),
    star2: asset("/assets/settle/star-2.png"),
    star3: asset("/assets/settle/star-3.png"),
  },
  cards: {
    blue: cardBlueImg,
    purple: cardPurpleImg,
    gold: cardGoldImg,
  },
  failSettle: {
    title: asset("/image/挑战失败/挑战失败副本.png"),
    dialog: asset("/image/挑战失败/失败对话框副本.png"),
    character: asset("/image/挑战失败/失败人物图副本.png"),
    btnRetry: asset("/image/挑战失败/重新挑战副本.png"),
    btnHome: asset("/image/挑战失败/返回主界面.png"),
  },
  map: {
    background: asset("/assets/map/mobile/level-map-bg-mobile.jpg"),
    route: asset("/assets/map/route-unlocked.webp"),
    highlights: [
      asset("/assets/map/chapter-highlights/mobile/kaili-suantangyu-mobile.png"),
      asset("/assets/map/chapter-highlights/mobile/zunyi-yangroufen-mobile.png"),
      asset("/assets/map/chapter-highlights/mobile/xingyi-yangroufen-mobile.png"),
      asset("/assets/map/chapter-highlights/mobile/wuse-nuomifan-mobile.png"),
      asset("/assets/map/chapter-highlights/mobile/nanbai-huangba-mobile.png"),
      asset("/assets/map/chapter-highlights/mobile/zhijin-faba-mobile.png"),
    ],
    nodes: {
      current: asset("/assets/map/level-node-current.png"),
      locked: asset("/assets/map/level-node-locked.webp"),
      pass0: asset("/assets/map/level-node-pass-0.png"),
      pass1: asset("/assets/map/level-node-pass-1.png"),
      pass2: asset("/assets/map/level-node-pass-2.png"),
      pass3: asset("/assets/map/level-node-pass-3.png"),
    },
    chests: {
      closed: asset("/assets/map/chest-closed.webp"),
      ready: asset("/assets/map/chest-ready.png"),
      opened: asset("/assets/map/chest-opened.webp"),
    },
    titleFrame: asset("/assets/map/mobile/level-map-title-frame-mobile.png"),
    bottomBar: asset("/assets/map/mobile/level-map-bottom-bar-mobile.png"),
    rulesPanel: asset("/assets/map/rules-panel.png"),
    rulesPanelNew: asset("/assets/map/rules-panel-new.png"),
    buttons: {
      back: asset("/assets/map/btn-back.png"),
      reward: asset("/assets/map/footer-reward.png"),
      setting: asset("/assets/map/btn-setting.png"),
      footerRules: asset("/assets/map/footer-rules.png"),
    },
    guideHalf: asset("/assets/map/mobile/huangxiaoxi-half-mobile.png"),
    guideDialog: asset("/assets/map/dialog-bubble.png"),
    chapterCards: {
      active: asset("/assets/map/chapter-card-active.png"),
      normal: asset("/assets/map/chapter-card-normal.png"),
    },
  },
};
