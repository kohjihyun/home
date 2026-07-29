/* personal.html — DEBUNK remittance
   Section 5 is driven by js/business-01.js (same markup, same 1.5s
   auto-rotate + hover), so nothing for it here. This file covers the
   hero reveal, the two marquees, the accordion and the motion flow. */
(function () {
  /* ---- hero reveal on DOM ready (don't wait for the hero image) ---- */
  const hero = document.getElementById("p-hero");
  function revealHero() { if (hero) hero.classList.add("is-visible"); }
  if (document.readyState !== "loading") {
    requestAnimationFrame(revealHero);
    setTimeout(revealHero, 120);          // fallback if rAF is paused
  } else {
    document.addEventListener("DOMContentLoaded", revealHero);
  }

  /* ---- section headings: reveal once the heading itself is on screen ----
     Same trigger as the other pages: fires when the element's top passes
     72% of the viewport, so the motion plays where it can be seen. */
  (function headReveal() {
    const RATIO = 0.72;
    const secs = ["p-section2", "p-section3", "p-section4", "p-section6"]
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((sec) => ({ sec: sec, title: sec.querySelector("h2"), done: false }))
      .filter((o) => o.title);
    if (!secs.length) return;

    function check() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      let pending = false;
      secs.forEach((o) => {
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

  /* ---- section 1: two endless marquees ------------------------------
     The CSS slides each track to -50%, so the track needs the sentence
     twice over. Repeat until it is at least two viewports wide, otherwise
     a short line would leave a gap before the loop comes round. */
  (function marquees() {
    // Rendered px/s, not a duration: the two lines shrink at different rates
    // across breakpoints, so a fixed duration would flip which one looks
    // faster. Driving speed keeps the sub the slower of the two everywhere.
    const SPEED_BIG = 88;
    const SPEED_SUB = 60;

    const tracks = Array.prototype.slice.call(document.querySelectorAll("[data-marquee]"));
    if (!tracks.length) return;

    tracks.forEach((track) => {
      const seed = track.firstElementChild;
      if (!seed) return;
      track.setAttribute("aria-label", seed.textContent);
      const need = Math.max(1, Math.ceil((window.innerWidth * 1.2) / Math.max(1, seed.offsetWidth)));
      for (let i = 1; i < need; i++) track.appendChild(seed.cloneNode(true));
      // second half: the exact same run again, so -50% lands seamlessly
      track.innerHTML = track.innerHTML + track.innerHTML;
    });

    function tune() {
      tracks.forEach((track) => {
        const slow = !!track.closest(".p1__sub");
        const half = track.scrollWidth / 2;      // distance covered per loop
        if (half > 0) {
          track.style.animationDuration = (half / (slow ? SPEED_SUB : SPEED_BIG)).toFixed(2) + "s";
        }
      });
    }
    tune();
    window.addEventListener("resize", tune);
  })();

  /* ---- section 2: accordion (open / close, one panel at a time) ---- */
  (function accordion() {
    const list = document.getElementById("p2-list");
    if (!list) return;
    const items = Array.prototype.slice.call(list.querySelectorAll(".p2-item"));
    if (!items.length) return;

    function panelOf(item) { return item.querySelector(".p2-item__panel"); }

    function setOpen(item, open) {
      const panel = panelOf(item);
      const btn = item.querySelector(".p2-item__btn");
      item.classList.toggle("is-open", open);
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (!panel) return;
      // animate to the measured content height, then release to auto so a
      // resize (or a font swap) can't leave the panel clipped
      panel.style.height = open ? panel.scrollHeight + "px" : "0px";
    }

    items.forEach((item) => {
      const panel = panelOf(item);
      if (panel) {
        panel.addEventListener("transitionend", (e) => {
          if (e.propertyName !== "height") return;
          if (item.classList.contains("is-open")) panel.style.height = "auto";
        });
      }
      const btn = item.querySelector(".p2-item__btn");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => {
          if (other === item) return;
          if (other.classList.contains("is-open")) {
            // pin the current height first so the collapse has somewhere to go
            const p = panelOf(other);
            if (p) p.style.height = p.scrollHeight + "px";
            requestAnimationFrame(() => setOpen(other, false));
          }
        });
        setOpen(item, willOpen);
      });
    });

    // first item starts open — give it its height without animating
    const first = items[0];
    if (first && first.classList.contains("is-open")) {
      const p = panelOf(first);
      if (p) p.style.height = "auto";
    }

    window.addEventListener("resize", () => {
      items.forEach((item) => {
        const p = panelOf(item);
        if (p && item.classList.contains("is-open")) p.style.height = "auto";
      });
    });
  })();

  /* ---- section 3: motion flow — the four steps land in order --------
     Each step gets .is-in with a stagger, and the CSS runs the sequence
     inside a step: the ghost number rises, the arrow draws out, then the
     label and the description lift in. */
  (function motionFlow() {
    const flow = document.getElementById("p3-flow");
    if (!flow) return;
    const steps = Array.prototype.slice.call(flow.querySelectorAll("[data-step]"));
    if (!steps.length) return;

    const STAGGER = 220;   // ms between consecutive steps
    let fired = false;

    function run() {
      if (fired) return;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (flow.getBoundingClientRect().top > vh * 0.8) return;
      fired = true;
      steps.forEach((step, i) => {
        setTimeout(() => step.classList.add("is-in"), i * STAGGER);
      });
      window.removeEventListener("scroll", run);
      window.removeEventListener("resize", run);
    }
    window.addEventListener("scroll", run, { passive: true });
    window.addEventListener("resize", run);
    run();
  })();
})();
