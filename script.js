/*  
The Last Message — script.js v20260619 
 */

// Preload critical images immediately 
(function () { 
['https://files.catbox.moe/1zb08m.jpg', 'https://files.catbox.moe/hzl17x.png'].forEach(function (src) { 
var img = new Image(); 
img.src = src; 
}); 
})();


// ---- Loading Screen ---- 
(function () { 
var loader    = document.getElementById('page-loader'); 
var loaderBar = document.getElementById('loaderBar'); 
var loaderTxt = document.getElementById('loaderText'); 
var dismissed = false; 
var messages  = ['Loading...', 'Preparing history...', 'Almost ready...']; 
var msgIdx    = 0;

var msgTimer = setInterval(function () {
    msgIdx = (msgIdx + 1) % messages.length;
    if (loaderTxt) loaderTxt.textContent = messages[msgIdx];
}, 900);

function animateBar(to, duration) {
    if (!loaderBar) return;
    var start = null;
    var from  = parseFloat(loaderBar.style.width) || 0;
    function step(ts) {
        if (!start) start = ts;
        var pct = Math.min((ts - start) / duration, 1);
        loaderBar.style.width = (from + (to - from) * pct) + '%';
        if (pct < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

animateBar(40, 400);

function hideLoader() {
    if (dismissed) return;
    dismissed = true;
    clearInterval(msgTimer);
    animateBar(100, 250);
    setTimeout(function () {
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(function () {
                if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
            }, 600);
        }
        document.body.classList.add('ready');
    }, 300);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        animateBar(80, 250);
        setTimeout(hideLoader, 180);
    });
} else {
    animateBar(80, 250);
    setTimeout(hideLoader, 180);
}

var heroImg = document.querySelector('.hero-logo-img');
if (heroImg) {
    if (heroImg.complete) { animateBar(70, 200); }
    else {
        heroImg.addEventListener('load',  function () { animateBar(70, 200); });
        heroImg.addEventListener('error', function () { animateBar(70, 200); });
    }
}

// Hard safety cap — the loader must NEVER block the page on slow external resources.
setTimeout(hideLoader, 2200);
})();


// ---- Fix 100vh on mobile browsers ---- 
(function () { 
function setVH() { 
document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px'); 
} 
setVH(); 
window.addEventListener('resize', setVH, { passive: true }); 
window.addEventListener('orientationchange', function () { setTimeout(setVH, 200); }); 
})();


// ---- Zoom detection (navbar blur fix) ---- 
(function () { 
var vv = window.visualViewport; 
if (!vv) return; 
var timer; 
vv.addEventListener('resize', function () { 
clearTimeout(timer); 
timer = setTimeout(function () { 
document.body.classList.toggle('zoom-extreme', vv.scale > 2.5 || vv.scale < 0.9); 
}, 80); 
}); 
})();


// ---- Navbar scroll style ---- 
var navbar = document.getElementById('navbar'); 
if (navbar) { 
window.addEventListener('scroll', function () { 
navbar.classList.toggle('scrolled', window.scrollY > 50); 
}, { passive: true }); 
}


// ---- Navbar mobile menu ---- 
var navToggle = document.getElementById('navToggle'); 
var navLinks  = document.getElementById('navLinks');

function closeNav() { 
if (!navLinks || !navToggle) return; 
navLinks.classList.remove('open'); 
navToggle.classList.remove('open'); 
navToggle.setAttribute('aria-expanded', 'false'); 
document.body.style.overflow = ''; 
}

if (navToggle && navLinks) { 
navToggle.addEventListener('click', function () { 
var isOpen = navLinks.classList.toggle('open'); 
navToggle.classList.toggle('open', isOpen); 
navToggle.setAttribute('aria-expanded', String(isOpen)); 
});

// Close nav when clicking outside
document.addEventListener('click', function (e) {
    if (navbar && !navbar.contains(e.target)) closeNav();
});

window.addEventListener('resize', function () {
    if (window.innerWidth > 768) closeNav();
}, { passive: true });
}


// ---- Navigation: close mobile nav on link click, let browser scroll ---- 
// CSS handles smooth scrolling (scroll-behavior:smooth + scroll-padding-top on html). 
// No e.preventDefault(), no custom JS scroll — browser does it natively and reliably. 
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) { 
if (anchor.getAttribute('onclick')) return; // skip overlay openers 
anchor.addEventListener('click', function () { 
closeNav(); // just close mobile menu if open 
}); 
});


// ---- FAQ accordion ---- 
document.querySelectorAll('.faq-item').forEach(function (item) { 
var question = item.querySelector('.faq-question'); 
if (!question) return; 
question.addEventListener('click', function () { 
var wasActive = item.classList.contains('active'); 
document.querySelectorAll('.faq-item').forEach(function (f) { f.classList.remove('active'); }); 
if (!wasActive) item.classList.add('active'); 
}); 
});


// ---- Team categories accordion ---- 
document.querySelectorAll('.team-cat').forEach(function (cat) { 
var header = cat.querySelector('.team-cat-header'); 
if (!header) return; 
header.addEventListener('click', function () { 
var wasActive = cat.classList.contains('active'); 
document.querySelectorAll('.team-cat').forEach(function (c) { c.classList.remove('active'); }); 
if (!wasActive) cat.classList.add('active'); 
}); 
});


// ---- Fade-in on scroll ---- 
(function () { 
if (!('IntersectionObserver' in window)) { 
document.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('visible'); }); 
return; 
} 
var observer = new IntersectionObserver(function (entries) { 
entries.forEach(function (entry) { 
if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } 
}); 
}, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' }); 
function register() { document.querySelectorAll('.fade-in, .reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(function (el) { observer.observe(el); }); } 
if ('requestIdleCallback' in window) requestIdleCallback(register); 
else setTimeout(register, 150); 
})();


// ---- Hero content fade on scroll ---- 
window.addEventListener('scroll', function () { 
var hero = document.querySelector('.hero-content'); 
if (hero) hero.style.opacity = Math.max(0, 1 - window.pageYOffset / 600); 
var ind = document.querySelector('.scroll-indicator'); 
if (ind) ind.style.opacity = window.scrollY > 100 ? '0' : '1'; 
}, { passive: true });


// ---- Gold dust cursor trail — desktop pointer only ---- 
(function () { 
if (!window.matchMedia('(pointer: fine)').matches) return; 
var pending  = false; 
var dotCount = 0; 
document.addEventListener('mousemove', function (e) { 
if (window.innerWidth <= 768 || pending || dotCount >= 10) return; 
pending = true; 
requestAnimationFrame(function () { 
pending = false; 
var dot = document.createElement('div'); 
dot.style.cssText = 'position:fixed;width:4px;height:4px;border-radius:50%;background:rgba(201,168,76,0.32);left:' + e.clientX + 'px;top:' + e.clientY + 'px;pointer-events:none;z-index:9999;transition:opacity 0.5s ease,transform 0.5s ease;will-change:opacity,transform;'; 
document.body.appendChild(dot); 
dotCount++; 
requestAnimationFrame(function () { dot.style.opacity = '0'; dot.style.transform = 'scale(3)'; }); 
setTimeout(function () { if (dot.parentNode) dot.parentNode.removeChild(dot); dotCount--; }, 520); 
}); 
}, { passive: true }); 
})();


// ---- Background slideshow ---- 
(function () { 
var slides   = Array.from(document.querySelectorAll('.bg-slide')); 
var loaded   = slides.map(function (_, i) { return i = 0; }); 
var sections = ['home', 'trailer', 'gameplay', 'story', 'timeline', 'faq', 'community', 'wishlist', 'team']; 
var offsets  = []; 
var current  = 0; 
var raf      = null;

function loadSlide(idx) {
    if (loaded[idx]) return;
    loaded[idx] = true;
    var bg = slides[idx].getAttribute('data-bg');
    if (!bg) return;
    var img = new Image();
    img.onload = function () { slides[idx].style.backgroundImage = "url('" + bg + "')"; };
    img.src = bg;
}

function preloadAll() { slides.forEach(function (_, i) { if (i > 0) loadSlide(i); }); }
if ('requestIdleCallback' in window) requestIdleCallback(preloadAll, { timeout: 2500 });
else setTimeout(preloadAll, 1000);

function buildOffsets() {
    offsets = sections
        .map(function (id) { return document.getElementById(id); })
        .filter(Boolean)
        .map(function (el) { return el.getBoundingClientRect().top + window.pageYOffset; });
}

function indexFor() {
    var trigger = window.scrollY + window.innerHeight * 0.3;
    var idx = 0;
    offsets.forEach(function (top, i) {
        if (trigger >= top) idx = Math.min(Math.floor(i * slides.length / sections.length), slides.length - 1);
    });
    return idx;
}

function update() {
    var next = indexFor();
    if (next === current) return;
    loadSlide(next);
    current = next;
    slides.forEach(function (s, i) { s.classList.toggle('active', i === next); });
}

slides[0].classList.add('active');
window.addEventListener('scroll', function () {
    if (raf) return;
    raf = requestAnimationFrame(function () { raf = null; update(); });
}, { passive: true });
window.addEventListener('resize', function () { buildOffsets(); update(); }, { passive: true });
window.addEventListener('load',   function () { buildOffsets(); update(); });
setTimeout(buildOffsets, 200);
})();


// ---- Codex overlay ---- 
function openCodex() { 
var o = document.getElementById('codexOverlay'); 
if (!o) return; 
o.classList.add('open'); 
o.scrollTop = 0; 
document.documentElement.style.overflow = 'hidden'; 
} 
function closeCodex() { 
var o = document.getElementById('codexOverlay'); 
if (!o) return; 
o.classList.remove('open'); 
document.documentElement.style.overflow = ''; 
} 
var codexOverlay = document.getElementById('codexOverlay'); 
if (codexOverlay) { 
codexOverlay.addEventListener('click', function (e) { if (e.target === this) closeCodex(); }); 
}


// ---- Devlogs overlay ---- 
function openDevlogs() { 
var o = document.getElementById('devlogsOverlay'); 
if (!o) return; 
o.classList.add('open'); 
o.scrollTop = 0; 
document.documentElement.style.overflow = 'hidden'; 
} 
function closeDevlogs() { 
var o = document.getElementById('devlogsOverlay'); 
if (!o) return; 
o.classList.remove('open'); 
document.documentElement.style.overflow = ''; 
} 
var devlogsOverlay = document.getElementById('devlogsOverlay'); 
if (devlogsOverlay) { 
devlogsOverlay.addEventListener('click', function (e) { if (e.target === this) closeDevlogs(); }); 
}

document.addEventListener('keydown', function (e) { 
if (e.key === 'Escape') { closeCodex(); closeDevlogs(); } 
});


// ---- Scroll progress bar ---- 
(function () { 
var bar     = document.getElementById('scrollProgressBar'); 
var ticking = false; 
if (!bar) return; 
function update() { 
var h   = document.documentElement; 
var pct = (window.pageYOffset / ((h.scrollHeight - h.clientHeight) || 1)) * 100; 
bar.style.width = Math.min(100, Math.max(0, pct)) + '%'; 
ticking = false; 
} 
window.addEventListener('scroll', function () { 
if (!ticking) { requestAnimationFrame(update); ticking = true; } 
}, { passive: true }); 
update(); 
})();


// ---- Archive rail — arrow buttons + mouse drag ---- 
(function () { 
document.querySelectorAll('.ac-rail-prev, .ac-rail-next').forEach(function (btn) { 
btn.addEventListener('click', function () { 
var track = document.getElementById(btn.dataset.target); 
if (!track) return; 
var first = track.querySelector('.ac-tile'); 
var step  = first ? first.getBoundingClientRect().width + 20 : track.clientWidth * 0.8; 
track.scrollBy({ left: btn.classList.contains('ac-rail-next') ? step : -step, behavior: 'smooth' }); 
}); 
});

document.querySelectorAll('.ac-rail-track').forEach(function (track) {
    var isDown = false, startX = 0, startLeft = 0, mouseMoved = 0;
    var MOUSE_THRESHOLD = 8;

    track.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        isDown = true; mouseMoved = 0;
        startX = e.pageX; startLeft = track.scrollLeft;
        track.classList.add('is-dragging');
        e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        var dx = e.pageX - startX;
        mouseMoved = Math.abs(dx);
        track.scrollLeft = startLeft - dx;
    }, { passive: true });
    window.addEventListener('mouseup', function () { isDown = false; track.classList.remove('is-dragging'); });
    track.addEventListener('click', function (e) {
        if (mouseMoved > MOUSE_THRESHOLD) { e.preventDefault(); e.stopPropagation(); }
        mouseMoved = 0;
    }, true);

    var TOUCH_THRESHOLD = 22, touchStartX = 0, touchMoved = 0;
    track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; touchMoved = 0; }, { passive: true });
    track.addEventListener('touchmove',  function (e) { touchMoved = Math.abs(e.touches[0].clientX - touchStartX); }, { passive: true });
    track.addEventListener('touchend',   function (e) {
        if (touchMoved > TOUCH_THRESHOLD) {
            var anchor = e.target.closest('a');
            if (anchor && !anchor.getAttribute('onclick')) e.preventDefault();
        }
        touchMoved = 0;
    }, { passive: false });
});
})();


// ---- HUD side nav — highlight active section ---- 
(function () { 
var dots = document.querySelectorAll('nav.ac-hud a'); 
if (!dots.length) return; 
var ids      = Array.prototype.map.call(dots, function (a) { return a.getAttribute('href').slice(1); }); 
var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);

function highlight() {
    var y = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
        if (sections[i] && sections[i].offsetTop <= y) current = sections[i];
    }
    dots.forEach(function (d) {
        d.classList.toggle('active', d.getAttribute('href') === '#' + (current && current.id));
    });
}

window.addEventListener('scroll', highlight, { passive: true });
window.addEventListener('resize', highlight, { passive: true });
highlight();
})();


// ---- Lazy-load background images ---- 
(function () { 
if (!('IntersectionObserver' in window)) return; 
var lazySlides = document.querySelectorAll('.bg-slide[data-bg]'); 
if (!lazySlides.length) return; 
var observer = new IntersectionObserver(function (entries) { 
entries.forEach(function (entry) { 
if (!entry.isIntersecting) return; 
var slide = entry.target; 
var bg    = slide.getAttribute('data-bg'); 
if (bg && !slide.style.backgroundImage) { 
var img = new Image(); 
img.onload = function () { slide.style.backgroundImage = "url('" + bg + "')"; }; 
img.src = bg; 
} 
observer.unobserve(slide); 
}); 
}, { rootMargin: '200px' }); 
lazySlides.forEach(function (slide) { observer.observe(slide); }); 
})();

/* ============================================================
   NEW — Steam Wishlist tracker
   Edit ONE number below (count) to update the bar, the % and the
   unlocked milestones automatically. That's all you need to change.
   ============================================================ */
var STEAM_WISHLIST = {
    count: 62,   // <<< CURRENT wishlist count — edit this number manually
    goal: 500,   // <<< target goal
    milestones: [
        { at: 100, title: 'Gameplay Reveal', desc: 'The first extended gameplay video unlocks for the community.', icon: '&#9654;' },
        { at: 250, title: 'Dev Q&A Stream',  desc: 'A live Q&amp;A session with the developers unlocks.', icon: '&#9670;' },
        { at: 500, title: 'Beta Access',     desc: 'Early access to the beta opens for supporters.', icon: '&#9733;' }
    ]
};

function fmtNum(n) { return (n | 0).toLocaleString('en-US'); }

function renderWishlist() {
    var count = STEAM_WISHLIST.count | 0;
    var goal  = STEAM_WISHLIST.goal  | 0;
    var pct   = goal > 0 ? Math.min(100, Math.round((count / goal) * 100)) : 0;

    var cEl = document.getElementById('wishlistCount');
    var gEl = document.getElementById('wishlistGoal');
    var pEl = document.getElementById('wishlistPct');
    if (cEl) cEl.textContent = fmtNum(count);
    if (gEl) gEl.textContent = fmtNum(Math.max(0, goal - count));
    if (pEl) pEl.textContent = pct + '%';

    // reward cards
    var msEl = document.getElementById('wishlistMilestones');
    if (msEl) {
        msEl.innerHTML = STEAM_WISHLIST.milestones.map(function (m) {
            var unlocked = count >= m.at;
            var remain   = unlocked ? 0 : (m.at - count);
            return '<div class="wl-reward' + (unlocked ? ' unlocked' : '') + '">'
                + '<div class="wl-reward-top"><span class="wl-reward-threshold">' + fmtNum(m.at) + '<em>wishlists</em></span>'
                + '<span class="wl-reward-state">' + (unlocked ? 'Unlocked' : 'Locked') + '</span></div>'
                + '<h3 class="wl-reward-title">' + m.title + '</h3>'
                + '<p class="wl-reward-desc">' + m.desc + '</p>'
                + '<div class="wl-reward-foot"><span class="wl-reward-note">' + (unlocked ? '&#9733; Unlocked &middot; thanks!' : fmtNum(remain) + ' to unlock') + '</span></div>'
                + '</div>';
        }).join('');
    }

    var bEl = document.getElementById('wishlistBar');
    if (bEl) { requestAnimationFrame(function () { bEl.style.width = pct + '%'; }); }
}
renderWishlist();

/* ============================================================
   NEW — Smooth parallax background on scroll
   ============================================================ */
(function () {
    var wrap = document.querySelector('.bg-slideshow');
    if (!wrap) return;
    var ticking = false;
    function parallax() {
        ticking = false;
        var y = window.pageYOffset || 0;
        // gentle drift so the backdrop feels alive while scrolling
        wrap.style.transform = 'translate3d(0, ' + (y * 0.18) + 'px, 0) scale(1.1)';
    }
    wrap.style.transform = 'translate3d(0,0,0) scale(1.1)';
    window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
    }, { passive: true });
})();
(function () {
    var track = document.getElementById('timelineTrack');
    if (!track) return;
    var isDown = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        isDown = true; moved = 0; startX = e.pageX; startLeft = track.scrollLeft;
        track.style.cursor = 'grabbing'; e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
        if (!isDown) return;
        moved = Math.abs(e.pageX - startX);
        track.scrollLeft = startLeft - (e.pageX - startX);
    }, { passive: true });
    window.addEventListener('mouseup', function () { isDown = false; track.style.cursor = 'grab'; });
})();
