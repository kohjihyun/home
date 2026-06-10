/* ================================================================
   Section 3
   - Scroll reveal for tag, title, and cards
   - Explicit video play (works around autoplay restrictions)
================================================================ */
(function () {
  /* ---- Scroll reveal ----
     Cards stagger via JS (setTimeout per data-idx) because the
     :is-visible state overrides the transition shorthand, which
     was wiping out CSS transition-delay. */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .section-title-reveal, .s3-card'
  );
  const STAGGER_MS = 300;

  const revealCard = (el) => {
    const idx = parseInt(el.dataset.idx || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), idx * STAGGER_MS);
  };

  if (revealEls.length) {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target;
            if (el.classList.contains('s3-card')) revealCard(el);
            else el.classList.add('is-visible');
            io.unobserve(el);
          });
        },
        { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
      );
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => {
        if (el.classList.contains('s3-card')) revealCard(el);
        else el.classList.add('is-visible');
      });
    }
  }

  /* ---- Ensure card-back videos are playing ----
     Browsers can block autoplay or pause hidden videos. We try to
     play each card video as soon as it can play, on first user
     interaction, and again on hover. */
  const videos = document.querySelectorAll('.s3-card video');

  const tryPlay = (v) => {
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  };

  videos.forEach((v) => {
    v.muted = true;
    v.setAttribute('muted', '');
    v.playsInline = true;
    v.loop = true;

    if (v.readyState >= 2) tryPlay(v);
    else v.addEventListener('canplay', () => tryPlay(v), { once: true });
  });

  // Re-trigger on hover (in case browser paused it while hidden)
  document.querySelectorAll('.s3-card').forEach((card) => {
    const v = card.querySelector('video');
    if (!v) return;
    card.addEventListener('mouseenter', () => tryPlay(v));
    card.addEventListener('focusin',    () => tryPlay(v));
  });

  // Kick playback on first user interaction with the page
  const kick = () => {
    videos.forEach(tryPlay);
    window.removeEventListener('pointerdown', kick);
    window.removeEventListener('keydown', kick);
    window.removeEventListener('scroll', kick);
  };
  window.addEventListener('pointerdown', kick, { once: true });
  window.addEventListener('keydown', kick, { once: true });
  window.addEventListener('scroll', kick, { once: true, passive: true });
})();
