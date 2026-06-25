/* ============================================================
   ROHIT MEDIA WORKS — interactions
   Scroll logic uses getBoundingClientRect (robust in all
   environments) instead of IntersectionObserver.
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- nav frosted on scroll ---------- */
  const nav = document.querySelector(".nav");
  const onNav = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onNav, { passive: true });
  onNav();

  /* ---------- helpers ---------- */
  function inView(el, frac) {
    const r = el.getBoundingClientRect();
    const h = window.innerHeight || document.documentElement.clientHeight;
    return r.top < h * (frac || 0.86) && r.bottom > 0;
  }

  /* ---------- reveals ---------- */
  const reveals = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  function revealCheck() {
    for (let i = reveals.length - 1; i >= 0; i--) {
      const el = reveals[i];
      if (inView(el)) {
        el.classList.add("in");
        reveals.splice(i, 1);
      }
    }
  }

  /* ---------- animated counters ---------- */
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function countUp(el) {
    const target = parseFloat(el.dataset.count);
    const dur = 1600;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * easeOut(p)).toLocaleString("en-IN");
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toLocaleString("en-IN");
    }
    requestAnimationFrame(frame);
  }
  const counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function counterCheck() {
    for (let i = counters.length - 1; i >= 0; i--) {
      if (inView(counters[i], 0.92)) {
        countUp(counters[i]);
        counters.splice(i, 1);
      }
    }
  }

  /* ---------- process line fill + nodes ---------- */
  const procTrack = document.querySelector(".proc-track");
  let procDone = false;
  function procCheck() {
    if (procDone || !procTrack) return;
    if (inView(procTrack, 0.8)) {
      procDone = true;
      const fill = procTrack.querySelector(".proc-line i");
      if (fill) fill.style.width = "100%";
      procTrack.querySelectorAll(".proc-step").forEach((s, i) => {
        setTimeout(() => s.classList.add("lit"), reduce ? 0 : 200 + i * 230);
      });
    }
  }

  /* ---------- master scroll/raf loop ---------- */
  let ticking = false;
  function runChecks() {
    revealCheck();
    counterCheck();
    procCheck();
    parallax();
    ticking = false;
  }
  function requestChecks() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(runChecks);
    }
  }
  window.addEventListener("scroll", requestChecks, { passive: true });
  window.addEventListener("resize", requestChecks);

  /* ---------- hero glow parallax + fade ---------- */
  const heroBg = document.querySelector(".hero-bg");
  const heroInner = document.querySelector(".hero-inner");
  function parallax() {
    if (reduce || !heroBg) return;
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroBg.style.transform = "translateY(" + y * 0.18 + "px)";
      if (heroInner) heroInner.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.9)));
    }
  }

  /* ---------- AI tabs ---------- */
  const aiTabs = Array.prototype.slice.call(document.querySelectorAll(".ai-tab"));
  const aiScreens = Array.prototype.slice.call(document.querySelectorAll(".ai-screen"));
  const aiStyle = document.createElement("style");
  aiStyle.textContent =
    ".ai-screen.anim{animation:aiFade .55s cubic-bezier(.22,1,.36,1)}" +
    "@keyframes aiFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}";
  document.head.appendChild(aiStyle);
  function setAi(idx) {
    aiTabs.forEach((t, i) => t.classList.toggle("active", i === idx));
    aiScreens.forEach((s, i) => {
      const on = i === idx;
      s.style.display = on ? "block" : "none";
      if (on && !reduce) {
        s.classList.remove("anim");
        void s.offsetWidth;
        s.classList.add("anim");
        s.querySelectorAll(".viz-bar i").forEach((bar) => {
          const w = bar.dataset.w;
          bar.style.width = "0";
          requestAnimationFrame(() => requestAnimationFrame(() => (bar.style.width = w)));
        });
      } else if (on) {
        s.querySelectorAll(".viz-bar i").forEach((bar) => (bar.style.width = bar.dataset.w));
      }
    });
  }
  aiTabs.forEach((t, i) => t.addEventListener("click", () => setAi(i)));
  setAi(0);

  /* ---------- language toggle ---------- */
  const langData = {
    Telugu: "తెలుగు", Hindi: "हिन्दी", Tamil: "தமிழ்",
    Kannada: "ಕನ್ನಡ", Malayalam: "മലയാളം", English: "English",
  };
  const langPills = Array.prototype.slice.call(document.querySelectorAll(".lang-pill"));
  const langScript = document.querySelector("[data-lang-script]");
  const langName = document.querySelector("[data-lang-name]");
  langPills.forEach((p) => {
    p.addEventListener("click", () => {
      langPills.forEach((x) => x.classList.remove("active"));
      p.classList.add("active");
      const k = p.dataset.lang;
      if (langScript) {
        langScript.style.opacity = "0";
        setTimeout(() => {
          langScript.textContent = langData[k];
          if (langName) langName.textContent = k;
          langScript.style.opacity = "1";
        }, 180);
      }
    });
  });

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector(".nav-burger");
  const mobileMenu = document.querySelector(".mobile-menu");
  if (burger && mobileMenu) {
    burger.addEventListener("click", () => {
      const open = mobileMenu.classList.toggle("open");
      burger.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        burger.classList.remove("open");
        document.body.style.overflow = "";
      })
    );
  }

  /* ---------- initial run (twice, after layout/fonts settle) ---------- */
  runChecks();
  window.addEventListener("load", () => { runChecks(); setTimeout(runChecks, 60); });
  setTimeout(runChecks, 120);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(runChecks);

  /* ---------- films slider ---------- */
  const rail = document.querySelector(".films-rail");
  if (rail) {
    const arrows = document.querySelectorAll(".films-controls .slider-arrow");
    // duplicate the cards once so the auto-scroll can loop seamlessly
    [...rail.children].forEach((c) => rail.appendChild(c.cloneNode(true)));
    function cardStep() {
      const card = rail.querySelector(".film-card");
      if (!card) return 320;
      const gap = parseFloat(getComputedStyle(rail).columnGap || getComputedStyle(rail).gap || 22) || 22;
      return card.getBoundingClientRect().width + gap;
    }
    function updateArrows() {
      // looping carousel — arrows stay enabled
      arrows.forEach((a) => { a.disabled = false; });
    }
    arrows.forEach((a) =>
      a.addEventListener("click", () => {
        rail.scrollBy({ left: parseInt(a.dataset.dir, 10) * cardStep() * 1, behavior: "smooth" });
      })
    );
    rail.addEventListener("scroll", () => requestAnimationFrame(updateArrows), { passive: true });
    window.addEventListener("resize", updateArrows);
    updateArrows();

    /* drag to scroll */
    let down = false, startX = 0, startScroll = 0, moved = false;
    rail.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      down = true; moved = false;
      startX = e.clientX; startScroll = rail.scrollLeft;
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; rail.classList.add("dragging"); }
      rail.scrollLeft = startScroll - dx;
    });
    function endDrag(e) {
      if (!down) return;
      down = false;
      rail.classList.remove("dragging");
      try { rail.releasePointerCapture(e.pointerId); } catch (x) {}
    }
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    rail.addEventListener("pointerleave", endDrag);
    // suppress click after a drag
    rail.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

    /* ---------- continuous auto-scroll ---------- */
    const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let hovering = false, autoPaused = false;
    const SPEED = 0.65; // px per frame (~39px/s drift)
    let half = rail.scrollWidth / 2;
    function measure() { half = rail.scrollWidth / 2; }
    window.addEventListener("resize", measure);
    if (rail.querySelector("img")) {
      // recompute once posters have real dimensions
      window.addEventListener("load", measure);
      setTimeout(measure, 800);
    }
    function frame() {
      if (!(reduceMotion || hovering || down || autoPaused || document.hidden)) {
        rail.scrollLeft += SPEED;
        if (rail.scrollLeft >= half) rail.scrollLeft -= half;   // seamless wrap
      }
      requestAnimationFrame(frame);
    }
    if (!reduceMotion) requestAnimationFrame(frame);
    rail.addEventListener("pointerenter", () => { hovering = true; });
    rail.addEventListener("pointerleave", () => { hovering = false; });
    // let the lightbox pause/resume the drift
    window.__filmsAuto = { pause() { autoPaused = true; }, resume() { autoPaused = false; } };
  }

  /* ---------- film lightbox ---------- */
  const lb = document.getElementById("filmLightbox");
  if (lb) {
    const set = (sel, val, attr) => {
      const el = lb.querySelector(sel);
      if (!el) return;
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    };
    let lastFocus = null;
    function openFilm(card) {
      const d = card.dataset;
      set("[data-lb-poster]", d.poster, "src");
      lb.querySelector("[data-lb-poster]").setAttribute("alt", d.title + " poster");
      set("[data-lb-genre]", d.genre);
      set("[data-lb-title]", d.title);
      set("[data-lb-native]", d.native);
      set("[data-lb-year]", d.year);
      set("[data-lb-runtime]", d.runtime);
      set("[data-lb-rating]", d.rating);
      set("[data-lb-langs]", (d.langs || "").split(",").join(" · "));
      set("[data-lb-synopsis]", d.synopsis);
      set("[data-lb-director]", d.director);
      set("[data-lb-production]", d.production);
      const watch = lb.querySelector("[data-lb-watch]");
      if (watch) watch.setAttribute(
        "href",
        "mailto:hello@rohitmediaworks.com?subject=" + encodeURIComponent("Watch / License: " + d.title)
      );
      lb.querySelector(".lb-body").scrollTop = 0;
      lastFocus = document.activeElement;
      lb.classList.add("open");
      if (window.__filmsAuto) window.__filmsAuto.pause();
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb-close").focus();
    }
    function closeFilm() {
      lb.classList.remove("open");
      if (window.__filmsAuto) window.__filmsAuto.resume();
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll(".film-card").forEach((card) => {
      card.addEventListener("click", () => openFilm(card));
    });
    lb.querySelector(".lb-close").addEventListener("click", closeFilm);
    lb.addEventListener("click", (e) => { if (e.target === lb) closeFilm(); });
    lb.querySelectorAll("[data-lb-enquire], [data-lb-watch]").forEach((a) =>
      a.addEventListener("click", () => {
        if (a.hasAttribute("data-lb-enquire")) closeFilm();
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lb.classList.contains("open")) closeFilm();
    });
  }

  /* ---------- gallery (industry) lightbox ---------- */
  const glb = document.getElementById("galleryLightbox");
  if (glb) {
    const gImg = glb.querySelector("[data-glb-img]");
    const gName = glb.querySelector("[data-glb-name]");
    const gRole = glb.querySelector("[data-glb-role]");
    const gBio = glb.querySelector("[data-glb-bio]");
    let gLastFocus = null;
    function openGcard(card) {
      const d = card.dataset;
      gImg.src = d.gimg;
      gImg.alt = d.gname;
      gImg.style.objectPosition = d.gpos || "center top";
      gName.textContent = d.gname;
      gRole.textContent = d.grole;
      gBio.textContent = d.gbio;
      glb.querySelector(".glb-body").scrollTop = 0;
      gLastFocus = document.activeElement;
      glb.classList.add("open");
      document.body.style.overflow = "hidden";
      glb.querySelector(".glb-close").focus();
    }
    function closeGcard() {
      glb.classList.remove("open");
      document.body.style.overflow = "";
      if (gLastFocus && gLastFocus.focus) gLastFocus.focus();
    }
    document.querySelectorAll(".gcard").forEach((card) => {
      card.addEventListener("click", () => openGcard(card));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGcard(card); }
      });
    });
    glb.querySelector(".glb-close").addEventListener("click", closeGcard);
    glb.addEventListener("click", (e) => { if (e.target === glb) closeGcard(); });
    glb.querySelector("[data-glb-enquire]").addEventListener("click", closeGcard);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && glb.classList.contains("open")) closeGcard();
    });
  }

  /* ---------- AI showreel video ---------- */
  const aiVideo = document.querySelector(".ai-video");
  if (aiVideo) {
    const v = aiVideo.querySelector(".ai-video-el");
    const bg = aiVideo.querySelector(".ai-video-bg");
    const vids = [v, bg].filter(Boolean);
    const playBtn = aiVideo.querySelector(".ai-video-play");
    const soundBtn = aiVideo.querySelector(".ai-video-sound");
    const fullBtn = aiVideo.querySelector(".ai-video-full");
    function setPlaying(p) { aiVideo.classList.toggle("playing", p); }
    function updSound() { soundBtn.classList.toggle("muted", v.muted); }
    function tryPlay() {
      vids.forEach((el) => { const p = el.play(); if (p && p.catch) p.catch(() => {}); });
      if (!v.paused) setPlaying(true);
      else setPlaying(false);
    }
    function pauseAll() { vids.forEach((el) => el.pause()); setPlaying(false); }
    function toggle() { if (v.paused) tryPlay(); else pauseAll(); }
    // keep the blurred backdrop in step with the main video
    function syncBg() { if (bg && Math.abs(bg.currentTime - v.currentTime) > 0.3) bg.currentTime = v.currentTime; }
    v.addEventListener("play", () => { setPlaying(true); if (bg) bg.play().catch(() => {}); });
    v.addEventListener("pause", () => { setPlaying(false); if (bg) bg.pause(); });
    v.addEventListener("timeupdate", syncBg);
    v.addEventListener("click", toggle);
    playBtn.addEventListener("click", toggle);
    soundBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      v.muted = !v.muted;          // only the foreground carries audio
      if (bg) bg.muted = true;
      if (!v.muted && v.paused) tryPlay();
      updSound();
    });
    if (fullBtn) {
      fullBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const el = aiVideo;
        if (document.fullscreenElement) document.exitFullscreen();
        else if (el.requestFullscreen) el.requestFullscreen();
        else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); // iOS
      });
    }
    updSound();

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) tryPlay(); else pauseAll(); });
      }, { threshold: 0.35 });
      io.observe(aiVideo);
    } else {
      tryPlay();
    }
  }

  /* ---------- hero background slideshow ---------- */
  const heroSlides = document.querySelectorAll(".hero-slide");
  if (heroSlides.length > 1) {
    let hi = 0;
    heroSlides[0].classList.add("is-on");
    setInterval(() => {
      if (document.hidden) return;
      heroSlides[hi].classList.remove("is-on");
      hi = (hi + 1) % heroSlides.length;
      heroSlides[hi].classList.add("is-on");
    }, 5000);
  }

  /* ---------- contact form (AJAX → email) ---------- */
  const cf = document.getElementById("contactForm");
  if (cf) {
    const status = document.getElementById("cfStatus");
    const success = document.getElementById("cfSuccess");
    const endpoint = "https://formsubmit.co/ajax/rohitaddanki3761@gmail.com";
    cf.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (cf._honey && cf._honey.value) return; // spam trap
      const btn = cf.querySelector("button[type=submit]");
      const label = btn.querySelector(".btn-text");
      const original = label ? label.textContent : "";
      if (label) label.textContent = "Sending…";
      btn.disabled = true;
      status.className = "cf-status";
      status.textContent = "";
      try {
        const data = new FormData(cf);
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && (json.success === "true" || json.success === true)) {
          cf.style.display = "none";
          success.hidden = false;
        } else {
          throw new Error(json.message || "Submission failed");
        }
      } catch (err) {
        status.className = "cf-status err";
        status.innerHTML =
          'Couldn\'t send just now. Please email us directly at ' +
          '<a href="mailto:rohitaddanki3761@gmail.com" style="color:var(--gold)">rohitaddanki3761@gmail.com</a>.';
        if (label) label.textContent = original;
        btn.disabled = false;
      }
    });
  }
})();
