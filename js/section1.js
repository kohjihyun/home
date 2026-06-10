/* ================================================================
   Section 1 — Marquee speed normalizer
   Keeps a consistent visual speed regardless of how wide the
   marquee track is (i.e., independent of item count / viewport).
================================================================ */
(function () {
  const track = document.querySelector('.section1-track[data-marquee]');
  if (!track) return;

  const PX_PER_SECOND = 80; // tweak for desired speed

  const setDuration = () => {
    const groupA = track.querySelector('.section1-list');
    if (!groupA) return;
    const groupWidth = groupA.getBoundingClientRect().width;
    if (!groupWidth) return;
    const duration = Math.max(20, groupWidth / PX_PER_SECOND);
    track.style.animationDuration = duration.toFixed(2) + 's';
  };

  if (document.readyState === 'complete') {
    setDuration();
  } else {
    window.addEventListener('load', setDuration, { once: true });
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setDuration, 150);
  });
})();
