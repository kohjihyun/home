(function () {
  /* ---- partners marquee : build two identical groups for a seamless loop ---- */
  const line1 = [
    ["알리페이 플러스", 113, 20], ["union pay", 118, 26], ["western union", 159, 18],
    ["paypal-logo 2", 65, 22], ["yoomoney 1", 109, 23], ["wechat pay", 95, 30],
    ["kakao pay", 65, 24], ["핑퐁", 78, 24]
  ];
  const line2 = [
    ["쿠쿠", 95, 14], ["11번가", 42, 18], ["롯데면세점", 35, 32], ["신세계", 98, 22],
    ["신라면세점", 74, 32], ["현대면세", 116, 24], ["gtog", 22, 28],
    ["lg생활건강", 102, 20], ["public beacon", 157, 14]
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
})();
