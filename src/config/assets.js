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
    huangguoshu: asset("/assets/detail/backgrounds/huangguoshu-detail-bg.png"),
  },
  ui: {
    board: asset("/assets/detail/ui/board.png"),
    boosterBar: asset("/assets/detail/ui/booster-bar.png"),
    boosterFrame: asset("/assets/detail/ui/booster-frame.png"),
    dialogBubble: asset("/assets/detail/ui/dialog-bubble.png"),
    pauseButton: asset("/assets/detail/ui/pause-button.png"),
    settingButton: asset("/assets/detail/ui/setting-button.png"),
    topPanel: asset("/assets/detail/ui/top-panel.webp"),
    titleBar: asset("/assets/detail/ui/title-bar.png"),
    tasselTop: asset("/assets/detail/ui/tassel-top.png"),
    chapterBuilding: asset("/assets/detail/ui/chapter-building.png"),
    progressFrame: asset("/assets/detail/ui/progress-frame.png"),
    treasureChest: asset("/assets/detail/ui/treasure-chest.png"),
    starGray: asset("/assets/detail/ui/star-gray.png"),
  },
};
