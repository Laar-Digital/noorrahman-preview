// Noor Rahman website: header, menu, smooth scroll, reveals, parallax, video backgrounds, guide tabs, calculators, checklists, community finder, forms.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = () => matchMedia('(min-width: 64.01rem)').matches;
  let lenis = null;
  const behindMenu = () => [document.querySelector('main'), document.querySelector('footer'), document.querySelector('.skip')].filter(Boolean);


  /* Header: solid after the hero starts to scroll, hides on the way down */
  const header = document.querySelector('.header');
  let lastY = scrollY;
  const onHeader = () => {
    const y = scrollY;
    if (!header) return;
    header.classList.toggle('is-solid', y > 40);
    if (!header.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > 640 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('is-hidden');
    root.classList.toggle('has-hidden-header', header.classList.contains('is-hidden'));
    lastY = y;
  };

  /* Menu */
  const drawer = document.querySelector('.drawer');
  const menuBtn = document.querySelector('.menu-btn');
  const closeMenu = () => {
    if (!drawer) return;
    drawer.classList.remove('is-open'); header.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.querySelector('b').textContent = 'Menu';
    document.body.style.overflow = ''; root.style.overflow = '';
    behindMenu().forEach((el) => { el.inert = false; });
    lenis?.start();
  };
  if (drawer && menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = !drawer.classList.contains('is-open');
      if (!open) return closeMenu();
      drawer.classList.add('is-open'); header.classList.add('menu-open'); header.classList.remove('is-hidden');
      menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.querySelector('b').textContent = 'Close';
      document.body.style.overflow = 'hidden'; root.style.overflow = 'hidden';
      behindMenu().forEach((el) => { el.inert = true; });
      lenis?.stop();
      drawer.querySelector('a')?.focus();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) { closeMenu(); menuBtn.focus(); } });
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  }

  /* Smooth scroll */
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.09, anchors: true });
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

  /* Tabs: the guide that switches a path (arrow keys move between tabs) */
  document.querySelectorAll('[data-tabs]').forEach((wrap) => {
    const tabs = [...wrap.querySelectorAll('[role="tab"]')];
    const show = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-shown', on); }
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (k) { e.preventDefault(); show(tabs[(i + k + tabs.length) % tabs.length], true); }
        if (e.key === 'Home') { e.preventDefault(); show(tabs[0], true); }
        if (e.key === 'End') { e.preventDefault(); show(tabs[tabs.length - 1], true); }
      });
    });
    const start = tabs.find((t) => location.hash && t.dataset.hash === location.hash.slice(1)) || tabs[0];
    show(start);
  });

  /* Calculators: every input with data-fmt shows its value in its <output> */
  const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const fmt = (v, f) => (f === 'usd' ? usd.format(v) : f === 'pct' ? `${v}%` : f === 'yrs' ? `${v} years` : String(v));
  document.querySelectorAll('[data-calc]').forEach((calc) => {
    const val = (n) => Number(calc.querySelector(`[name="${n}"]`)?.value || 0);
    const put = (k, v) => calc.querySelectorAll(`[data-out="${k}"]`).forEach((o) => { o.textContent = v; });
    const run = () => {
      calc.querySelectorAll('input[data-fmt]').forEach((i) => {
        const o = calc.querySelector(`output[for="${i.id}"]`);
        const txt = fmt(Number(i.value), i.dataset.fmt);
        if (o) o.textContent = txt;
        i.setAttribute('aria-valuetext', txt);
      });
      if (calc.dataset.calc === 'mortgage') {
        const price = val('price'); const down = price * val('down') / 100; const loan = price - down;
        const r = val('rate') / 100 / 12; const n = val('years') * 12;
        const pay = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
        put('payment', usd.format(pay)); put('loan', usd.format(loan)); put('down', usd.format(down));
        put('interest', usd.format(pay * n - loan));
      }
      if (calc.dataset.calc === 'rental') {
        const rent = val('rent'); const vac = rent * val('vacancy') / 100; const upkeep = rent * val('upkeep') / 100;
        const costs = val('payment') + val('taxins') + val('hoa') + vac + upkeep;
        const flow = rent - costs;
        put('costs', usd.format(costs)); put('cashflow', usd.format(flow)); put('yearly', usd.format(flow * 12));
        calc.querySelectorAll('[data-out="cashflow"], [data-out="yearly"]').forEach((o) => o.classList.toggle('is-neg', flow < 0));
      }
    };
    // One quiet announcement when a slider is released, not on every step
    calc.querySelector('.calc__out')?.removeAttribute('aria-live');
    const say = document.createElement('p');
    say.className = 'visually-hidden'; say.setAttribute('aria-live', 'polite');
    calc.append(say);
    const big = calc.querySelector('.calc__big'); const unit = calc.querySelector('.calc__unit');
    calc.addEventListener('input', run);
    calc.addEventListener('change', () => { if (big) say.textContent = `${unit ? unit.textContent + ': ' : ''}${big.textContent}`; });
    run();
  });

  /* Video backgrounds: muted, looping, with a visible pause; still poster under reduced motion */
  document.querySelectorAll('.hero__media video, video[data-bg]').forEach((v) => {
    const box = v.closest('.frame') || v.closest('section') || v.parentElement;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'media-toggle'; btn.textContent = 'Pause video';
    btn.setAttribute('aria-pressed', 'false');
    let held = false;
    btn.addEventListener('click', () => {
      held = !held;
      if (held) v.pause(); else v.play().catch(() => {});
      btn.textContent = held ? 'Play video' : 'Pause video';
      btn.setAttribute('aria-pressed', String(held));
    });
    box.append(btn);
    new IntersectionObserver(([e]) => { if (!held) (e.isIntersecting ? v.play().catch(() => {}) : v.pause()); }).observe(box);
  });

  /* Checklists: progress, saved in this browser only */
  document.querySelectorAll('[data-checklist]').forEach((list) => {
    const key = `nr-check-${list.dataset.checklist}`;
    const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
    boxes.forEach((b, i) => { b.checked = saved.includes(i); });
    const sync = () => {
      const done = boxes.filter((b) => b.checked).length;
      list.querySelector('[data-count]').textContent = `${done} of ${boxes.length} done`;
      list.querySelector('.progress')?.style.setProperty('--p', boxes.length ? done / boxes.length : 0);
      try { localStorage.setItem(key, JSON.stringify(boxes.map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0))); } catch (e) {}
    };
    list.addEventListener('change', sync);
    list.querySelector('.checklist__reset')?.addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; }); sync(); });
    sync();
  });

  /* Community finder: chips filter cards (a card must have every chosen tag) */
  document.querySelectorAll('[data-finder]').forEach((finder) => {
    const chips = [...finder.querySelectorAll('[data-tag]')];
    const cards = [...finder.querySelectorAll('[data-tags]')];
    const count = finder.querySelector('.finder__count');
    const empty = finder.querySelector('.finder__empty');
    const run = () => {
      const want = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.tag);
      let shown = 0;
      cards.forEach((card) => {
        const has = card.dataset.tags.split(' ');
        const ok = want.every((w) => has.includes(w));
        card.classList.toggle('is-out', !ok);
        if (ok) shown += 1;
      });
      if (count) count.textContent = want.length ? `${shown} of ${cards.length} communities match` : `All ${cards.length} communities`;
      if (empty) empty.hidden = shown > 0;
    };
    chips.forEach((c) => c.addEventListener('click', () => {
      c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
      run();
    }));
    finder.querySelector('[data-clear]')?.addEventListener('click', () => { chips.forEach((c) => c.setAttribute('aria-pressed', 'false')); run(); });
    run();
  });

  /* Jump bar: marks the section in view */
  const jump = document.querySelector('.jump');
  if (jump) {
    const links = [...jump.querySelectorAll('a[href^="#"]')];
    const jio = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((l) => l.classList.toggle('is-current', l.getAttribute('href') === `#${e.target.id}`));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach((l) => { const t = document.querySelector(l.getAttribute('href')); if (t) jio.observe(t); });
  }

  /* Forms: validate, and say plainly that nothing was sent until an endpoint exists */
  document.querySelectorAll('form[data-endpoint]').forEach((form) => {
    const help = form.querySelector('[aria-live]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('input:not([type="radio"]), select, textarea')];
      const bad = fields.find((f) => !f.checkValidity());
      if (!help.id) help.id = `help-${Math.random().toString(36).slice(2, 8)}`;
      fields.forEach((f) => {
        const ok = f.checkValidity();
        f.setAttribute('aria-invalid', String(!ok));
        if (!ok) f.setAttribute('aria-describedby', help.id); else if (f.getAttribute('aria-describedby') === help.id) f.removeAttribute('aria-describedby');
      });
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
