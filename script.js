/*
  The Last Message — script.js v20261127
  Vanilla JS, no dependencies. One throttled scroll handler drives the
  navbar, progress bar, hero fade, side HUD and background slideshow.
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
    // Wait only for the hero image (the first thing people see), not for every asset on the page.
    var hero = $('.hero-logo-img');
    function heroReady() { setBar(85); setTimeout(hide, 120); }
    if (hero && !hero.complete) {
      hero.addEventListener('load', heroReady);
      hero.addEventListener('error', heroReady);
    } else {
      heroReady();
    }
    setTimeout(hide, 2500); // failsafe if the image host is slow
  })();

  /* ================= NAVBAR ================= */
  var navbar = $('#navbar'), navToggle = $('#navToggle'), navLinks = $('#navLinks');
  var desktopMQ = window.matchMedia('(min-width: 961px)');

  function setNav(open) {
    if (!navLinks || !navToggle) return;
    navLinks.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    root.classList.toggle('is-locked', open);
  }
  function closeNav() { setNav(false); }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () { setNav(!navLinks.classList.contains('open')); });
    doc.addEventListener('click', function (e) {
      if (navbar && !navbar.contains(e.target) && navLinks.classList.contains('open')) closeNav();
    });
    var onMQ = function (e) { if (e.matches) closeNav(); };
    if (desktopMQ.addEventListener) desktopMQ.addEventListener('change', onMQ);
    else if (desktopMQ.addListener) desktopMQ.addListener(onMQ);
  }
  // Anchor links close the mobile menu; the browser handles the smooth scroll (CSS).
  $$('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute('onclick')) return; // overlay openers
    a.addEventListener('click', closeNav);
  });

  /* ================= ACCORDIONS (FAQ + team) ================= */
  function accordion(selector) {
    var items = $$(selector);
    items.forEach(function (item) {
      var head = $('.faq-question, .team-cat-header', item);
      if (!head) return;
      head.addEventListener('click', function () {
        var was = item.classList.contains('active');
        items.forEach(function (x) {
          x.classList.remove('active');
          var h = $('.faq-question, .team-cat-header', x);
          if (h) h.setAttribute('aria-expanded', 'false');
        });
        if (!was) {
          item.classList.add('active');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }
  accordion('.faq-item');
  accordion('.team-cat');

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

  /* ================= BACKGROUND SLIDESHOW ================= */
  var slideshow = (function () {
    var slides = $$('.bg-slide');
    if (!slides.length) return { index: function () { return 0; }, show: function () {} };
    var sectionIds = ['home', 'trailer', 'gameplay', 'story', 'faq', 'community', 'team'];
    var state = slides.map(function () { return 0; }); // 0 idle, 1 loading, 2 ready
    state[0] = 2;
    var current = 0, wanted = 0;

    function load(i, cb) {
      if (state[i] === 2) { if (cb) cb(); return; }
      if (state[i] === 1) return;
      var bg = slides[i].getAttribute('data-bg');
      if (!bg) { state[i] = 2; if (cb) cb(); return; }
      state[i] = 1;
      var img = new Image();
      img.onload = function () {
        slides[i].style.backgroundImage = "url('" + bg + "')";
        state[i] = 2;
        if (cb) cb();
      };
      img.onerror = function () { state[i] = 0; };
      img.src = bg;
    }
    function activate(i) {
      if (wanted !== i) return; // user scrolled on while this was loading
      current = i;
      slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    }
    function show(i) {
      if (i === wanted && i === current) return;
      wanted = i;
      load(i, function () { activate(i); });
      if (i + 1 < slides.length) setTimeout(function () { load(i + 1); }, 1200); // warm the next slide
    }
    function indexFor(trigger, offsets) {
      var idx = 0;
      offsets.forEach(function (top, i) {
        if (trigger >= top) idx = Math.min(Math.floor(i * slides.length / sectionIds.length), slides.length - 1);
      });
      return idx;
    }
    return { ids: sectionIds, show: show, indexFor: indexFor, slides: slides };
  })();

  /* ================= SCROLL ENGINE ================= */
  (function () {
    var progress = $('#scrollProgressBar');
    var heroContent = $('.hero-content');
    var indicator = $('.scroll-indicator');
    var hudDots = $$('nav.ac-hud a');
    var hudSecs = hudDots.map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); });

    var hudTops = [], bgTops = [], ticking = false, lastScrolled = null, lastHud = -1;

    function top(el) { return el ? el.getBoundingClientRect().top + window.pageYOffset : 0; }
    function measure() {
      hudTops = hudSecs.map(top);
      bgTops = (slideshow.ids || []).map(function (id) { return top(doc.getElementById(id)); });
    }

    function frame() {
      ticking = false;
      var y = window.pageYOffset, vh = window.innerHeight;

      var scrolled = y > 50;
      if (navbar && scrolled !== lastScrolled) { navbar.classList.toggle('scrolled', scrolled); lastScrolled = scrolled; }

      if (progress) {
        var max = (root.scrollHeight - root.clientHeight) || 1;
        progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, y / max)) + ')';
      }
      if (heroContent && y < 900) heroContent.style.opacity = Math.max(0, 1 - y / 600);
      if (indicator) indicator.style.opacity = y > 100 ? '0' : '1';

      if (hudDots.length) {
        var hy = y + vh * 0.35, cur = 0;
        for (var i = 0; i < hudTops.length; i++) { if (hudSecs[i] && hudTops[i] <= hy) cur = i; }
        if (cur !== lastHud) {
          hudDots.forEach(function (d, k) { d.classList.toggle('active', k === cur); });
          lastHud = cur;
        }
      }
      if (bgTops.length && slideshow.indexFor) slideshow.show(slideshow.indexFor(y + vh * 0.3, bgTops));
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    function refresh() { measure(); onScroll(); }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('orientationchange', function () { setTimeout(refresh, 250); });
    window.addEventListener('load', function () { refresh(); setTimeout(refresh, 600); });
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(refresh);
    refresh();
  })();

  /* ================= OVERLAYS (Codex + Dev Logs) ================= */
  var lastFocus = null;
  function openOverlay(id) {
    var o = doc.getElementById(id);
    if (!o) return;
    lastFocus = doc.activeElement;
    o.classList.add('open');
    o.setAttribute('aria-hidden', 'false');
    o.scrollTop = 0;
    root.classList.add('is-locked');
    var close = $('.codex-close-btn', o);
    if (close) setTimeout(function () { close.focus({ preventScroll: true }); }, 50);
  }
  function closeOverlay(id) {
    var o = doc.getElementById(id);
    if (!o || !o.classList.contains('open')) return;
    o.classList.remove('open');
    o.setAttribute('aria-hidden', 'true');
    root.classList.remove('is-locked');
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  // Kept global: the HTML uses inline onclick handlers
  window.openCodex = function () { openOverlay('codexOverlay'); };
  window.closeCodex = function () { closeOverlay('codexOverlay'); };
  window.openDevlogs = function () { openOverlay('devlogsOverlay'); };
  window.closeDevlogs = function () { closeOverlay('devlogsOverlay'); };

  ['codexOverlay', 'devlogsOverlay'].forEach(function (id) {
    var o = doc.getElementById(id);
    if (o) o.addEventListener('click', function (e) { if (e.target === o) closeOverlay(id); });
  });
  doc.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeOverlay('codexOverlay'); closeOverlay('devlogsOverlay'); closeNav();
  });

  /* ================= ARCHIVE RAIL ================= */
  $$('.ac-rail-track').forEach(function (track) {
    var prev = $('.ac-rail-prev[data-target="' + track.id + '"]');
    var next = $('.ac-rail-next[data-target="' + track.id + '"]');

    function step() {
      var tiles = $$('.ac-tile', track);
      if (tiles.length > 1) return tiles[1].offsetLeft - tiles[0].offsetLeft;
      return track.clientWidth * 0.8;
    }
    function updateButtons() {
      var max = track.scrollWidth - track.clientWidth;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons, { passive: true });
    updateButtons();

    // Mouse drag-to-scroll (touch uses native scrolling)
    var down = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
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
    // Don't open a tile when the gesture was a drag
    track.addEventListener('click', function (e) {
      if (moved > 8) { e.preventDefault(); e.stopPropagation(); }
      moved = 0;
    }, true);
  });

  /* ================= GOLD DUST CURSOR (desktop only, very subtle) ================= */
  (function () {
    if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    var busy = false, count = 0, x = 0, y = 0;
    doc.addEventListener('mousemove', function (e) {
      if (window.innerWidth <= 960 || busy || count >= 8) return;
      busy = true; x = e.clientX; y = e.clientY;
      requestAnimationFrame(function () {
        busy = false;
        var d = doc.createElement('div');
        d.style.cssText = 'position:fixed;width:4px;height:4px;border-radius:50%;background:rgba(232,201,126,0.35);left:' + x + 'px;top:' + y + 'px;pointer-events:none;z-index:9999;transition:opacity .5s ease,transform .5s ease;';
        doc.body.appendChild(d); count++;
        requestAnimationFrame(function () { d.style.opacity = '0'; d.style.transform = 'scale(3)'; });
        setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); count--; }, 540);
      });
    }, { passive: true });
  })();
})();
