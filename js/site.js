// Noor Rahman site: menu, the one reveal, the hero's pausable loop, and forms that are not connected yet.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menu under 60rem
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // One reveal, and the street that draws itself once
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal], .street').forEach((el) => io.observe(el));

  // A loop that can pause
  document.querySelectorAll('[data-loop]').forEach((el) => {
    const btn = el.querySelector('[data-loop-toggle]');
    const s = { seen: false, hover: false, focus: false, held: reduce };
    const sync = () => {
      el.classList.toggle('is-running', s.seen && !s.hover && !s.focus && !s.held);
      if (btn) btn.textContent = s.held ? 'Play pictures' : 'Pause pictures';
    };
    if (btn) btn.addEventListener('click', () => { s.held = !s.held; sync(); });
    [['pointerenter', 'hover', true], ['pointerleave', 'hover', false], ['focusin', 'focus', true], ['focusout', 'focus', false]]
      .forEach(([t, k, v]) => el.addEventListener(t, () => { s[k] = v; sync(); }));
    new IntersectionObserver(([e]) => { s.seen = e.isIntersecting; sync(); }).observe(el);
  });

  // Forms: validate, then say plainly when nothing was sent
  document.querySelectorAll('form[data-endpoint]').forEach((form) => {
    const help = form.querySelector('[aria-live]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fields = [...form.querySelectorAll('input, select, textarea')];
      const bad = fields.find((f) => !f.checkValidity());
      fields.forEach((f) => f.toggleAttribute('aria-invalid', !f.checkValidity()));
      if (bad) {
        const label = form.querySelector(`label[for="${bad.id}"]`);
        help.textContent = `${label ? label.textContent : 'One field'} needs a look before this can go.`;
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
