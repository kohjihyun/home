/* ================================================================
   Section 4-5 — Card carousel (3D fan)
   Ported from 01-draft/js/card-carosel.js + card-carosel2.js
   - Auto-rotate every 1.5s
   - Hover a card to focus it, mouseleave resumes auto-rotate
================================================================ */
(function () {

  /* ---- Scroll-reveal for tag / title / sub ---- */
  const revealEls = document.querySelectorAll('.reveal-up, .section-title-reveal');
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

  /* ---- Carousel data (from 01-draft) ---- */
  const carousels = {
    1: {
      // Electronic Financial Licenses — 6 cards
      cards: [
        { id: 1, title: 'Electronic Payment Gateway(PG)',         color: '#EA4109' },
        { id: 2, title: 'Prepaid Electronic Payment InstrumentE', color: '#E52006' },
        { id: 3, title: 'Foreign Exchange Business',              color: '#BC1313' },
        { id: 4, title: 'Currency Exchange',                      color: '#EA4109' },
        { id: 5, title: 'Small-Amount Overseas Remittance',       color: '#E52006' },
        { id: 6, title: 'Escrow<br />Service',                    color: '#BC1313' }
      ],
      spread: { base: 170, step: 140 }
    },
    2: {
      // Intellectual Property & Patents — 4 cards
      cards: [
        { id: 1, title: 'Financial<br />Transaction<br />Brokerage',    color: '#EA4109' },
        { id: 2, title: 'Duty-Free<br />Purchase<br />Settlement',      color: '#E52006' },
        { id: 3, title: 'Mobile<br />Augmented Space<br />Acceleration', color: '#BC1313' },
        { id: 4, title: 'Ultrasonic<br />Payment<br />Technology',      color: '#EA4109' }
      ],
      spread: { base: 220, step: 150 }
    }
  };

  const AUTO_ROTATE_MS = 1500;
  const ICON_SRC = './assets/img/certificate.png';

  function initCarousel(scene, config) {
    const { cards, spread } = config;
    const cardEls = [];
    let active = 0;
    let autoTimer = null;
    let hovering = false;

    const getRelativePosition = (index) => {
      const total = cards.length;
      let diff = index - active;
      if (diff > total / 2)  diff -= total;
      if (diff < -total / 2) diff += total;
      return diff;
    };

    const getCardStyle = (position) => {
      const abs = Math.abs(position);
      if (position === 0) {
        return {
          transform: 'translate3d(0px, 0, 0) scale(1.12) rotateY(0deg)',
          zIndex: '100',
          opacity: '1',
          filter: 'brightness(1)'
        };
      }
      const direction = position > 0 ? 1 : -1;
      const x = direction * (spread.base + (abs - 1) * spread.step);
      const z = -abs * 120;
      const scale = 1 - abs * 0.12;
      const rotateY = direction * -32;
      return {
        transform: `translate3d(${x}px, 0, ${z}px) scale(${scale}) rotateY(${rotateY}deg)`,
        zIndex: String(100 - abs),
        opacity: '1',
        filter: 'brightness(0.65)'
      };
    };

    const render = () => {
      cards.forEach((_, index) => {
        const el = cardEls[index];
        if (!el) return;
        const style = getCardStyle(getRelativePosition(index));
        el.style.transform = style.transform;
        el.style.zIndex    = style.zIndex;
        el.style.opacity   = style.opacity;
        el.style.filter    = style.filter;
      });
    };

    const stopAuto = () => {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    };

    const startAuto = () => {
      stopAuto();
      if (hovering) return;
      autoTimer = setInterval(() => {
        active = (active + 1) % cards.length;
        render();
      }, AUTO_ROTATE_MS);
    };

    const buildCards = () => {
      cards.forEach((card, index) => {
        const el = document.createElement('div');
        el.className = 'carosel-card';
        el.dataset.id = card.id;

        el.innerHTML = `
          <div class="carosel-card-content" style="background-color:${card.color};">
            <img src="${ICON_SRC}" class="carosel-card-icon" alt="" />
            <div class="carosel-overlay">
              <div class="carosel-num">0${card.id}</div>
              <div class="carosel-title">${card.title}</div>
            </div>
            <div class="carosel-reflection"></div>
          </div>
        `;

        el.addEventListener('mouseenter', () => {
          hovering = true;
          stopAuto();
          if (active !== index) {
            active = index;
            render();
          }
        });
        el.addEventListener('mouseleave', () => {
          hovering = false;
          startAuto();
        });

        scene.appendChild(el);
        cardEls.push(el);
      });
    };

    buildCards();
    render();
    startAuto();
  }

  /* Initialise both scenes */
  document.querySelectorAll('.carosel-scene').forEach((scene) => {
    const key = scene.dataset.scene;
    const cfg = carousels[key];
    if (cfg) initCarousel(scene, cfg);
  });
})();
