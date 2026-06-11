import { ref, watch } from 'vue';

const isMusicOn = ref(localStorage.getItem('game1_music_on') !== 'false');
let bgmAudio = null;
let currentScene = ''; // 记录当前正在播放的场景

// 定义五个场景的音乐路径
const bgmList = {
  home: './audio/bgm_home.mp3',       // 欢迎页音乐
  map: './audio/bgm_map.mp3',         // 选关页音乐
  game: './audio/bgm_game.mp3',       // 游戏详情页音乐
  victory: './audio/bgm_victory.mp3', // 胜利结算页音乐
  fail: './audio/bgm_fail.mp3'        // 失败结算页音乐
};

export function useAudio() {
  const initAudio = (scene = 'home') => {
    // 确保传入的场景是有效的，否则降级到 home 或 game
    const safeScene = bgmList[scene] ? scene : 'home';
    
    // 如果已经存在音频实例，且场景没变，不需要重新初始化
    if (bgmAudio && currentScene === safeScene) return;

    // 如果有旧的音频正在播放，先暂停
    if (bgmAudio) {
      bgmAudio.pause();
    }

    // 初始化新的音频
    bgmAudio = new Audio(bgmList[safeScene]);
    bgmAudio.loop = true; // 循环播放
    bgmAudio.volume = 0.5; // 轻柔的背景音量
    currentScene = safeScene;

    // 如果开关是打开的，初始化后自动尝试播放
    if (isMusicOn.value) {
      playBgm();
    }
  };

  const playBgm = () => {
    if (!bgmAudio) initAudio('home');
    if (isMusicOn.value && bgmAudio.paused) {
      // 尝试播放
      const playPromise = bgmAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('自动播放被浏览器拦截，需要用户交互后播放:', err);
          // 监听一次用户的点击/触摸交互，随后尝试播放
          const userInteract = () => {
            if (isMusicOn.value && bgmAudio && bgmAudio.paused) {
              bgmAudio.play().catch(e => console.warn('再次尝试播放失败:', e));
            }
            document.removeEventListener('click', userInteract);
            document.removeEventListener('touchstart', userInteract);
          };
          document.addEventListener('click', userInteract, { once: true });
          document.addEventListener('touchstart', userInteract, { once: true });
        });
      }
    }
  };

  const pauseBgm = () => {
    if (bgmAudio && !bgmAudio.paused) {
      bgmAudio.pause();
    }
  };

  const switchBgm = (scene) => {
    // 根据传入的场景名称切换对应的音乐
    initAudio(scene);
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
