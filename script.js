/* ===========================================================
   JOBY KONNI — Portfolio interactions
   Lenis smooth scroll + GSAP ScrollTrigger reveals + micro UI
=========================================================== */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Lenis smooth scroll ---------------- */
  let lenis;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------------- Loader ---------------- */
  const loader = document.getElementById('loader');
  const loaderCount = document.getElementById('loaderCount');
  let count = 0;
  const counter = setInterval(() => {
    count += Math.ceil(Math.random() * 18);
    if (count >= 100) { count = 100; clearInterval(counter); }
    loaderCount.textContent = String(count).padStart(2, '0');
    if (count === 100) {
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.style.overflow = '';
        playHeroIn();
      }, 250);
    }
  }, 90);
  document.body.style.overflow = 'hidden';
  setTimeout(() => { // safety net in case interval stalls
    if (!loader.classList.contains('is-done')) {
      loader.classList.add('is-done');
      document.body.style.overflow = '';
      playHeroIn();
    }
  }, 3200);

  /* ---------------- Hero entrance ---------------- */
  function playHeroIn(){
    gsap.to('.hero__portrait', { opacity:1, y:0, duration:1.1, ease:'power3.out' });
    gsap.utils.toArray('.hero .reveal-up').forEach((el) => {
      const d = parseFloat(el.style.getPropertyValue('--d')) || 0;
      gsap.to(el, { opacity:1, y:0, duration:1, delay: 0.15 * d, ease:'power3.out' });
    });
  }
  gsap.set('.hero__portrait', { opacity:0, y:40 });

  /* ---------------- Scroll reveals (rest of page) ---------------- */
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    if (el.closest('.hero')) return; // handled by hero intro
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });

  /* ---------------- Nav scroll state ---------------- */
  const nav = document.getElementById('nav');
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    onUpdate: (self) => nav.classList.toggle('is-scrolled', self.scroll() > 80)
  });

  /* ---------------- Frame index ticker (signature element) ---------------- */
  const frameNum = document.getElementById('frameNum');
  const sections = document.querySelectorAll('main section, .marquee');
  ScrollTrigger.create({
    start: 0, end: 'max', onUpdate: (self) => {
      const n = Math.min(12, Math.max(1, Math.round(self.progress * 12) + 1));
      frameNum.textContent = String(n).padStart(3, '0');
    }
  });

  /* ---------------- Hero parallax shapes ---------------- */
  if (!reduceMotion) {
    gsap.to('.hero__shape--1', { y: 120, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
    gsap.to('.hero__shape--2', { y: -80, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
    gsap.to('.hero__portrait', { y: -60, ease:'none', scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true } });
  }

  /* ---------------- Timeline fill ---------------- */
  const timelineFill = document.getElementById('timelineFill');
  if (timelineFill) {
    gsap.to(timelineFill, {
      height: '100%', ease:'none',
      scrollTrigger: { trigger: '.timeline__track', start:'top 70%', end:'bottom 80%', scrub:true }
    });
  }

  /* ---------------- Animated counters ---------------- */
  document.querySelectorAll('.stat__num').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.8, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.floor(obj.val) + suffix; }
        });
      }
    });
  });

  /* ---------------- Magnetic buttons ---------------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.4, duration: 0.5, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', () => gsap.to(btn, { x:0, y:0, duration:0.6, ease:'elastic.out(1,0.4)' }));
    });
  }

  /* ---------------- Mobile menu ---------------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('is-open');
  });
  mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => mobileMenu.classList.remove('is-open')));

  /* ---------------- Dark mode toggle ---------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const stored = null; // no persistent storage across sessions in this environment
  themeToggle.addEventListener('click', () => root.classList.toggle('dark'));
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark');

  /* ---------------- Gallery filter ---------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery__item');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const f = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const show = f === 'all' || item.dataset.cat === f;
        item.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------------- Showreel play-in-place ---------------- */
  document.querySelectorAll('.reel-card').forEach((card) => {
    const iframe = card.querySelector('iframe');
    const playBtn = card.querySelector('.reel-card__play');
    const src = iframe.dataset.src;
    playBtn.addEventListener('click', () => {
      iframe.src = src + (src.includes('?') ? '&' : '?') + 'autoplay=1';
      playBtn.classList.add('is-hidden');
    });
  });

  /* ---------------- Refresh ScrollTrigger after fonts/layout settle ---------------- */
  window.addEventListener('load', () => ScrollTrigger.refresh());
});
