import { ref, onMounted, onUnmounted, watch } from 'vue';

const isMusicOn = ref(localStorage.getItem('game1_music_on') !== 'false');
let bgmAudio = null;

export function useAudio() {
  const initAudio = () => {
    if (!bgmAudio) {
      // 指向 public/audio/bgm.mp3
      bgmAudio = new Audio('./audio/bgm.mp3');
      bgmAudio.loop = true;
      bgmAudio.volume = 0.5; // 轻柔的背景音量
    }
  };

  const playBgm = () => {
    if (!bgmAudio) initAudio();
    if (isMusicOn.value) {
      // 捕获浏览器自动播放限制可能抛出的异常
      bgmAudio.play().catch(err => {
        console.warn('自动播放被浏览器拦截，需要用户交互后播放:', err);
      });
    }
  };

  const pauseBgm = () => {
    if (bgmAudio) {
      bgmAudio.pause();
    }
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
    initAudio
  };
}
