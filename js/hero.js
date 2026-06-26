(function () {
  /* ---- partners marquee : build two identical groups for a seamless loop ---- */
  const line1 = [
    ["알리페이", 74, 26], ["thunes", 90, 20], ["lianlian-pay", 100, 20], ["Thai QR", 86, 26],
    ["xnap", 52, 28], ["HIVEX", 82, 28], ["coral global", 115, 24], ["metro bank", 132, 24],
    ["알리페이 플러스", 113, 20], ["union pay", 118, 26], ["western union", 159, 18], ["paypal-logo 2", 65, 22],
    ["yoomoney 1", 109, 23], ["wechat pay", 95, 30], ["kakao pay", 65, 24], ["핑퐁", 78, 24]
  ];
  const line2 = [
    ["아모레퍼시픽", 161, 16], ["diesel", 58, 32], ["nike", 56, 20], ["polo", 46, 46],
    ["아디다스", 48, 32], ["마리떼", 56, 36], ["쿠쿠", 95, 14], ["11번가", 42, 18],
    ["롯데면세점", 35, 32], ["신세계", 98, 22], ["신라면세점", 74, 32], ["현대면세", 116, 24],
    ["gtog", 22, 28], ["lg생활건강", 102, 20], ["public beacon", 157, 14]
  ];

  function buildGroup(items, dir) {
    const g = document.createElement("div");
    g.className = "marquee__group";
    items.forEach(([name, w, h]) => {
      const img = document.createElement("img");
      img.src = "assets/partners/" + dir + "/" + name + ".png";
      img.alt = name;
      img.style.width = w + "px";
      img.style.height = h + "px";
      g.appendChild(img);
    });
    return g;
  }

  document.querySelectorAll(".marquee__track").forEach((track) => {
    const isLine1 = track.dataset.group === "line1";
    const set = isLine1 ? line1 : line2;
    const dir = isLine1 ? "line-1" : "line-2";
    track.appendChild(buildGroup(set, dir));
    track.appendChild(buildGroup(set, dir));
  });

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
  }

  /* ---- hero-1 reveal on load ---- */
  function revealHero1() {
    const h1 = document.querySelector(".hero-1");
    if (h1) h1.classList.add("is-visible");
  }
  if (document.readyState === "complete") {
    requestAnimationFrame(revealHero1);
  } else {
    window.addEventListener("load", () => requestAnimationFrame(revealHero1));
  }

  /* ---- hero-2 reveal when scrolled into view ---- */
  const hero2 = document.getElementById("hero2");
  if (hero2) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          hero2.classList.add("is-visible");
          io.unobserve(hero2);
        }
      });
    }, { threshold: 0.35 });
    io.observe(hero2);
  }

  /* ---- section1 reveal : rows rise one by one via clip mask ---- */
  const sec1 = document.getElementById("sec1");
  if (sec1) {
    // fire once section1 has scrolled up into view (its top passes ~55% of the viewport)
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          sec1.classList.add("is-visible");
          io.unobserve(sec1);
        }
      });
    }, { rootMargin: "0px 0px -45% 0px", threshold: 0 });
    io.observe(sec1);

    /* ---- GNB turns into a solid dark bar from section1 onward ---- */
    if (gnb) {
      const onScroll = () => {
        gnb.classList.toggle("is-solid", sec1.getBoundingClientRect().top <= 80);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ---- Section 2 — Business Services: reveal tag/title, stagger cards ---- */
  const sec2 = document.getElementById("sec2");
  if (sec2) {
    const cards = sec2.querySelectorAll(".bizcard");
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        sec2.classList.add("is-visible");
        cards.forEach((card) => {
          const idx = parseInt(card.dataset.idx, 10) || 0;
          const start = idx * 150;
          // rise in showing the video, then flip to the front once landed (.9s rise)
          setTimeout(() => card.classList.add("is-visible"), start);
          setTimeout(() => card.classList.add("is-settled"), start + 1000);
        });
        io2.unobserve(sec2);
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    io2.observe(sec2);

    sec2.querySelectorAll(".bizcard__video").forEach((v) => {
      v.muted = true;
      v.playsInline = true;
      const tryPlay = () => { const p = v.play(); if (p) p.catch(() => {}); };
      if (v.readyState >= 2) tryPlay();
      else v.addEventListener("loadeddata", tryPlay, { once: true });
    });
  }

  /* ---- Section 3 — Personal Service: reveal tag/title/subtitle/cta ---- */
  const sec3 = document.getElementById("sec3");
  if (sec3) {
    const io3 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        sec3.classList.add("is-visible");
        io3.unobserve(sec3);
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    io3.observe(sec3);

    const v3 = sec3.querySelector(".sec3__video");
    if (v3) {
      v3.muted = true;
      v3.playsInline = true;
      const tryPlay = () => { const p = v3.play(); if (p) p.catch(() => {}); };
      if (v3.readyState >= 2) tryPlay();
      else v3.addEventListener("loadeddata", tryPlay, { once: true });
    }
  }

  /* ---- Section 4 — Trust Indicators: reveal tag/title ---- */
  const sec4 = document.getElementById("sec4");
  if (sec4) {
    const io4 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        sec4.classList.add("is-visible");
        io4.unobserve(sec4);
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    io4.observe(sec4);

    // stat rows rise one-by-one once the list scrolls into view
    const stats = sec4.querySelector(".stats");
    if (stats) {
      const ioStats = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          stats.classList.add("is-visible");
          ioStats.unobserve(stats);
        });
      }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
      ioStats.observe(stats);
    }
  }

  /* ---- Sections 5 & 6 — reveal tag/title on scroll-in ---- */
  ["sec5", "sec6"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });
    io.observe(el);
  });
})();
