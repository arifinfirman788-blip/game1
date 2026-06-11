import { ref, watch } from 'vue';

const isMusicOn = ref(localStorage.getItem('game1_music_on') !== 'false');
let bgmAudio = null;
let currentBgmIndex = -1; // 记录当前正在播放的音乐索引

// 定义三段音乐路径
const bgmList = [
  './audio/bgm1.mp3', // 第一页音乐
  './audio/bgm2.mp3', // 第二页音乐
  './audio/bgm3.mp3'  // 第三页音乐
];

export function useAudio() {
  const initAudio = (pageIndex = 0) => {
    // 确保 pageIndex 在 0-2 之间
    const safeIndex = Math.min(Math.max(pageIndex, 0), bgmList.length - 1);
    
    // 如果已经存在音频实例，且索引没变，不需要重新初始化
    if (bgmAudio && currentBgmIndex === safeIndex) return;

    // 如果有旧的音频正在播放，先暂停
    if (bgmAudio) {
      bgmAudio.pause();
    }

    // 初始化新的音频
    bgmAudio = new Audio(bgmList[safeIndex]);
    bgmAudio.loop = true;
    bgmAudio.volume = 0.5; // 轻柔的背景音量
    currentBgmIndex = safeIndex;

    // 如果开关是打开的，初始化后自动尝试播放
    if (isMusicOn.value) {
      playBgm();
    }
  };

  const playBgm = () => {
    if (!bgmAudio) initAudio(0);
    if (isMusicOn.value && bgmAudio.paused) {
      // 捕获浏览器自动播放限制可能抛出的异常
      bgmAudio.play().catch(err => {
        console.warn('自动播放被浏览器拦截，需要用户交互后播放:', err);
      });
    }
  };

  const pauseBgm = () => {
    if (bgmAudio && !bgmAudio.paused) {
      bgmAudio.pause();
    }
  };

  const switchBgm = (pageIndex) => {
    // 根据传入的地图页码（0, 1, 2）切换对应的音乐
    initAudio(pageIndex);
  };

  const toggleMusic = () => {
    isMusicOn.value = !isMusicOn.value;
    localStorage.setItem('game1_music_on', isMusicOn.value);
    if (isMusicOn.value) {
      playBgm();
    } else {
      pauseBgm();
    }
  };

  // 监听音乐开关状态
  watch(isMusicOn, (newVal) => {
    if (newVal) {
      playBgm();
    } else {
      pauseBgm();
    }
  });

  return {
    isMusicOn,
    toggleMusic,
    playBgm,
    pauseBgm,
    initAudio,
    switchBgm
  };
}
