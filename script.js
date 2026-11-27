/*
  The Last Message — script.js v20261127b
  Vanilla JS, no dependencies.
*/
(function () {
  'use strict';

  var doc = document, root = doc.documentElement;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= LOADING SCREEN ================= */
  (function () {
    var loader = $('#page-loader'), bar = $('#loaderBar'), txt = $('#loaderText');
    if (!loader) { doc.body.classList.add('ready'); return; }

    var msgs = ['Loading...', 'Preparing history...', 'Almost ready...'], mi = 0, done = false, pct = 0;
    var ticker = setInterval(function () {
      mi = (mi + 1) % msgs.length;
      if (txt) txt.textContent = msgs[mi];
    }, 900);

    function setBar(p) {
      pct = Math.max(pct, p);
      if (bar) bar.style.transform = 'scaleX(' + (pct / 100) + ')';
    }
    function hide() {
      if (done) return;
      done = true;
      clearInterval(ticker);
      setBar(100);
      setTimeout(function () {
        loader.classList.add('hidden');
        doc.body.classList.add('ready');
        setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 650);
      }, 280);
    }

    setBar(35);
    var logo = $('.loader-logo');
    function logoReady() { setBar(85); setTimeout(hide, 120); }
    if (logo && !logo.complete) {
      logo.addEventListener('load', logoReady);
      logo.addEventListener('error', logoReady);
    } else {
      logoReady();
    }
    setTimeout(hide, 2500); // failsafe if the image host is slow
  })();

  /* ================= NAVBAR, MENU, CTA DROPDOWN ================= */
  var navbar = $('#navbar'), navToggle = $('#navToggle'), menu = $('#menu');
  var ctaBtn = $('#ctaBtn'), ctaWrap = $('#navCta');
  var menuMQ = window.matchMedia('(min-width: 1021px)');

  function setCta(open) {
    if (!ctaBtn) return;
    ctaBtn.setAttribute('aria-expanded', String(open));
  }
  function setMenu(open) {
    if (!menu || !navToggle) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-locked', open);
    if (open) setCta(false);
  }

  if (navToggle) navToggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  if (ctaBtn) {
    ctaBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var willOpen = ctaBtn.getAttribute('aria-expanded') !== 'true';
      if (willOpen) setMenu(false);
      setCta(willOpen);
    });
  }
  doc.addEventListener('click', function (e) {
    if (ctaWrap && !ctaWrap.contains(e.target)) setCta(false);
  });
  if (ctaWrap) ctaWrap.addEventListener('focusout', function (e) {
    if (!ctaWrap.contains(e.relatedTarget)) setCta(false);
  });
  var onMQ = function (e) { if (e.matches) setMenu(false); };
  if (menuMQ.addEventListener) menuMQ.addEventListener('change', onMQ);
  else if (menuMQ.addListener) menuMQ.addListener(onMQ);

  // Anchor links close the menu; the browser handles smooth scroll (CSS)
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* ================= HERO CAROUSEL ================= */
  (function () {
    var hero = $('#home');
    if (!hero) return;
    var slides = $$('.hero__slide', hero), dots = $$('.hero__dot', hero);
    var prev = $('.hero__prev', hero), next = $('.hero__next', hero);
    var n = slides.length, cur = 0, timer = null, hold = false, visible = true, DELAY = 7500;

    function preload(slide) {
      var bg = $('.hero__bg', slide), url = bg && bg.getAttribute('data-bg');
      if (!url) return;
      var im = new Image();
      im.onload = function () { bg.style.backgroundImage = "url('" + url + "')"; bg.removeAttribute('data-bg'); };
      im.src = url;
    }
    function go(i) {
      i = (i + n) % n;
      if (i === cur) return;
      preload(slides[i]);
      slides[cur].classList.remove('is-active');
      slides[cur].setAttribute('aria-hidden', 'true');
      dots[cur].classList.remove('is-active');
      dots[cur].setAttribute('aria-selected', 'false');
      cur = i;
      slides[cur].classList.add('is-active');
      slides[cur].setAttribute('aria-hidden', 'false');
      dots[cur].classList.add('is-active');
      dots[cur].setAttribute('aria-selected', 'true');
      preload(slides[(cur + 1) % n]);
    }
    function stop() { clearTimeout(timer); timer = null; }
    function play() {
      stop();
      if (reduceMotion || hold || !visible || doc.hidden || n < 2) return;
      timer = setTimeout(function () { go(cur + 1); play(); }, DELAY);
    }
    function manual(i) { go(i); play(); }

    if (prev) prev.addEventListener('click', function () { manual(cur - 1); });
    if (next) next.addEventListener('click', function () { manual(cur + 1); });
    dots.forEach(function (d, k) { d.addEventListener('click', function () { manual(k); }); });

    hero.addEventListener('mouseenter', function () { hold = true; stop(); });
    hero.addEventListener('mouseleave', function () { hold = false; play(); });
    hero.addEventListener('focusin', function () { hold = true; stop(); });
    hero.addEventListener('focusout', function () { hold = false; play(); });
    doc.addEventListener('visibilitychange', play);

    // Swipe
    var sx = 0, sy = 0;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) manual(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; play(); }, { threshold: 0.15 }).observe(hero);
    }

    window.addEventListener('load', function () { setTimeout(function () { slides.forEach(preload); }, 800); });
    preload(slides[1] || slides[0]);
    play();
  })();

  /* ================= CARD CAROUSELS + PAGER ================= */
  $$('.carousel').forEach(function (c) {
    var track = $('.carousel__track', c);
    var prev = $('.pager__prev', c), next = $('.pager__next', c), count = $('.pager__count', c);
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);

    function step() {
      return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth;
    }
    function update() {
      var s = step() || 1, max = track.scrollWidth - track.clientWidth;
      var gap = s - cards[0].offsetWidth;
      var per = Math.max(1, Math.round((track.clientWidth + gap) / s));
      var total = Math.max(1, cards.length - per + 1);
      var idx = Math.min(total - 1, Math.round(track.scrollLeft / s));
      if (track.scrollLeft >= max - 2) idx = total - 1;
      if (count) count.textContent = (idx + 1) + ' of ' + total;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('load', update);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { track.scrollBy({ left: step(), behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -step(), behavior: 'smooth' }); e.preventDefault(); }
    });
    update();

    // Mouse drag-to-scroll (touch uses native scrolling)
    var down = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || e.target.closest('a, button')) return;
      down = true; moved = 0; startX = e.pageX; startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      moved = Math.abs(e.pageX - startX);
      track.scrollLeft = startLeft - (e.pageX - startX);
    }, { passive: true });
    window.addEventListener('mouseup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
    });
    track.addEventListener('click', function (e) {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
      moved = 0;
    }, true);
  });

  /* ================= YOUTUBE FACADE ================= */
  $$('.yt').forEach(function (box) {
    function load() {
      var id = box.getAttribute('data-yt');
      if (!id || box.querySelector('iframe')) return;
      var f = doc.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = box.getAttribute('data-title') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.setAttribute('allowfullscreen', '');
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.innerHTML = '';
      box.style.cursor = 'default';
      box.appendChild(f);
    }
    box.addEventListener('click', load);
  });

  /* ================= ACCORDIONS (FAQ + team) ================= */
  function accordion(group) {
    var items = $$('.acc', group);
    items.forEach(function (item) {
      var head = $('.acc__head', item);
      if (!head) return;
      head.addEventListener('click', function () {
        var was = item.classList.contains('active');
        items.forEach(function (x) {
          x.classList.remove('active');
          var h = $('.acc__head', x);
          if (h) h.setAttribute('aria-expanded', 'false');
        });
        if (!was) { item.classList.add('active'); head.setAttribute('aria-expanded', 'true'); }
      });
    });
  }
  $$('.faq, .teamcats').forEach(accordion);

  /* ================= FADE IN ON SCROLL ================= */
  (function () {
    var els = $$('.fade-in');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
    els.forEach(function (el) { obs.observe(el); });
  })();

  /* ================= SCROLL ENGINE ================= */
  (function () {
    var progress = $('#scrollProgressBar');
    var links = $$('.nav-links a[href^="#"]');
    var secs = links.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });
    var tops = [], ticking = false, lastScrolled = null, lastActive = -1;

    function measure() {
      tops = secs.map(function (s) { return s ? s.getBoundingClientRect().top + window.pageYOffset : 0; });
    }
    function frame() {
      ticking = false;
      var y = window.pageYOffset, vh = window.innerHeight;
      var scrolled = y > 10;
      if (navbar && scrolled !== lastScrolled) { navbar.classList.toggle('scrolled', scrolled); lastScrolled = scrolled; }
      if (progress) {
        var max = (root.scrollHeight - root.clientHeight) || 1;
        progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / max)) + ')';
      }
      var probe = y + vh * 0.35, cur = 0;
      for (var i = 0; i < tops.length; i++) { if (secs[i] && tops[i] <= probe) cur = i; }
      if (cur !== lastActive) {
        links.forEach(function (a, k) { a.classList.toggle('active', k === cur); });
        lastActive = cur;
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    function refresh() { measure(); onScroll(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('load', function () { refresh(); setTimeout(refresh, 600); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh);
    refresh();
  })();

  /* ================= CODEX OVERLAY ================= */
  var codex = $('#codexOverlay'), lastFocus = null;
  function openCodex() {
    if (!codex) return;
    lastFocus = doc.activeElement;
    setMenu(false);
    codex.classList.add('open');
    codex.setAttribute('aria-hidden', 'false');
    codex.scrollTop = 0;
    root.classList.add('is-locked');
    var close = $('.overlay__close', codex);
    if (close) setTimeout(function () { close.focus({ preventScroll: true }); }, 50);
  }
  function closeCodex() {
    if (!codex || !codex.classList.contains('open')) return;
    codex.classList.remove('open');
    codex.setAttribute('aria-hidden', 'true');
    root.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  $$('[data-open-codex]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); openCodex(); });
  });
  $$('[data-close-codex]').forEach(function (b) { b.addEventListener('click', closeCodex); });
  if (codex) codex.addEventListener('click', function (e) { if (e.target === codex) closeCodex(); });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeCodex(); setMenu(false); setCta(false);
  });
})();
