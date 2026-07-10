(function () {
  'use strict';

  // ── PC방 토글 이미지 상태 (백엔드 연동용) ──
  function setPcRoomToggleState(isPcRoom) {
    var toggleBtn = document.getElementById('pcRoomToggle');
    if (!toggleBtn) { return; }
    var toggleImg = toggleBtn.querySelector('.toggle-btn__img');
    if (!toggleImg) { return; }
    var isOn = Boolean(isPcRoom);
    toggleBtn.dataset.state = isOn ? 'on' : 'off';
    toggleImg.src = isOn ? 'assets/off=on.png' : 'assets/off=off.png';
    toggleImg.alt = isOn ? 'PC방 모드 ON' : 'PC방 모드 OFF';
  }
  // 기본값 OFF (백엔드에서 접속 상태 확인 후 setPcRoomToggleState 호출)
  setPcRoomToggleState(false);

  // ── 공유하기: 설정 / 토스트 / 모달 / SNS 핸들러 ──
  var SHARE_CONFIG = {
    title: '토치라이트:인피니트x피카 플레이 이벤트',
    description: '토치라이트:인피니트 피카 플레이 미션이벤트 참여하고 플레이 시간 보상을 획득하세요',
    kakaoKey: 'd1c0c39f4dbac0062bf36527a3021357',                                                       // Kakao Developers JavaScript 키
    ogImage: 'https://ics.mediaweb.co.kr/_event/20260717_torchlight/assets/Thumbnail_1200x630.jpg.jpg' // 공유 썸네일 절대 URL (카카오 피드 권장 1200x630)
  };

  var copyToast = document.getElementById('copyToast');
  var copyToastTimer = null;
  var DEFAULT_TOAST_MSG = '클립보드에 복사되었습니다.';
  function showCopyToast(msg) {
    if (!copyToast) { return; }
    copyToast.textContent = msg || DEFAULT_TOAST_MSG;
    copyToast.classList.add('is-visible');
    if (copyToastTimer) { clearTimeout(copyToastTimer); }
    copyToastTimer = setTimeout(function () {
      copyToast.classList.remove('is-visible');
    }, 2200);
  }
  function fallbackCopyText(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    var copied = false;
    try {
      copied = document.execCommand('copy');
    } catch (e) { }
    document.body.removeChild(textarea);
    return copied;
  }
  function copyUrlWithToast(url, toastMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(function () {
        showCopyToast(toastMsg);
      }).catch(function () {
        if (fallbackCopyText(url)) { showCopyToast(toastMsg); }
      });
    } else if (fallbackCopyText(url)) {
      showCopyToast(toastMsg);
    }
  }

  // Kakao SDK 초기화
  (function initKakao() {
    if (!window.Kakao || !SHARE_CONFIG.kakaoKey) { return; }
    if (Kakao.isInitialized && Kakao.isInitialized()) { return; }
    try { Kakao.init(SHARE_CONFIG.kakaoKey); } catch (e) { }
  })();

  // 공유 모달 열기/닫기
  var shareModal = document.getElementById('shareModal');
  var shareModalClose = document.getElementById('shareModalClose');
  var lastShareTrigger = null;
  function openShareModal(trigger) {
    if (!shareModal) { return; }
    lastShareTrigger = trigger || null;
    shareModal.classList.add('is-open');
    shareModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (shareModalClose) { shareModalClose.focus(); }
  }
  function closeShareModal() {
    if (!shareModal) { return; }
    shareModal.classList.remove('is-open');
    shareModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastShareTrigger && lastShareTrigger.focus) { lastShareTrigger.focus(); }
  }
  if (shareModal) {
    shareModal.addEventListener('click', function (e) {
      if (e.target === shareModal) { closeShareModal(); }
    });
  }
  if (shareModalClose) {
    shareModalClose.addEventListener('click', closeShareModal);
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && shareModal && shareModal.classList.contains('is-open')) {
      closeShareModal();
    }
  });

  // SNS별 공유 동작
  function openPopup(url) {
    var w = 600, h = 600;
    var left = (window.screen.width - w) / 2;
    var top = (window.screen.height - h) / 2;
    window.open(url, '_blank', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top + ',noopener');
  }
  function shareFacebook() {
    var u = encodeURIComponent(window.location.href);
    openPopup('https://www.facebook.com/sharer/sharer.php?u=' + u);
  }
  function shareTwitter() {
    var u = encodeURIComponent(window.location.href);
    var t = encodeURIComponent(SHARE_CONFIG.title);
    openPopup('https://twitter.com/intent/tweet?url=' + u + '&text=' + t);
  }
  function shareNaver() {
    var u = encodeURIComponent(window.location.href);
    var t = encodeURIComponent(SHARE_CONFIG.title);
    openPopup('https://share.naver.com/web/shareView?url=' + u + '&title=' + t);
  }
  function shareKakao() {
    if (!window.Kakao || !Kakao.Share) { return; }
    if (!Kakao.isInitialized || !Kakao.isInitialized()) { return; }
    try {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: SHARE_CONFIG.title,
          description: SHARE_CONFIG.description,
          imageUrl: SHARE_CONFIG.ogImage,
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href
          }
        },
        buttons: [{
          title: '자세히 보기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href
          }
        }]
      });
    } catch (e) { }
  }
  function shareInstagram() {
    // 인스타그램은 웹 URL 공유 API를 제공하지 않으므로 URL 복사 + 안내
    copyUrlWithToast(window.location.href, 'URL이 복사되었습니다. 인스타그램에 붙여넣어 주세요.');
  }
  function shareCopy() {
    copyUrlWithToast(window.location.href, '클립보드에 복사되었습니다.');
  }
  var SHARE_HANDLERS = {
    kakao: shareKakao,
    facebook: shareFacebook,
    twitter: shareTwitter,
    naver: shareNaver,
    instagram: shareInstagram,
    copy: shareCopy
  };
  if (shareModal) {
    shareModal.addEventListener('click', function (e) {
      var target = e.target.closest ? e.target.closest('[data-share]') : null;
      if (!target) { return; }
      var type = target.getAttribute('data-share');
      var handler = SHARE_HANDLERS[type];
      if (typeof handler === 'function') {
        handler();
        // 카카오톡은 자체 팝업이 뜨므로 모달은 닫고, 나머지는 약간의 시각적 피드백 후 닫기
        closeShareModal();
      }
    });
  }

  var btnShare = document.getElementById('btnShare');
  if (btnShare) {
    btnShare.addEventListener('click', function () { openShareModal(btnShare); });
  }
  var btnShareFloating = document.getElementById('btnShareFloating');
  if (btnShareFloating) {
    btnShareFloating.addEventListener('click', function () { openShareModal(btnShareFloating); });
  }
  var btnScrollTop = document.getElementById('btnScrollTop');
  if (btnScrollTop) {
    btnScrollTop.addEventListener('click', function (e) {
      e.preventDefault();
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var behavior = reduce ? 'auto' : 'smooth';
      // sticky 헤더(#top)에 scrollIntoView 하면 이미 보이는 요소로 판단해 스크롤이 안 올라가는 경우가 있음
      try {
        window.scrollTo({ top: 0, left: 0, behavior: behavior });
      } catch (err) {
        (document.scrollingElement || document.documentElement).scrollTop = 0;
        document.body.scrollTop = 0;
      }
    });
  }
})();

/* ===== 물방울 효과 (키비쥬얼 / 이벤트 참여방법 배경) — 완전 독립 실행 ===== */
(function () {
  'use strict';
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var style = document.createElement('style');
  style.textContent =
    '#bubbles-kv,#bubbles-ev2{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;overflow:hidden;}' +
    '#bubbles-kv{z-index:1;}' +
    '#bubbles-ev2{z-index:0;}' +
    '@keyframes bubbleRiseTop{0%{top:103%;opacity:0;}7%{opacity:.85;}82%{opacity:.7;}100%{top:-6%;opacity:0;}}' +
    '@keyframes bubbleSway{from{transform:translateX(calc(var(--amp) * -1));}to{transform:translateX(var(--amp));}}';
  document.head.appendChild(style);

  function makeBubble(side) {
    var big = Math.random() < 0.2;
    var size = big ? rnd(7, 13) : rnd(2, 5.5);
    var edge = Math.pow(Math.random(), 1.8);
    var left = side === 'L' ? 0.5 + edge * 24 : 99.5 - edge * 24;
    var riseDur = big ? rnd(4.5, 8) : rnd(3, 6.5);
    var swayDur = rnd(0.8, 1.7);
    var swayAmp = rnd(2.5, 7);

    var outer = document.createElement('div');
    outer.style.cssText = 'position:absolute;top:102%;left:' + left + '%;'
      + 'animation:bubbleRiseTop ' + riseDur + 's linear ' + (-rnd(0, riseDur)) + 's infinite;will-change:top,opacity;';

    var inner = document.createElement('div');
    inner.style.setProperty('--amp', swayAmp + 'px');
    inner.style.animation = 'bubbleSway ' + swayDur + 's ease-in-out ' + (-rnd(0, swayDur)) + 's infinite alternate';

    var b = document.createElement('div');
    b.style.cssText = 'width:' + size + 'px;height:' + size + 'px;border-radius:50%;'
      + 'background:radial-gradient(circle at 35% 30%, rgba(255,255,255,0.98), rgba(255,255,255,0.28) 34%, rgba(190,225,240,0.06) 62%, transparent 70%);'
      + 'border:1px solid rgba(255,255,255,0.35);'
      + 'box-shadow:inset -1px -1px 2px rgba(120,180,210,0.35), 0 0 3px rgba(200,235,250,0.45);';

    inner.appendChild(b);
    outer.appendChild(inner);
    return outer;
  }
  function fillBubbles(id, n) {
    var c = document.getElementById(id);
    if (!c) return;
    for (var i = 0; i < n; i++) c.appendChild(makeBubble('L'));
    for (var j = 0; j < n; j++) c.appendChild(makeBubble('R'));
  }
  fillBubbles('bubbles-kv', 16);
  fillBubbles('bubbles-ev2', 14);
})();

/* ===== 반응형 이벤트 페이지 — 인터랙션 (vanilla JS) ===== */
(function () {
  'use strict';
  var rnd = function (a, b) { return a + Math.random() * (b - a); };

  /* ---------- 쿠폰/마일리지 섹션 물고기 (크기·방향·속도 랜덤, 계속 순환) ---------- */
  function makeFish() {
    var big = Math.random() < 5.35;
    var w = big ? rnd(90, 150) : rnd(40, 178);
    var rightward = Math.random() < 5;
    var dur = rnd(13, 23);
    var top = rnd(8, 88);
    var op = rnd(0.28, 0.55);

    var fish = document.createElement('div');
    fish.className = 'sea-fish';
    fish.style.cssText = 'top:' + top + '%;'
      + 'width:' + w + 'px;height:' + (w * 1.36) + 'px;'
      + 'opacity:' + op + ';'
      + 'filter:blur(' + (big ? 2.4 : 1.4) + 'px);'
      + 'transform:scaleX(' + (rightward ? 1 : -1) + ');'
      + 'animation:' + (rightward ? 'fishDriftR' : 'fishDriftL') + ' ' + dur + 's linear ' + (-rnd(0, dur)) + 's infinite;';
    return fish;
  }
  function fillFish(id, n) {
    var c = document.getElementById(id);
    if (!c) return;
    for (var i = 0; i < n; i++) c.appendChild(makeFish());
  }
  fillFish('coupon-section', 4);
  fillFish('mileage-section', 4);

  /* ---------- 이벤트 참여방법 탭 + 스텝 ---------- */
  var STEPS = {
    pc: [
      { n: '01', title: '피카플레이 회원으로 <br class="forMo"> 로그인', img: 'assets/pc-1.webp', cap1: '피카 PC방 좌석에서', cap2: '피카플레이 회원으로 로그인' },
      { n: '02', title: '토치라이트:인피니트 <br class="forMo"> 플레이', img: 'assets/pc-2.webp', cap1: "'토치라이트:인피니트' 플레이하고", cap2: '마일리지 보상 받기' },
      { n: '03', title: '마일리지 지급 보상 확인', img: 'assets/pc-3.webp', cap1: '마일리지를 사용하여', cap2: '요금제, 먹거리 구매 OR', cap3: '모바일 문화상품권 교환' }
    ],
    personal: [
      { n: '01', title: '피카플레이 홈페이지 <br class="forMo"> 로그인', img: 'assets/perso1.webp', cap1: '개인 PC에서 크래프트박스 설치하고', cap2: '피카플레이 회원으로 로그인' },
      { n: '02', title: '토치라이트:인피니트 <br class="forMo"> 플레이', img: 'assets/perso2.webp', cap1: '라이브러리에서', cap2: "'토치라이트:인피니트' 다운로드 후,", cap3: '매일 1시간/누적 5시간 이상 플레이' },
      { n: '03', title: '마일리지 지급 보상 확인', img: 'assets/pc-3.webp', cap1: '피카플레이 APP 또는', cap2: '크래프트박스 마이페이지에서', cap3: '마일리지/쿠폰 확인' }
    ]
  };

  /* 1080px 이하(스텝 세로 배치)에서만 보이는 스텝 사이 간단한 구분선.
     마지막 스텝 뒤에는 필요 없어서 03번에는 붙이지 않음 */
  function stepDividerHTML() {
    return '' +
      '<div class="step-divider">' +
        '<div class="step-divider-line step-divider-line-left"></div>' +
        '<div class="step-divider-ornament">' +
          '<span class="dv-chevron dv-chevron-l"></span>' +
          '<span class="dv-center"><span class="dv-center-dot"></span></span>' +
          '<span class="dv-chevron dv-chevron-r"></span>' +
        '</div>' +
        '<div class="step-divider-line step-divider-line-right"></div>' +
      '</div>';
  }

  function stepHTML(s) {
    var cap3 = s.cap3 ? '<br><span class="step-caption-strong">' + s.cap3 + '</span>' : '';
    return '' +
      '<div class="step' + (s.n === '02' ? ' step-featured' : '') + '">' +
        '<div class="step-icon">' +
          '<span class="step-icon-num">' + s.n + '</span>' +
        '</div>' +
        '<div class="step-title">' + s.title + '</div>' +
        '<div class="step-image-wrap">' +
          '<img class="step-image" src="' + s.img + '" alt="">' +
        '</div>' +
        '<div class="step-caption">' +
          s.cap1 + '<br><span class="step-caption-strong">' + s.cap2 + '</span>' + cap3 +
        '</div>' +
      '</div>' +
      (s.n !== '03' ? stepDividerHTML() : '');
  }

  

  function tabStyle(active) {
    return 'padding:11px 30px;border-radius:999px;border:none;'
      + "font-family:'Noto Sans KR',sans-serif;font-weight:700;font-size:16px;cursor:pointer;transition:all .2s ease;"
      + (active
        ? 'background:linear-gradient(180deg,#4fbcd6,#1f6f8a);color:#eafcff;box-shadow:0 0 18px rgba(90,210,235,0.45);'
        : 'background:transparent;color:#7fa2b2;box-shadow:none;');
  }

  var stepsWrap = document.getElementById('steps');
  var btnPc = document.getElementById('tab-pc');
  var btnPersonal = document.getElementById('tab-personal');

  function setTab(tab) {
    if (stepsWrap) stepsWrap.innerHTML = STEPS[tab].map(stepHTML).join('');
    if (btnPc) btnPc.setAttribute('style', tabStyle(tab === 'pc'));
    if (btnPersonal) btnPersonal.setAttribute('style', tabStyle(tab === 'personal'));
  }
  if (btnPc) btnPc.addEventListener('click', function () { setTab('pc'); });
  if (btnPersonal) btnPersonal.addEventListener('click', function () { setTab('personal'); });
  setTab('pc');

  /* ---------- 스크롤 페이드인 ---------- */
  var fadeEls = [].slice.call(document.querySelectorAll('[data-fade]'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('in'); });
  }
  
})()
;



