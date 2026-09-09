/*
The Last Message — script.js v20260619
(yeah i finally cleaned this up, finally bro. no more 500 lines of pain)
*/

// preload the two heaviest images right away
['https://files.catbox.moe/1zb08m.jpg','https://files.catbox.moe/hzl17x.png'].forEach(function(src){
  var img=new Image(); img.src=src;
});


/* ================= LOADING SCREEN ================= */
// i spent way too long on this loader, don't judge
(function(){
  var loader=document.getElementById('page-loader');
  var bar=document.getElementById('loaderBar');
  var txt=document.getElementById('loaderText');
  var gone=false, msgs=['Loading...','Preparing history...','Almost ready...'], mi=0;

  var mt=setInterval(function(){
    mi=(mi+1)%msgs.length;
    if(txt) txt.textContent=msgs[mi];
  },900);

  function anim(to,dur){
    if(!bar) return;
    var start=null, from=parseFloat(bar.style.width)||0;
    (function step(ts){
      if(!start) start=ts;
      var p=Math.min((ts-start)/dur,1);
      bar.style.width=(from+(to-from)*p)+'%';
      if(p<1) requestAnimationFrame(step);
    })(performance.now());
  }

  anim(40,400);

  function hide(){
    if(gone) return; gone=true;
    clearInterval(mt);
    anim(100,250);
    setTimeout(function(){
      if(loader){ loader.classList.add('hidden'); setTimeout(function(){ if(loader&&loader.parentNode) loader.parentNode.removeChild(loader); },600); }
      document.body.classList.add('ready');
    },300);
  }

  if(document.readyState==='complete'){ anim(90,300); setTimeout(hide,150); }
  else window.addEventListener('load',function(){ anim(90,300); setTimeout(hide,150); });

  var hi=document.querySelector('.hero-logo-img');
  if(hi){
    if(hi.complete){ anim(70,200); }
    else { hi.addEventListener('load',function(){anim(70,200);}); hi.addEventListener('error',function(){anim(70,200);}); }
  }
  setTimeout(hide,3500); // failsafe, finally lol
})();


/* ================= 100vh FIX (mobile) ================= */
// classic mobile address-bar issue, i died on this one
(function(){
  function setVH(){ document.documentElement.style.setProperty('--vh',(window.innerHeight*0.01)+'px'); }
  setVH();
  window.addEventListener('resize',setVH,{passive:true});
  window.addEventListener('orientationchange',function(){ setTimeout(setVH,200); });
})();


/* ================= ZOOM DETECTION (navbar blur) ================= */
// blurgy navbar when zoomed, this one was annoying
(function(){
  var vv=window.visualViewport; if(!vv) return;
  var t;
  vv.addEventListener('resize',function(){
    clearTimeout(t);
    t=setTimeout(function(){ document.body.classList.toggle('zoom-extreme',vv.scale>2.5||vv.scale<0.9); },80);
  });
})();


/* ================= NAVBAR ================= */
var navbar=document.getElementById('navbar');
if(navbar) window.addEventListener('scroll',function(){ navbar.classList.toggle('scrolled',window.scrollY>50); },{passive:true});

var navToggle=document.getElementById('navToggle');
var navLinks=document.getElementById('navLinks');

function closeNav(){
  if(!navLinks||!navToggle) return;
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded','false');
  document.body.style.overflow='';
}

if(navToggle&&navLinks){
  navToggle.addEventListener('click',function(){
    var open=navLinks.classList.toggle('open');
    navToggle.classList.toggle('open',open);
    navToggle.setAttribute('aria-expanded',String(open));
  });
  document.addEventListener('click',function(e){ if(navbar&&!navbar.contains(e.target)) closeNav(); });
  window.addEventListener('resize',function(){ if(window.innerWidth>768) closeNav(); },{passive:true});
}

// anchor links: just close the mobile menu, let the browser do the smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  if(a.getAttribute('onclick')) return; // skip overlay openers
  a.addEventListener('click',closeNav);
});


/* ================= ACCORDIONS ================= */
// one generic toggle, reused for FAQ + team categories (no more copy paste)
function accordion(cls){
  document.querySelectorAll(cls).forEach(function(item){
    var head=item.querySelector('.faq-question, .team-cat-header');
    if(!head) return;
    head.addEventListener('click',function(){
      var was=item.classList.contains('active');
      document.querySelectorAll(cls).forEach(function(x){ x.classList.remove('active'); });
      if(!was) item.classList.add('active');
    });
  });
}
accordion('.faq-item');
accordion('.team-cat');


/* ================= FADE IN ON SCROLL ================= */
(function(){
  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.fade-in').forEach(function(el){ el.classList.add('visible'); });
    return;
  }
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('visible'); obs.unobserve(en.target); }
    });
  },{threshold:0.06,rootMargin:'0px 0px -20px 0px'});
  function reg(){ document.querySelectorAll('.fade-in').forEach(function(el){ obs.observe(el); }); }
  if('requestIdleCallback' in window) requestIdleCallback(reg);
  else setTimeout(reg,150);
})();


/* ================= HERO FADE + SCROLL ARROW ================= */
window.addEventListener('scroll',function(){
  var hero=document.querySelector('.hero-content');
  if(hero) hero.style.opacity=Math.max(0,1-window.pageYOffset/600);
  var ind=document.querySelector('.scroll-indicator');
  if(ind) ind.style.opacity=window.scrollY>100?'0':'1';
},{passive:true});


/* ================= GOLD DUST CURSOR (desktop only) ================= */
// tiny sparkle trail, subtle
(function(){
  if(!window.matchMedia('(pointer: fine)').matches) return;
  var busy=false, count=0;
  document.addEventListener('mousemove',function(e){
    if(window.innerWidth<=768||busy||count>=10) return;
    busy=true;
    requestAnimationFrame(function(){
      busy=false;
      var d=document.createElement('div');
      d.style.cssText='position:fixed;width:4px;height:4px;border-radius:50%;background:rgba(201,168,76,0.32);left:'+e.clientX+'px;top:'+e.clientY+'px;pointer-events:none;z-index:9999;transition:opacity 0.5s ease,transform 0.5s ease;will-change:opacity,transform;';
      document.body.appendChild(d); count++;
      requestAnimationFrame(function(){ d.style.opacity='0'; d.style.transform='scale(3)'; });
      setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); count--; },520);
    });
  },{passive:true});
})();


/* ================= BACKGROUND SLIDESHOW ================= */
(function(){
  var slides=Array.from(document.querySelectorAll('.bg-slide'));
  var loaded=slides.map(function(){ return 0; });
  var sections=['home','trailer','gameplay','story','faq','community','team'];
  var offsets=[], current=0, raf=null;

  function loadSlide(i){
    if(loaded[i]) return;
    loaded[i]=1;
    var bg=slides[i].getAttribute('data-bg');
    if(!bg) return;
    var img=new Image();
    img.onload=function(){ slides[i].style.backgroundImage="url('"+bg+"')"; };
    img.src=bg;
  }
  function preloadAll(){ slides.forEach(function(_,i){ if(i>0) loadSlide(i); }); }
  if('requestIdleCallback' in window) requestIdleCallback(preloadAll,{timeout:2500});
  else setTimeout(preloadAll,1000);

  function buildOffsets(){
    offsets=sections.map(function(id){ return document.getElementById(id); })
      .filter(Boolean)
      .map(function(el){ return el.getBoundingClientRect().top+window.pageYOffset; });
  }
  function indexFor(){
    var trig=window.scrollY+window.innerHeight*0.3, idx=0;
    offsets.forEach(function(top,i){
      if(trig>=top) idx=Math.min(Math.floor(i*slides.length/sections.length),slides.length-1);
    });
    return idx;
  }
  function update(){
    var next=indexFor();
    if(next===current) return;
    loadSlide(next); current=next;
    slides.forEach(function(s,i){ s.classList.toggle('active',i===next); });
  }

  slides[0].classList.add('active');
  window.addEventListener('scroll',function(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=null; update(); }); },{passive:true});
  window.addEventListener('resize',function(){ buildOffsets(); update(); },{passive:true});
  window.addEventListener('load',function(){ buildOffsets(); update(); });
  setTimeout(buildOffsets,200);
})();


/* ================= CODEX + DEVLOGS OVERLAYS ================= */
// generic overlay open/close
function openOverlay(id){
  var o=document.getElementById(id);
  if(!o) return;
  o.classList.add('open'); o.scrollTop=0;
  document.documentElement.style.overflow='hidden';
}
function closeOverlay(id){
  var o=document.getElementById(id);
  if(!o) return;
  o.classList.remove('open');
  document.documentElement.style.overflow='';
}
function openCodex(){ openOverlay('codexOverlay'); }
function closeCodex(){ closeOverlay('codexOverlay'); }
function openDevlogs(){ openOverlay('devlogsOverlay'); }
function closeDevlogs(){ closeOverlay('devlogsOverlay'); }

// click anywhere on the backdrop closes it
['codexOverlay','devlogsOverlay'].forEach(function(id){
  var o=document.getElementById(id);
  if(o) o.addEventListener('click',function(e){ if(e.target===o) closeOverlay(id); });
});
document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ closeCodex(); closeDevlogs(); } });


/* ================= SCROLL PROGRESS BAR ================= */
(function(){
  var bar=document.getElementById('scrollProgressBar'), ticking=false;
  if(!bar) return;
  function update(){
    var h=document.documentElement;
    var pct=(window.pageYOffset/((h.scrollHeight-h.clientHeight)||1))*100;
    bar.style.width=Math.min(100,Math.max(0,pct))+'%';
    ticking=false;
  }
  window.addEventListener('scroll',function(){ if(!ticking){ requestAnimationFrame(update); ticking=true; } },{passive:true});
  update();
})();


/* ================= ARCHIVE RAIL ================= */
// prev/next buttons
document.querySelectorAll('.ac-rail-prev, .ac-rail-next').forEach(function(btn){
  btn.addEventListener('click',function(){
    var track=document.getElementById(btn.dataset.target);
    if(!track) return;
    var first=track.querySelector('.ac-tile');
    var step=first?first.getBoundingClientRect().width+20:track.clientWidth*0.8;
    track.scrollBy({left:btn.classList.contains('ac-rail-next')?step:-step,behavior:'smooth'});
  });
});

// drag to scroll + don't hijack the tile click
document.querySelectorAll('.ac-rail-track').forEach(function(track){
  var down=false, sx=0, sl=0, moved=0;
  var M_TH=8;

  track.addEventListener('mousedown',function(e){
    if(e.button!==0) return;
    down=true; moved=0; sx=e.pageX; sl=track.scrollLeft;
    track.classList.add('is-dragging'); e.preventDefault();
  });
  window.addEventListener('mousemove',function(e){
    if(!down) return;
    moved=Math.abs(e.pageX-sx);
    track.scrollLeft=sl-(e.pageX-sx);
  },{passive:true});
  window.addEventListener('mouseup',function(){ down=false; track.classList.remove('is-dragging'); });
  track.addEventListener('click',function(e){
    if(moved>M_TH){ e.preventDefault(); e.stopPropagation(); }
    moved=0;
  },true);

  var T_TH=22, tsx=0, tm=0;
  track.addEventListener('touchstart',function(e){ tsx=e.touches[0].clientX; tm=0; },{passive:true});
  track.addEventListener('touchmove',function(e){ tm=Math.abs(e.touches[0].clientX-tsx); },{passive:true});
  track.addEventListener('touchend',function(e){
    if(tm>T_TH){
      var a=e.target.closest('a');
      if(a&&!a.getAttribute('onclick')) e.preventDefault();
    }
    tm=0;
  },{passive:false});
});


/* ================= HUD SIDE NAV ================= */
(function(){
  var dots=document.querySelectorAll('nav.ac-hud a');
  if(!dots.length) return;
  var ids=Array.prototype.map.call(dots,function(a){ return a.getAttribute('href').slice(1); });
  var secs=ids.map(function(id){ return document.getElementById(id); }).filter(Boolean);

  function highlight(){
    var y=window.scrollY+window.innerHeight*0.35, cur=secs[0];
    for(var i=0;i<secs.length;i++){ if(secs[i]&&secs[i].offsetTop<=y) cur=secs[i]; }
    dots.forEach(function(d){ d.classList.toggle('active',d.getAttribute('href')==='#'+(cur&&cur.id)); });
  }
  window.addEventListener('scroll',highlight,{passive:true});
  window.addEventListener('resize',highlight,{passive:true});
  highlight();
})();


/* ================= LAZY-LOAD BG IMAGES ================= */
(function(){
  if(!('IntersectionObserver' in window)) return;
  var lazy=document.querySelectorAll('.bg-slide[data-bg]');
  if(!lazy.length) return;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      var slide=en.target, bg=slide.getAttribute('data-bg');
      if(bg&&!slide.style.backgroundImage){
        var img=new Image();
        img.onload=function(){ slide.style.backgroundImage="url('"+bg+"')"; };
        img.src=bg;
      }
      obs.unobserve(slide);
    });
  },{rootMargin:'200px'});
  lazy.forEach(function(slide){ obs.observe(slide); });
})();
