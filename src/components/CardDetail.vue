<template>
  <section class="card-detail" :class="{ 'show': show }">
    <div class="detail-content">
      <!-- 关闭按钮 -->
      <button class="close-btn" @click="handleClose">
        <span>✕</span>
      </button>

      <!-- 卡牌展示 -->
      <div class="card-showcase" :class="card?.level">
        <div class="card-image">
          <img :src="card?.imageUrl" :alt="card?.name" decoding="async" />
        </div>
        <div class="card-info">
          <span class="card-name">{{ card?.name }}</span>
          <span class="card-level">{{ CARD_LEVELS[card?.level]?.name }}</span>
          <p class="card-description">{{ card?.description }}</p>
        </div>
      </div>

      <!-- 权益信息 -->
      <div class="reward-section">
        <h3>可兑换权益</h3>
        <div class="reward-card">
          <span class="reward-icon">{{ card?.reward?.icon }}</span>
          <div class="reward-info">
            <span class="reward-name">{{ card?.reward?.name }}</span>
            <span class="reward-desc">{{ card?.reward?.description }}</span>
          </div>
        </div>
      </div>

      <!-- 代金券(Voucher)：查看代金券编码 -->
      <template v-if="card?.productType === 'voucher'">
        <div v-if="card?.status === 'unused'" class="redeem-section">
          <!-- 查看代金券编码 -->
          <button class="view-code-btn" @click="toggleCodeVisible">
            {{ codeVisible ? '隐藏代金券编码' : '查看代金券编码' }}
          </button>
          <div class="voucher-code-wrap" :class="{ 'open': codeVisible }">
            <div class="voucher-code-inner">
              <span class="voucher-code-label">代金券编码</span>
              <span class="voucher-code-value">{{ card?.instanceId }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 底价购(base_price)：立即兑换 -->
      <template v-else-if="card?.productType === 'base_price'">
        <div v-if="card?.status === 'unused'" class="redeem-section">
          <button
            class="redeem-btn merchant-btn"
            :disabled="isRedeeming"
            @click="handleRedeem"
          >
            <span v-if="isRedeeming">兑换中...</span>
            <span v-else>立即兑换</span>
          </button>
          <p class="redeem-hint">兑换后请前往小程序完成购买</p>
        </div>
        <div v-else-if="card?.status === 'redeemed'" class="redeemed-section">
          <div class="voucher-code-wrap open">
            <div class="voucher-code-inner">
              <span class="voucher-code-label">兑换码</span>
              <span class="voucher-code-value">{{ card?.redemptionCode }}</span>
              <button class="copy-btn" @click="handleCopyCode">复制</button>
            </div>
          </div>
          <button class="mini-program-btn" @click="handleJumpToMiniProgram">
            去购买
          </button>
        </div>
        <div v-else-if="card?.status === 'consumed' || card?.status === 'used'" class="redeemed-section">
          <div class="used-stamp">已核销</div>
          <p class="expire-hint" v-if="card?.consumedAt || card?.usedAt">核销时间：{{ formatExpireTime(card.consumedAt || card.usedAt) }}</p>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { CARD_LEVELS } from '../config/cardSystem';
import { useCardSystem } from '../composables/useCardSystem';
import { getMiniProgramAppid } from '../composables/usePlayerProgress';
import { showToast } from 'vant';

const emit = defineEmits(['close']);

const props = defineProps({
  show: Boolean,
  card: Object,
});

const { redeemCard } = useCardSystem();

const isRedeeming = ref(false);
const codeVisible = ref(false);

function toggleCodeVisible() {
  codeVisible.value = !codeVisible.value;
}

async function handleRedeem() {
  if (!props.card || isRedeeming.value) return;

  isRedeeming.value = true;
  const result = await redeemCard(props.card.instanceId);
  isRedeeming.value = false;

  if (result) {
    // 更新本地卡牌状态
    props.card.status = 'redeemed';
    props.card.redemptionCode = result.redemptionCode;
    props.card.expireAt = result.expireAt;
  }
}

function handleCopyCode() {
  if (props.card?.redemptionCode) {
    navigator.clipboard?.writeText(props.card.redemptionCode);
    showToast({ message: '已复制', duration: 2000, icon: 'success' });
  }
}

function handleJumpToMiniProgram() {
  let path = props.card?.reward?.miniProgramPath || '/pages/index/index';

  // 替换模板变量：${productCode} 和 ${redeemCode}
  if (props.card) {
    path = path
      .replace('${productCode}', props.card.productCode || '')
      .replace('${redeemCode}', props.card.redemptionCode || '');
  }

  const miniProgramAppId = getMiniProgramAppid();

  // 检测运行环境
  const isMiniProgram = window.__wxjs_environment === 'miniprogram'
    || /miniProgram/i.test(navigator.userAgent);
  const isWechat = /MicroMessenger/i.test(navigator.userAgent);

  console.log(">>>>>>>>", path)
  if (window.wx && wx.miniProgram) {
    if (isMiniProgram) {
      //showToast({ message: 'path=' + path , duration: 2000 });
      // 场景1：小程序内 webview → 跳转同小程序的页面
      wx.miniProgram.navigateTo({ url: '/' + path, success: s => {
          console.log(">>>>> 跳转成功：", s)
        }, fail: e => {
          console.log(">>>>> 跳转错误：", e)
        }, complete: o => {
          console.log(">>>>> 跳转结果1：", o)
        } });
      // wx.miniProgram.navigateTo({ url: '/pages/selectScenery/Index', complete: o => {
      //   console.log(">>>>> 跳转结果2：", o)
      //   } });
    } else if (isWechat) {
      // 场景2：微信内置浏览器 → 通过 URL Scheme 打开小程序
      const encodedPath = encodeURIComponent(path);
      const scheme = `weixin://dl/business/?appid=${miniProgramAppId}&path=${encodedPath}`;
      // 尝试在新窗口打开，避免当前页面被替换为"无法访问"
      const opened = window.open(scheme, '_blank');
      if (!opened) {
        // 新窗口被拦截，降级为 location.href
        window.location.href = scheme;
      }
    }
  } else {
    // 场景3：非微信环境 → 提示用户
    showToast({ message: '请在微信中打开', duration: 2000 });
  }
}

function handleClose() {
  emit('close');
}

function formatExpireTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}
</script>

<style scoped>
.card-detail {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0);
  pointer-events: none;
  transition: background 300ms ease;
}

.card-detail.show {
  background: rgba(0, 0, 0, 0.6);
  pointer-events: auto;
}

.detail-content {
  position: relative;
  width: 90%;
  max-width: 360px;
  max-height: 90vh;
  background: linear-gradient(180deg, #fff 0%, #f5f0e8 100%);
  border-radius: 16px;
  padding: 24px;
  overflow-y: auto;
  transform: scale(0.9) translateY(20px);
  opacity: 0;
  transition: transform 350ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease;
}

.card-detail.show .detail-content {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.card-showcase {
  text-align: center;
  margin-bottom: 20px;
}

.card-image {
  width: 180px;
  height: 240px;
  margin: 0 auto 12px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-showcase.blue .card-image {
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
}

.card-showcase.purple .card-image {
  box-shadow: 0 4px 16px rgba(147, 51, 234, 0.3);
}

.card-showcase.gold .card-image {
  box-shadow: 0 4px 16px rgba(234, 179, 8, 0.4);
}

.card-showcase.red .card-image {
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
}

.card-name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #5a3d1a;
}

.card-level {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 10px;
  background: linear-gradient(135deg, #c4a574 0%, #d4b584 100%);
  color: #fff;
  font-size: 12px;
  border-radius: 10px;
}

.card-description {
  font-size: 13px;
  color: #8b7355;
  margin-top: 8px;
  line-height: 1.5;
}

.reward-section {
  margin-bottom: 20px;
}

.reward-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #5a3d1a;
  margin-bottom: 10px;
}

.reward-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(196, 165, 116, 0.1);
  border-radius: 10px;
}

.reward-icon {
  font-size: 28px;
}

.reward-info {
  flex: 1;
}

.reward-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #5a3d1a;
}

.reward-desc {
  display: block;
  font-size: 12px;
  color: #8b7355;
  margin-top: 2px;
}

.redeem-section {
  text-align: center;
}

.redeem-btn {
  width: 100%;
  padding: 14px;
  border: none;
  background: linear-gradient(135deg, #c4a574 0%, #d4b584 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  cursor: pointer;
  transition: transform 200ms ease, opacity 200ms ease;
}

.redeem-btn.merchant-btn {
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.used-stamp {
  font-size: 20px;
  font-weight: 800;
  color: #dc2626;
  border: 3px solid #dc2626;
  border-radius: 8px;
  padding: 8px 24px;
  display: inline-block;
  transform: rotate(-10deg);
  margin: 10px 0;
  opacity: 0.8;
}

.redeem-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.redeem-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.redeem-hint {
  font-size: 11px;
  color: #8b7355;
  margin-top: 8px;
}

.view-code-btn {
  margin-top: 12px;
  width: 100%;
  padding: 10px;
  border: 1px solid #c4a574;
  background: transparent;
  color: #c4a574;
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: background 200ms ease, color 200ms ease;
}

.view-code-btn:active {
  background: rgba(196, 165, 116, 0.1);
}

/* 代金券编码展开区：max-height 过渡，避免撑大对话框引发滚动 */
.voucher-code-wrap {
  max-height: 0;
  overflow: hidden;
  transition: max-height 300ms cubic-bezier(0.16, 1, 0.3, 1),
              margin-top 300ms ease;
}

.voucher-code-wrap.open {
  max-height: 120px;
  margin-top: 10px;
  margin-bottom: 12px;
}

.voucher-code-inner {
  padding: 10px 14px;
  background: linear-gradient(135deg, #fff8e8 0%, #f3e6c6 100%);
  border: 1px dashed #c4a574;
  border-radius: 10px;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.voucher-code-label {
  display: block;
  font-size: 11px;
  color: #8b7355;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.voucher-code-value {
  flex: 1;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 1.2px;
  color: #5a3d1a;
  word-break: break-all;
  line-height: 1.4;
}

.redeemed-section {
  text-align: center;
}

.code-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(196, 165, 116, 0.1);
  border-radius: 10px;
  margin-bottom: 12px;
}

.code-label {
  font-size: 12px;
  color: #8b7355;
}

.code-value {
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  color: #5a3d1a;
  font-family: monospace;
}

.copy-btn {
  padding: 4px 12px;
  border: 1px solid #c4a574;
  background: transparent;
  color: #c4a574;
  font-size: 12px;
  border-radius: 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.mini-program-btn {
  width: 100%;
  padding: 14px;
  border: none;
  background: linear-gradient(135deg, #07c160 0%, #10b981 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 24px;
  cursor: pointer;
  transition: transform 200ms ease;
}

.mini-program-btn:active {
  transform: scale(0.97);
}

.expire-hint {
  font-size: 11px;
  color: #ef4444;
  margin-top: 8px;
}
</style>
