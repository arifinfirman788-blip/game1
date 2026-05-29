/**
 * 游戏后端API封装 - Token认证版
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let _accessToken = '';
let _refreshToken = '';

export function getAccessToken() {
  return _accessToken;
}

export function getRefreshToken() {
  return _refreshToken;
}

export function setTokens(access, refresh) {
  _accessToken = access || '';
  _refreshToken = refresh || '';
  if (access) {
    sessionStorage.setItem('game_access_token', access);
  } else {
    sessionStorage.removeItem('game_access_token');
  }
  if (refresh) {
    sessionStorage.setItem('game_refresh_token', refresh);
  } else {
    sessionStorage.removeItem('game_refresh_token');
  }
}

export function clearTokens() {
  _accessToken = '';
  _refreshToken = '';
  sessionStorage.removeItem('game_access_token');
  sessionStorage.removeItem('game_refresh_token');
}

export function updateUrlTokens(accessToken, refreshToken) {
  try {
    const url = new URL(window.location.href);
    if (accessToken) url.searchParams.set('accessToken', accessToken);
    if (refreshToken) url.searchParams.set('refreshToken', refreshToken);
    url.searchParams.delete('uid');
    url.searchParams.delete('phone');
    window.history.replaceState({}, '', url.toString());
  } catch {
    // ignore URL update errors
  }
}

// 初始化：从sessionStorage恢复token
(function initTokens() {
  _accessToken = sessionStorage.getItem('game_access_token') || '';
  _refreshToken = sessionStorage.getItem('game_refresh_token') || '';
})();

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  const response = await fetch(BASE_URL + url, {
    ...options,
    headers,
  });

  // 401 自动刷新 token
  if (response.status === 401 && _refreshToken && !url.includes('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newTokens = await doRefreshToken(_refreshToken);
        setTokens(newTokens.accessToken, newTokens.refreshToken);
        updateUrlTokens(newTokens.accessToken, newTokens.refreshToken);
        isRefreshing = false;
        onTokenRefreshed(newTokens.accessToken);
        // 重试原请求
        return request(url, options);
      } catch (err) {
        isRefreshing = false;
        _accessToken = '';
        sessionStorage.removeItem('game_access_token');
        // 保留refreshToken，让用户可以点击重试按钮重新登录
        // 通知App层认证已过期，显示错误遮罩
        window.dispatchEvent(new CustomEvent('game:auth-expired', {
          detail: { message: '登录已过期，请重新进入游戏' }
        }));
        throw new Error('登录已过期，请重新进入游戏');
      }
    } else {
      // 正在刷新，等待刷新完成后重试
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(request(url, options));
        });
      });
    }
  }

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.msg || '请求失败');
  }
  return data.data;
}

/**
 * 认证接口专用请求（不带Authorization头，避免过期token干扰Spring Security）
 */
async function authRequest(url, body) {
  const response = await fetch(BASE_URL + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.msg || '请求失败');
  }
  return data.data;
}

/**
 * 颁发 Token（由小程序后端调用）
 */
export async function requestToken(appId, appSecret, uid, phone) {
  return authRequest('/game/api/auth/token', { appId, appSecret, uid, phone });
}

/**
 * 刷新 Token
 */
export async function doRefreshToken(refreshToken) {
  return authRequest('/game/api/auth/refresh', { refreshToken });
}

/**
 * 验证accessToken
 */
export async function verifyToken(accessToken) {
  return authRequest('/game/api/auth/verify', { accessToken });
}

/**
 * 加载游戏数据（进度+卡牌）
 */
export async function loadGameData() {
  return request('/game/api/progress');
}

/**
 * 同步进度到后端
 */
export async function syncProgress(progress) {
  return request('/game/api/progress/sync', {
    method: 'POST',
    body: JSON.stringify({ progress }),
  });
}

/**
 * 抽卡
 */
export async function drawCardApi() {
  return request('/game/api/card/draw', {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

/**
 * 兑换卡牌
 */
export async function redeemCardApi(instanceId) {
  return request('/game/api/card/redeem', {
    method: 'POST',
    body: JSON.stringify({ instanceId }),
  });
}

/**
 * 小程序查询卡牌
 */
export async function queryCards() {
  return request('/game/api/card/query');
}
