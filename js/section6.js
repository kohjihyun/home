/* ================================================================
   Section 6 — scroll reveals + robust video play
================================================================ */
(function () {
  /* ---- Title block reveal (treats .s6-title-block like .is-visible) ---- */
  const titleBlocks = document.querySelectorAll('.s6-title-block');

  const revealEls = document.querySelectorAll('.reveal-up, .s6-title-block');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---- Ensure the video actually plays (autoplay policy fallback) ---- */
  const video = document.querySelector('.s6-video__media');
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });

    const kick = () => {
      tryPlay();
      window.removeEventListener('pointerdown', kick);
      window.removeEventListener('keydown', kick);
      window.removeEventListener('scroll', kick);
    };
    window.addEventListener('pointerdown', kick, { once: true });
    window.addEventListener('keydown', kick, { once: true });
    window.addEventListener('scroll', kick, { once: true, passive: true });
  }
})();
