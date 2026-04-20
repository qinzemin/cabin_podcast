/* ===================================================
   app.js — AI资讯助手 车机原型 交互逻辑
   =================================================== */

/* ---------- 数据 ---------- */
const NEWS_DATA = [
  {
    id: 1,
    title: "小米SU7 Ultra量产版正式亮相",
    sub: "售价52.99万元，最大功率1548马力，0-100km/h仅需1.98秒",
    tags: ["汽车", "科技"],
    duration: "4分钟",
    cat: "car",
    ico: "⛟",
    color: ["#1a3a5c", "#0e2240"],
  },
  {
    id: 2,
    title: "A股三大指数今日高开低走",
    sub: "沪指跌0.32%，创业板指跌0.68%，北向资金净流出23亿",
    tags: ["财经", "国内"],
    duration: "3分钟",
    cat: "finance",
    ico: "¥",
    color: ["#1c3820", "#102215"],
  },
  {
    id: 3,
    title: "OpenAI发布GPT-5.5 多模态能力大幅提升",
    sub: "支持实时视频理解、长达1M token上下文，企业版同步推出",
    tags: ["科技", "国际"],
    duration: "5分钟",
    cat: "tech",
    ico: "◎",
    color: ["#2a1a4c", "#1a0e30"],
  },
  {
    id: 4,
    title: "世卫组织发布最新睡眠健康白皮书",
    sub: "全球超13亿成人存在睡眠障碍，推荐7-9小时优质睡眠",
    tags: ["健康"],
    duration: "6分钟",
    cat: "health",
    ico: "♡",
    color: ["#3a1a1a", "#281010"],
  },
  {
    id: 5,
    title: "国际足联公布2026世界杯赛程安排",
    sub: "将在美国、加拿大、墨西哥三国举办，共48支球队参赛",
    tags: ["体育", "国际"],
    duration: "4分钟",
    cat: "sport",
    ico: "◉",
    color: ["#1a2c1a", "#0e1e0e"],
  },
];

/* ---------- 状态 ---------- */
const state = {
  currentPage: "main",
  playingId: 1,
  selectedPrefs: new Set(["car", "tech"]),
  savedPrefs: new Set(["car", "tech"]),
  proInput: "",
  payMethod: "qr",
  newsData: [...NEWS_DATA],
};

/* ---------- DOM 引用 ---------- */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  pages: () => $$(".page"),
  newsList: $("newsList"),
  chipScroller: $("chipScroller"),
  prefGrid: $("prefGrid"),
  proInput: $("proInput"),
  proCount: $("proCount"),
  payModalMask: $("payModalMask"),
  toast: $("toast"),
  sbTime: $("sbTime"),
  voiceCmd: $("voiceCmd"),
};

/* ---------- 路由：页面切换 ---------- */
function navigateTo(pageName) {
  if (!pageName || pageName === state.currentPage) return;
  const all = $$(".page");
  all.forEach((p) => p.classList.remove("is-active"));
  const target = document.querySelector(`[data-page="${pageName}"]`);
  if (target) {
    target.classList.add("is-active");
    state.currentPage = pageName;
  }
  // 偏好设置页初始化选中状态
  if (pageName === "prefs") syncPrefUI();
}

/* ---------- 渲染音频卡片 ---------- */
function renderNews() {
  const list = dom.newsList;
  list.innerHTML = "";
  state.newsData.forEach((item) => {
    const card = document.createElement("div");
    card.className = "news-card" + (item.id === state.playingId ? " is-playing" : "");
    card.dataset.id = item.id;
    card.innerHTML = `
      <div class="news-cover">
        <div class="news-cover-bg" style="background:${item.color[0]}"></div>
        <span class="news-cover-ico">${item.ico}</span>
        <span class="play-indicator">⏸</span>
      </div>
      <div class="news-info">
        <div class="news-title">${item.title}</div>
        <div class="news-sub">${item.sub}</div>
        <div class="news-tags">
          ${item.tags.map((t) => `<span class="news-tag">${t}</span>`).join("")}
          <span class="news-duration">${item.duration}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => togglePlay(item.id));
    list.appendChild(card);
  });
}

function togglePlay(id) {
  if (state.playingId === id) {
    state.playingId = null;
    showToast("已暂停播放");
  } else {
    state.playingId = id;
    const item = state.newsData.find((n) => n.id === id);
    if (item) showToast(`正在播报：${item.title}`);
  }
  renderNews();
}

/* ---------- 偏好设置 ---------- */
function syncPrefUI() {
  $$(".pref-item").forEach((btn) => {
    const cat = btn.dataset.cat;
    btn.classList.toggle("is-selected", state.selectedPrefs.has(cat));
  });
}

function initPrefGrid() {
  $$(".pref-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      if (state.selectedPrefs.has(cat)) {
        state.selectedPrefs.delete(cat);
      } else {
        state.selectedPrefs.add(cat);
      }
      syncPrefUI();
    });
  });
}

function confirmPrefs() {
  state.savedPrefs = new Set(state.selectedPrefs);
  const names = {
    finance: "财经", entertain: "娱乐", car: "汽车",
    health: "健康", tech: "科技", sport: "体育",
    military: "军事", global: "国际",
  };
  const selected = [...state.savedPrefs].map((k) => names[k] || k).join("、");
  navigateTo("main");
  showToast(`偏好已保存：${selected || "无"}`);
}

function cancelPrefs() {
  state.selectedPrefs = new Set(state.savedPrefs);
  navigateTo("main");
}

/* ---------- 高阶输入框字数 ---------- */
function initProInput() {
  dom.proInput.addEventListener("input", () => {
    const len = dom.proInput.value.length;
    dom.proCount.textContent = len;
    state.proInput = dom.proInput.value;
  });
  // 示例 chips 点击
  $$(".ex-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      dom.proInput.value = chip.textContent;
      dom.proInput.dispatchEvent(new Event("input"));
    });
  });
}

/* ---------- 付费弹窗 ---------- */
function openPayModal() {
  dom.payModalMask.removeAttribute("hidden");
}

function closePayModal() {
  dom.payModalMask.setAttribute("hidden", "");
}

function initPayModal() {
  // 关闭
  $("closePayModal").addEventListener("click", closePayModal);
  dom.payModalMask.addEventListener("click", (e) => {
    if (e.target === dom.payModalMask) closePayModal();
  });

  // 支付方式切换
  $$(".pay-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".pay-opt").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      state.payMethod = btn.dataset.pay;
    });
  });

  // 开通按钮
  $$(".plan-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.closest(".plan-card").dataset.plan;
      const planNames = { news: "资讯高阶包", system: "系统高阶包" };
      closePayModal();
      showToast(`✓ 已提交开通申请：${planNames[plan]}，请完成支付`);
    });
  });
}

/* ---------- 导航绑定 ---------- */
function initNavigation() {
  // data-nav 属性统一绑定
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav]");
    if (btn) {
      const target = btn.dataset.nav;
      navigateTo(target);
    }
  });

  // 底部快捷栏
  dom.chipScroller.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const action = chip.dataset.action;
    if (action === "refresh") {
      refreshNews();
    } else if (action === "prefs") {
      navigateTo("prefs");
    } else if (chip.dataset.chip !== undefined) {
      const text = chip.textContent.trim();
      dom.voiceCmd.textContent = text;
      showToast(`正在搜索：${text}`);
    }
  });

  // 偏好设置：确认 / 取消
  $("confirmPrefs").addEventListener("click", confirmPrefs);
  $("cancelPrefs").addEventListener("click", cancelPrefs);
  $("closePrefs").addEventListener("click", () => {
    cancelPrefs();
  });

  // 关闭主对话框（示意）
  $("closeAssistant").addEventListener("click", () => {
    showToast("助手已最小化");
  });

  // 高阶订阅：立即开通
  $("openPayBtn").addEventListener("click", openPayModal);
  $("closePro").addEventListener("click", () => navigateTo("prefs"));
}

/* ---------- 换一批 ---------- */
const EXTRA_NEWS = [
  {
    id: 6,
    title: "中国人民银行下调LPR利率至3.45%",
    sub: "此次下调是今年第二次，旨在降低实体经济融资成本",
    tags: ["财经"],
    duration: "3分钟",
    cat: "finance",
    ico: "¥",
    color: ["#1c3820", "#102215"],
  },
  {
    id: 7,
    title: "国产大模型「天工4.0」正式发布",
    sub: "长文本理解突破200万token，多模态推理能力媲美GPT-5",
    tags: ["科技", "国内"],
    duration: "5分钟",
    cat: "tech",
    ico: "◎",
    color: ["#2a1a4c", "#1a0e30"],
  },
  {
    id: 8,
    title: "全国多地发布高温黄色预警",
    sub: "华北、黄淮等地最高气温可达40℃，注意做好防暑降温",
    tags: ["健康", "国内"],
    duration: "2分钟",
    cat: "health",
    ico: "♡",
    color: ["#3a1a1a", "#281010"],
  },
  {
    id: 9,
    title: "SpaceX星舰第7次试飞成功",
    sub: "助推器首次实现整流罩海上回收，计划年内执行首次商业任务",
    tags: ["科技", "国际"],
    duration: "4分钟",
    cat: "tech",
    ico: "◎",
    color: ["#1a2040", "#0e1428"],
  },
];
let newsToggle = false;
function refreshNews() {
  newsToggle = !newsToggle;
  state.newsData = newsToggle ? [...EXTRA_NEWS] : [...NEWS_DATA];
  state.playingId = newsToggle ? 6 : 1;
  renderNews();
  showToast("已为你刷新一批资讯");
}

/* ---------- Toast ---------- */
let toastTimer = null;
function showToast(msg) {
  const t = dom.toast;
  t.textContent = msg;
  t.removeAttribute("hidden");
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.setAttribute("hidden", ""), 300);
  }, 2200);
}

/* ---------- 状态栏时钟 ---------- */
function startClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    dom.sbTime.textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 5000);
}

/* ---------- 视口：车机画布等比适配 ---------- */
const CAR_STAGE_W = 1260;
const CAR_STAGE_H = 600;

function fitCarStage() {
  const s = Math.min(
    window.innerWidth / CAR_STAGE_W,
    window.innerHeight / CAR_STAGE_H,
    1
  );
  document.documentElement.style.setProperty("--car-scale", String(s));
}

/* ---------- 初始化 ---------- */
function init() {
  fitCarStage();
  window.addEventListener("resize", fitCarStage);
  startClock();
  renderNews();
  initPrefGrid();
  initProInput();
  initPayModal();
  initNavigation();
}

document.addEventListener("DOMContentLoaded", init);
