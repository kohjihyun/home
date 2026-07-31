(function () {
  /* ---- GNB mega-menu : hover opens full-width panel ---- */
  const gnb = document.getElementById("gnb");
  if (gnb) {
    let closeTimer = null;
    gnb.querySelectorAll(".gnb__item[data-menu]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        clearTimeout(closeTimer);
        gnb.dataset.active = item.dataset.menu;
      });
    });
    gnb.addEventListener("mouseleave", () => {
      closeTimer = setTimeout(() => { delete gnb.dataset.active; }, 120);
    });
    gnb.addEventListener("mouseenter", () => clearTimeout(closeTimer));

    /* ---- mobile burger toggles the mobile menu ---- */
    const burger = document.getElementById("gnb-burger");
    if (burger) {
      burger.addEventListener("click", () => {
        const open = gnb.classList.toggle("is-menu-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      gnb.querySelectorAll(".gnb__mobile-link, .gnb__mobile-contact").forEach((a) => {
        a.addEventListener("click", () => {
          gnb.classList.remove("is-menu-open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }
  }

  const hero = document.getElementById("b01-hero");

  /* ---- GNB turns into a solid dark bar once scrolled past the hero ----
     personal.html shares this script but names its hero #p-hero, so match
     either: without this the toggle never ran there and the page had to hard-code
     .is-solid, which cost it the transparent bar over its own hero. */
  const gnbHero = hero || document.getElementById("p-hero");
  if (gnbHero && gnb) {
    const onScroll = () => {
      gnb.classList.toggle("is-solid", gnbHero.getBoundingClientRect().bottom <= 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- hero reveal on DOM ready (don't wait for the background image) ---- */
  function revealHero() {
    if (hero) hero.classList.add("is-visible");
  }
  function scheduleReveal() {
    // rAF gives a paint of the initial state so the slide-up animates; the
    // timeout is a fallback for when rAF is paused (e.g. background tab).
    requestAnimationFrame(revealHero);
    setTimeout(revealHero, 120);
  }
  if (document.readyState !== "loading") {
    scheduleReveal();
  } else {
    document.addEventListener("DOMContentLoaded", scheduleReveal);
  }

  /* ---- section1: pinned two-phase, line-by-line reveal ----------------------
     While #section1 is pinned, scroll progress drives the reveal: contents-1's
     lines rise one at a time, the two blocks crossfade (bar01 -> bar02), then
     contents-2's lines rise one at a time in the same spot. */
  (function sec1Reveal() {
    const sec = document.getElementById("section1");
    if (!sec) return;
    const c1 = sec.querySelector('[data-content="1"]');
    const c2 = sec.querySelector('[data-content="2"]');
    const fill = sec.querySelector(".sec1__bar-fill");
    const l1 = Array.prototype.slice.call(c1.querySelectorAll(".sec1-line-inner"));
    const l2 = Array.prototype.slice.call(c2.querySelectorAll(".sec1-line-inner"));

    const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

    // reveal windows in overall scroll progress p [0..1]
    const W1 = [[0.00, 0.10], [0.07, 0.17], [0.14, 0.24], [0.21, 0.31]];
    const SWAP = [0.38, 0.48];
    const W2 = [[0.52, 0.62], [0.59, 0.69], [0.66, 0.76], [0.73, 0.83]];

    function setLines(lines, wins, p) {
      for (let i = 0; i < lines.length; i++) {
        const t = clamp((p - wins[i][0]) / (wins[i][1] - wins[i][0]), 0, 1);
        lines[i].style.transform = "translateY(" + ((1 - easeOut(t)) * 110) + "%)";
      }
    }

    function frame() {
      const rect = sec.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const travel = sec.offsetHeight - vh;
      const p = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
      setLines(l1, W1, p);
      setLines(l2, W2, p);
      const s = clamp((p - SWAP[0]) / (SWAP[1] - SWAP[0]), 0, 1);
      c1.style.opacity = String(1 - s);
      c2.style.opacity = String(s);
      // orange fill glides from left half to right half at the swap pace
      if (fill) fill.style.transform = "translateX(" + easeInOut(s) * 100 + "%)";
    }

    window.addEventListener("scroll", frame, { passive: true });
    window.addEventListener("resize", frame);
    frame();
  })();

  /* ---- section2: title reveal when it scrolls into view ------------------
     Scroll-driven (not IntersectionObserver) so it fires reliably. Reveals
     once the section's top crosses ~85% of the viewport height. */
  (function s2Reveal() {
    const sec = document.getElementById("section2");
    if (!sec) return;
    // Trigger off the title itself (not the section top): the section has a
    // large top padding, so the section can cross the threshold while the
    // title is still below the fold — the motion would then play unseen.
    const title = sec.querySelector(".s2__title") || sec;
    let done = false;
    function check() {
      if (done) return;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (title.getBoundingClientRect().top <= vh * 0.85) {
        sec.classList.add("is-inview");
        done = true;
        window.removeEventListener("scroll", check);
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  })();

  /* ---- sections 3–5: title reveal when the title actually scrolls into view -
     Triggered off each title's own position and a bit later than section2
     (title top must rise past RATIO of the viewport), so the entrance motion
     plays as the title becomes visible rather than before. */
  (function headReveal() {
    const RATIO = 0.72;   // lower than section2's .85 → starts later
    const heads = ["section3", "section4", "section5"].map(function (id) {
      const sec = document.getElementById(id);
      if (!sec) return null;
      const title = sec.querySelector(".s3__title, .s4__title, .s5__title");
      return title ? { sec: sec, title: title, done: false } : null;
    }).filter(Boolean);
    if (!heads.length) return;

    function check() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let pending = false;
      heads.forEach(function (o) {
        if (o.done) return;
        if (o.title.getBoundingClientRect().top <= vh * RATIO) {
          o.sec.classList.add("is-inview");
          o.done = true;
        } else { pending = true; }
      });
      if (!pending) {
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  })();

  /* ---- section2: expanding cards, auto-cycle every 0.7s + hover ---------- */
  (function s2Cards() {
    const wrap = document.getElementById("s2-cards");
    if (!wrap) return;
    const cards = Array.prototype.slice.call(wrap.querySelectorAll("[data-card]"));
    if (!cards.length) return;

    const INTERVAL = 1000;
    let active = 0;
    let timer = null;

    function setActive(i) {
      active = i;
      for (let k = 0; k < cards.length; k++) {
        cards[k].classList.toggle("is-active", k === active);
      }
    }
    function next() { setActive((active + 1) % cards.length); }
    function start() { stop(); timer = setInterval(next, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    cards.forEach((card, idx) => {
      card.addEventListener("mouseenter", () => { stop(); setActive(idx); });
      card.addEventListener("mouseleave", start);
    });

    setActive(0);
    start();
  })();

  /* ---- section3: pinned timeline, scrolls its steps within the container ---
     The four steps sit on a track inside the .s3__stage container. Two steps
     fit the container at a time: 01 & 02 straddle the centre at the start;
     scrolling advances the track by two slots so 03 & 04 come through and the
     run stops there (no loop). Scrolling back returns to — and stops at — 01.
     Each step's opacity/rise is driven by its distance from the container
     centre, so steps fade in and lift as they pass through, and dim toward
     the faded ends of the central line. */
  (function s3Timeline() {
    const sec = document.getElementById("section3");
    const pin = sec && sec.querySelector(".s3__pin");
    const head = sec && sec.querySelector(".s3__head");
    const stage = sec && sec.querySelector(".s3__stage");
    const track = document.getElementById("s3-track");
    const box = document.getElementById("s3-box");
    const sDown = document.getElementById("s3-scroll-down");
    const sUp = document.getElementById("s3-scroll-up");
    if (!sec || !pin || !head || !stage || !track) return;
    const items = Array.prototype.slice.call(track.querySelectorAll("[data-step]"));
    const N = items.length;
    if (!N) return;

    const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

    let containerH = 0;       // fixed line/box container height
    let stickStartS = 0;      // section-scroll where the container reaches centre
    let stickEndS = 1;        // section-scroll where it releases
    let STEP = 0;             // vertical gap between adjacent step centres
    let FADE = 1;             // distance over which a step fades to nothing

    function measure() {
      const vh = window.innerHeight || document.documentElement.clientHeight;

      // number size follows the container WIDTH so it matches Figma at the
      // design width (180px in the 1280 container) and scales down responsively
      const stageW = stage.clientWidth || (vh * 1.5);
      const mobile = (window.innerWidth || vh) <= 768;
      // the number keeps its Figma proportion: 180px in the 1280 desktop
      // container, 108px in the 412 mobile container (≈26% of the width)
      const num = mobile
        ? Math.min(stageW * (108 / 412), 108)
        : Math.min(stageW * (180 / 1280), 180);
      const winH = mobile
        ? Math.min(vh * 0.26, 200)                      // band fits number + wrapped text
        : Math.max(num * 1.3, 140);
      // container/line is FIXED to Figma's size (467px line for a 180 number)
      containerH = mobile
        ? Math.min(vh * 0.6, 460)
        : num * (467 / 180);
      // adjacent steps sit ~0.55 of the container apart and have faded out by
      // then, so each rises through the centre one at a time
      STEP = containerH * 0.55;
      FADE = STEP;
      // pin sticks when the container reaches the vertical centre of the screen
      const stickTop = Math.max(0, (vh - containerH) / 2);

      pin.style.height = containerH + "px";
      pin.style.top = stickTop + "px";

      // the pin's flow position is right below the heading; from that, the
      // section-scroll (-rect.top) at which it sticks and releases is fixed
      stickStartS = head.offsetHeight - stickTop;
      stickEndS = sec.offsetHeight - stickTop - containerH;

      sec.style.setProperty("--num", num + "px");
      sec.style.setProperty("--win", winH + "px");
    }

    // ---- each step scrolls vertically through the fixed centre: it rises from
    //      below, fades in as it reaches the box, then fades out as it passes up.
    //      One step is centred at a time; scrolling back runs it in reverse. ----
    function frame() {
      const rect = sec.getBoundingClientRect();
      // progress runs only while the container is stuck at the centre
      const scrolled = -rect.top;
      const p = clamp((scrolled - stickStartS) / Math.max(1, stickEndS - stickStartS), 0, 1);

      const pos = p * (N - 1);                   // 0 -> N-1 (step 01 -> 04)
      for (let i = 0; i < N; i++) {
        const off = (i - pos) * STEP;            // px from the centre (+ = below)
        const op = clamp(1 - Math.abs(off) / FADE, 0, 1);
        items[i].style.transform = "translateY(calc(-50% + " + off.toFixed(1) + "px))";
        items[i].style.opacity = op.toFixed(3);
      }
    }

    // ---- box spring + directional accents: box dips with the scroll, eases back ----
    const MAX_DIP = 14, K_DELTA = 0.7, EASE = 0.18;
    let lastY = window.scrollY || window.pageYOffset || 0;
    let dip = 0, accDown = 0, accUp = 0, running = false;

    const inView = () => {
      const r = sec.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      return r.bottom > 0 && r.top < vh;
    };

    function spring() {
      const y = window.scrollY || window.pageYOffset || 0;
      const delta = y - lastY;
      lastY = y;

      // scroll-down -> box moves down; scroll-up -> box moves up; then ease to 0
      const target = clamp(delta * K_DELTA, -MAX_DIP, MAX_DIP);
      dip += (target - dip) * EASE;
      if (Math.abs(dip) < 0.05 && Math.abs(delta) < 0.5) dip = 0;
      if (box) box.style.setProperty("--box-dip", dip.toFixed(2) + "px");

      // directional accents: jump up with scroll in that direction, then decay
      const vDown = delta > 0.5 ? clamp(delta / 6, 0, 1) : 0;
      const vUp = delta < -0.5 ? clamp(-delta / 6, 0, 1) : 0;
      accDown = Math.max(accDown * 0.9, vDown);
      accUp = Math.max(accUp * 0.9, vUp);
      if (accDown < 0.01) accDown = 0;
      if (accUp < 0.01) accUp = 0;
      if (sDown) sDown.style.opacity = accDown.toFixed(3);
      if (sUp) sUp.style.opacity = accUp.toFixed(3);

      if (inView()) {
        requestAnimationFrame(spring);
      } else {
        running = false;
        dip = 0; accDown = 0; accUp = 0;
        if (box) box.style.setProperty("--box-dip", "0px");
        if (sDown) sDown.style.opacity = 0;
        if (sUp) sUp.style.opacity = 0;
      }
    }
    function ensureSpring() {
      if (!running && inView()) {
        running = true;
        lastY = window.scrollY || window.pageYOffset || 0;
        requestAnimationFrame(spring);
      }
    }

    function onScroll() { frame(); ensureSpring(); }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { measure(); frame(); });
    frame();
  })();

  /* ---- section4: pinned reasons; each content revealed in place ------------
     Each content owns a third of the scroll. Within it the text rises one line
     at a time (number, then each wrapped line of title + description) while the
     base image is zoomed in (grown) in place — no image swap. Crossing into the
     next content swaps the image at once. The bar tracks the active one. */
  (function s4Reasons() {
    const sec = document.getElementById("section4");
    if (!sec) return;
    const shots = Array.prototype.slice.call(sec.querySelectorAll("[data-shot]"));
    const items = Array.prototype.slice.call(sec.querySelectorAll("[data-item]"));
    const segs = Array.prototype.slice.call(sec.querySelectorAll(".s4__seg i"));
    const N = items.length;
    if (!N) return;

    const q = (el, s) => el.querySelector(s);
    const bases = shots.map((s) => q(s, ".s4-shot__img--base"));
    const head = sec.querySelector(".s4__head");
    const stage = sec.querySelector(".s4__stage");
    const DRIFT_PX = 200;   // whole block rises this much across the pin — from the
                            //  190px rest up behind the GNB (2x the earlier 100px rate)

    const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);

    // per item, the ordered lines to reveal (number, then each title + desc line)
    const itemLines = items.map((it) =>
      Array.prototype.slice.call(it.querySelectorAll(".s4-line__in"))
    );

    function frame() {
      const rect = sec.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const travel = sec.offsetHeight - vh;
      const p = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;

      const active = clamp(Math.floor(p * N), 0, N - 1);
      const ph = clamp(p * N - active, 0, 1);       // progress within the content
      const rev = clamp(ph / 0.72, 0, 1);           // lines reveal, then hold

      const mobile = (window.innerWidth || vh) <= 768;

      // Phones list every content in order instead of swapping one in place
      // (CSS unrolls the stage into a grid). Clear anything a desktop-sized
      // frame may have written so nothing stays hidden or offset.
      if (mobile) {
        for (let i = 0; i < N; i++) {
          shots[i].style.opacity = "";
          items[i].style.opacity = "";
          if (bases[i]) bases[i].style.transform = "";
          const ls = itemLines[i];
          for (let k = 0; k < ls.length; k++) ls[k].style.transform = "";
        }
        for (let i = 0; i < segs.length; i++) segs[i].style.opacity = "";
        if (head) head.style.transform = "";
        if (stage) stage.style.transform = "";
        return;
      }

      // the whole block (title + content list) drifts slowly upward while
      // pinned (desktop only) — much slower than the content swap
      const drift = "translateY(" + (-p * DRIFT_PX) + "px)";
      if (head) head.style.transform = drift;
      if (stage) stage.style.transform = drift;

      for (let i = 0; i < N; i++) {
        const isActive = i === active;
        shots[i].style.opacity = isActive ? "1" : "0";   // hard swap between contents

        const ls = itemLines[i];
        items[i].style.opacity = "1";
        if (isActive) {
          // base image zooms in (grows) across the whole content, no swap
          bases[i].style.transform = "scale(" + (1 + easeOut(ph) * 0.2) + ")";
          // each line rises one after another
          const L = ls.length;
          const dur = 0.5;                          // per-line reveal length (in rev)
          const step = L > 1 ? (1 - dur) / (L - 1) : 0;
          for (let k = 0; k < L; k++) {
            const rv = clamp((rev - k * step) / dur, 0, 1);
            ls[k].style.transform = "translateY(" + ((1 - easeOut(rv)) * 110) + "%)";
          }
        } else {
          for (let k = 0; k < ls.length; k++) ls[k].style.transform = "translateY(110%)";
          bases[i].style.transform = "scale(1)";
        }
      }

      for (let i = 0; i < segs.length; i++) {
        segs[i].style.opacity = (i === active) ? "1" : "0";
      }
    }

    window.addEventListener("scroll", frame, { passive: true });
    window.addEventListener("resize", frame);
    frame();
  })();

  /* ---- section5: hover an audience to swap the image panel -----------------
     Hovering an item highlights it (orange); the previously-selected item turns
     navy briefly then clears; the matching image panel crossfades in and its
     caption rises one line at a time. */
  (function s5Audiences() {
    const list = document.getElementById("s5-list");
    const media = document.getElementById("s5-media");
    if (!list || !media) return;
    const items = Array.prototype.slice.call(list.querySelectorAll(".s5-item"));
    const panels = Array.prototype.slice.call(media.querySelectorAll(".s5-panel"));
    if (!items.length) return;

    // Captions are authored as explicit .s5-line spans in the HTML (Figma-exact
    // breaks); the staggered rise is handled purely in CSS. No JS splitting.

    let active = 0;
    function activate(i) {
      if (i === active || i < 0 || i >= items.length) return;
      const old = active;
      active = i;

      // current -> orange; cancel any pending fade + clear its navy immediately
      const cur = items[i];
      if (cur._prevTimer) { clearTimeout(cur._prevTimer); cur._prevTimer = null; }
      cur.classList.remove("is-prev");
      cur.classList.add("is-active");

      // the item we just left -> navy briefly, then clear — each on its OWN timer
      // so rapid hops never leave a stray background behind (was a single shared timer)
      const prev = items[old];
      prev.classList.remove("is-active");
      prev.classList.add("is-prev");                        // #2E384D
      if (prev._prevTimer) clearTimeout(prev._prevTimer);
      prev._prevTimer = setTimeout(() => {
        prev.classList.remove("is-prev");
        prev._prevTimer = null;
      }, 450);

      panels[old] && panels[old].classList.remove("is-active");
      panels[i] && panels[i].classList.add("is-active");   // crossfade + caption motion
    }

    // auto-rotate through the four audiences every 1.5s; hovering the list pauses
    // it and jumps to the hovered item, leaving the list resumes the rotation
    let autoTimer = null;
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => activate((active + 1) % items.length), 1500);
    }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    items.forEach((it, i) => {
      it.addEventListener("mouseenter", () => { stopAuto(); activate(i); });
      it.addEventListener("click", () => activate(i));      // touch / mobile
    });
    list.addEventListener("mouseleave", startAuto);
    startAuto();
  })();
})();
