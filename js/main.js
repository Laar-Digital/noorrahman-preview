// Noor Rahman, website v2: themes, header, menu, smooth scroll, reveals, parallax, scrubbed text, pinned story, horizontal gallery, forms.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => matchMedia('(min-width: 64.01rem)').matches;

  /* Themes */
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('nr-theme', t); } catch (e) {}
    document.querySelectorAll('[data-set-theme]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === t)));
  };
  document.querySelectorAll('[data-set-theme]').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.setTheme)));
  setTheme(root.dataset.theme || 'noir');

  /* Header: solid after the hero starts to scroll, hides on the way down */
  const header = document.querySelector('.header');
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    if (!header) return;
    header.classList.toggle('is-solid', y > 40);
    if (!header.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > 640 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('is-hidden');
    lastY = y;
  };

  /* Menu */
  const drawer = document.querySelector('.drawer');
  const menuBtn = document.querySelector('.menu-btn');
  const closeMenu = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open'); header.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.querySelector('b').textContent = 'Menu';
    document.body.style.overflow = '';
  };
  if (drawer && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = !drawer.classList.contains('is-open');
      if (!open) return closeMenu();
      drawer.classList.add('is-open'); header.classList.add('menu-open'); header.classList.remove('is-hidden');
      menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.querySelector('b').textContent = 'Close';
      document.body.style.overflow = 'hidden';
      drawer.querySelector('a')?.focus();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) { closeMenu(); menuBtn.focus(); } });
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* Smooth scroll */
  if (!reduce && window.Lenis) {
    const lenis = new window.Lenis({ lerp: 0.09, anchors: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* Reveals */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('[data-reveal], [data-clip], .lines, .street').forEach((el) => io.observe(el));

  /* Scrubbed statement: words light up as it scrolls through */
  const scrubs = [...document.querySelectorAll('.scrub')].map((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(' ');
    return { el, spans: [...el.querySelectorAll('.w')] };
  });

  /* Parallax images */
  const para = [...document.querySelectorAll('[data-parallax]')];

  /* Horizontal gallery */
  const hs = document.querySelector('.hscroll');
  const track = hs?.querySelector('.hscroll__track');
  let hsActive = false;
  const sizeHs = () => {
    if (!hs) return;
    hsActive = wide() && !reduce;
    hs.classList.toggle('is-static', !hsActive);
    hs.style.height = hsActive ? `${track.scrollWidth - innerWidth + innerHeight}px` : '';
  };

  const frame = () => {
    const vh = innerHeight;
    if (!reduce) {
      para.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const k = parseFloat(el.dataset.parallax) || 0.12;
        const lim = r.height * 0.09;
        const v = ((r.top + r.height / 2) - vh / 2) * -k;
        el.style.setProperty('--py', `${Math.max(-lim, Math.min(lim, v))}px`);
      });
    }
    scrubs.forEach(({ el, spans }) => {
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = reduce ? spans.length : Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < n));
    });
    if (hsActive) {
      const r = hs.getBoundingClientRect();
      const max = track.scrollWidth - innerWidth;
      const p = Math.min(1, Math.max(0, -r.top / (hs.offsetHeight - vh)));
      hs.style.setProperty('--hx', `${-p * max}px`);
      hs.style.setProperty('--hp', p.toFixed(3));
    }
  };
  let ticking = false;
  const onScroll = () => {
    onHeader();
    if (!ticking) { ticking = true; requestAnimationFrame(() => { frame(); ticking = false; }); }
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeHs(); frame(); });
  addEventListener('load', () => { sizeHs(); frame(); });
  sizeHs(); onHeader(); frame();

  /* Pinned story: the step in view sets the picture */
  const story = document.querySelector('.story');
  if (story) {
    const imgs = [...story.querySelectorAll('.story__media img')];
    const steps = [...story.querySelectorAll('.story__steps li')];
    const sio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
      const k = Number(e.target.dataset.img || 0);
      imgs.forEach((im, j) => im.classList.toggle('is-on', j === k));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => sio.observe(s));
    imgs[0]?.classList.add('is-on');
  }

  /* Marquee pause */
  document.querySelectorAll('.marquee').forEach((m) => {
    const b = m.querySelector('.marquee__toggle');
    if (!b) return;
    b.addEventListener('click', () => {
      const p = m.classList.toggle('is-paused');
      b.textContent = p ? 'Play' : 'Pause';
      b.setAttribute('aria-pressed', String(p));
    });
  });

  /* Forms: validate, and say plainly that nothing was sent until an endpoint exists */
  document.querySelectorAll('form[data-endpoint]').forEach((form) => {
    const help = form.querySelector('[aria-live]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('input:not([type="radio"]), select, textarea')];
      const bad = fields.find((f) => !f.checkValidity());
      fields.forEach((f) => f.toggleAttribute('aria-invalid', !f.checkValidity()));
      if (bad) {
        const label = form.querySelector(`label[for="${bad.id}"]`);
        help.textContent = `${label ? label.textContent.replace(/\s*\(optional\)/, '') : 'One field'} needs a look before this can go.`;
        bad.focus();
        return;
      }
      if (!form.dataset.endpoint) {
        help.textContent = 'Nothing was sent: this form is not connected yet. Call or email Noor instead.';
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.setAttribute('aria-busy', 'true');
      fetch(form.dataset.endpoint, { method: 'POST', body: new FormData(form) })
        .then((r) => { help.textContent = r.ok ? 'Your message is with Noor.' : 'That did not go through. Try again in a minute.'; })
        .catch(() => { help.textContent = 'That did not go through. Try again in a minute.'; })
        .finally(() => btn.removeAttribute('aria-busy'));
    });
  });
})();
