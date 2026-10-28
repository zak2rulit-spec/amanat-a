(() => {
  const body = document.body;
  const hdr = document.getElementById('hdr');
  const burger = document.getElementById('burger');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- header state --- */
  const onScrollHeader = () => hdr.classList.toggle('is-solid', window.scrollY > 40);

  /* --- mobile menu --- */
  const closeMenu = () => { body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); body.style.overflow = ''; };
  burger.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  /* --- reveal on scroll --- */
  const targets = document.querySelectorAll('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('in'));
  }

  /* --- counters --- */
  const animateCount = el => {
    const end = parseInt(el.dataset.count, 10);
    if (!end || reduce) return;
    const start = end > 1000 ? end - 60 : 0;
    const t0 = performance.now(), dur = 1600;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { animateCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(el => co.observe(el));
  }

  /* --- active nav link --- */
  const links = [...document.querySelectorAll('.nav a[href^="#"]:not(.nav__cta-mobile)')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScrollNav = () => {
    const y = window.scrollY + 140;
    let current = null;
    sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
  };

  /* --- hero parallax --- */
  const heroBg = document.querySelector('[data-parallax]');
  const onScrollParallax = () => {
    if (reduce || !heroBg) return;
    const y = window.scrollY;
    if (y < window.innerHeight) heroBg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
  };

  /* --- timeline fill --- */
  const tl = document.getElementById('tl');
  const fill = document.getElementById('tlFill');
  const items = tl ? [...tl.querySelectorAll('.tl__item')] : [];
  const onScrollTimeline = () => {
    if (!tl) return;
    const r = tl.getBoundingClientRect();
    const vh = window.innerHeight;
    const vertical = window.innerWidth <= 920;
    const p = Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
    if (vertical) { fill.style.height = (p * 100) + '%'; fill.style.width = ''; }
    else { fill.style.width = (p * 100) + '%'; fill.style.height = ''; }
    items.forEach((it, i) => it.classList.toggle('on', p >= (i / (items.length - 1)) * 0.95 || reduce));
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollHeader(); onScrollNav(); onScrollParallax(); onScrollTimeline(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* --- hide broken images gracefully --- */
  document.querySelectorAll('main img').forEach(img => {
    img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true });
  });

  /* --- form → WhatsApp --- */
  const form = document.getElementById('form');
  const err = document.getElementById('formErr');
  const phoneInput = form.elements.phone;

  phoneInput.addEventListener('input', () => {
    let d = phoneInput.value.replace(/\D/g, '');
    if (d.startsWith('8')) d = '7' + d.slice(1);
    if (d && !d.startsWith('7')) d = '7' + d;
    d = d.slice(0, 11);
    const p = [d.slice(0, 1), d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
    let out = d ? '+' + p[0] : '';
    if (p[1]) out += ' ' + p[1];
    if (p[2]) out += ' ' + p[2];
    if (p[3]) out += ' ' + p[3];
    if (p[4]) out += ' ' + p[4];
    phoneInput.value = out;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = form.elements;
    [f.name, f.phone].forEach(i => i.classList.remove('bad'));
    const name = f.name.value.trim();
    const digits = f.phone.value.replace(/\D/g, '');
    const problems = [];
    if (name.length < 2) { problems.push('укажите имя'); f.name.classList.add('bad'); }
    if (digits.length !== 11) { problems.push('введите телефон полностью'); f.phone.classList.add('bad'); }
    if (problems.length) { err.textContent = 'Пожалуйста, ' + problems.join(' и ') + '.'; return; }
    err.textContent = '';

    const lines = [
      'Здравствуйте! Заявка с сайта Аманат-А.',
      '',
      'Имя: ' + name,
      f.org.value.trim() ? 'Организация: ' + f.org.value.trim() : '',
      'Телефон: ' + f.phone.value,
      'Объект: ' + f.type.value,
      f.msg.value.trim() ? 'Задача: ' + f.msg.value.trim() : ''
    ].filter(Boolean);
    window.open('https://wa.me/77017996447?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    form.reset();
    err.style.color = '#1d7a3d';
    err.textContent = 'Открываем WhatsApp — отправьте сообщение там.';
    setTimeout(() => { err.textContent = ''; err.style.color = ''; }, 6000);
  });
})();
