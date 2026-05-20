const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;

export const assetManifest = {
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
    ice: "",
    chain: "",
    crate: "",
  },
  guide: {
    normal: asset("/assets/detail/characters/huangxiaoxi.png"),
    happy: "",
    thinking: "",
  },
  background: "",
  backgrounds: {
    huangguoshu: asset("/assets/detail/backgrounds/huangguoshu-detail-bg-mobile.jpg"),
  },
  ui: {
    board: asset("/assets/detail/ui/board.png"),
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
  map: {
    background: asset("/assets/map/level-map-bg.jpg"),
    route: asset("/assets/map/route-unlocked.webp"),
    highlights: [
      asset("/assets/map/chapter-highlights/kaili-suantangyu.png"),
      asset("/assets/map/chapter-highlights/zunyi-yangroufen.png"),
      asset("/assets/map/chapter-highlights/xingyi-yangroufen.png"),
      asset("/assets/map/chapter-highlights/wuse-nuomifan.png"),
      asset("/assets/map/chapter-highlights/nanbai-huangba.png"),
      asset("/assets/map/chapter-highlights/zhijin-faba.png"),
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
      opened: asset("/assets/map/chest-opened.png"),
    },
    titleFrame: asset("/assets/map/level-map-title-frame.png"),
    bottomBar: asset("/assets/map/level-map-bottom-bar.png"),
    rulesPanel: asset("/assets/map/rules-panel.png"),
    buttons: {
      back: asset("/assets/map/btn-back.png"),
      reward: asset("/assets/map/footer-reward.png"),
      setting: asset("/assets/map/footer-rules.png"),
    },
    guideHalf: asset("/assets/map/huangxiaoxi-half.png"),
    guideDialog: asset("/assets/map/dialog-bubble.png"),
    chapterCards: {
      active: asset("/assets/map/chapter-card-active.png"),
      normal: asset("/assets/map/chapter-card-normal.png"),
    },
  },
};
