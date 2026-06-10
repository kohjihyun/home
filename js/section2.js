/* ================================================================
   Section 2 — scroll reveals + marquee speed normalizer
================================================================ */
(function () {
  /* ---- IntersectionObserver reveal ---- */
  const revealEls = document.querySelectorAll(
    '.reveal-up, .section-title-reveal, .card-reveal'
  );

  if ('IntersectionObserver' in window && revealEls.length) {
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

  /* ---- Marquee speed normalizer ----
     Adjust each row's animation-duration based on its content width so
     the visual speed (pixels-per-second) stays constant across viewports. */
  const PX_PER_SECOND = 70;

  const setMarqueeDuration = (marquee) => {
    const list = marquee.querySelector('.s2-marquee-list');
    if (!list) return;
    const w = list.getBoundingClientRect().width;
    if (!w) return;
    const lists = marquee.querySelectorAll('.s2-marquee-list');
    const duration = Math.max(30, w / PX_PER_SECOND);
    lists.forEach((l) => { l.style.animationDuration = duration.toFixed(2) + 's'; });
  };

  const marquees = document.querySelectorAll('.s2-marquee');
  const initMarquees = () => marquees.forEach(setMarqueeDuration);

  if (document.readyState === 'complete') {
    initMarquees();
  } else {
    window.addEventListener('load', initMarquees, { once: true });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initMarquees, 180);
  });
})();
