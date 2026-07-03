/* ══════════════════════════════════════
   portfolio.js — Elizeu Medeiros (Enhanced)
══════════════════════════════════════ */

/* ── DARK MODE ── */
(function () {
  var body = document.body;

  /* Troca as imagens marcadas com data-src-light / data-src-dark
     conforme o tema atual, sem depender de reflow ou bugs de cache. */
  function syncThemeImages() {
    var isDark = body.classList.contains("dark");
    var imgs = document.querySelectorAll(".theme-img[data-src-light]");
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var wanted = isDark
        ? img.getAttribute("data-src-dark")
        : img.getAttribute("data-src-light");
      if (wanted && img.getAttribute("src") !== wanted) {
        img.setAttribute("src", wanted);
      }
    }
  }

  var btn = document.getElementById("dmToggle");

  try {
    if (localStorage.getItem("em-dark") === "1") body.classList.add("dark");
  } catch (e) {}

  /* Aplica as imagens certas assim que o DOM estiver pronto,
     já respeitando o tema salvo no localStorage. */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncThemeImages);
  } else {
    syncThemeImages();
  }

  if (!btn) return;
  btn.addEventListener("click", function () {
    btn.classList.add("rotating");
    var on = body.classList.toggle("dark");
    try {
      localStorage.setItem("em-dark", on ? "1" : "0");
    } catch (e) {}
    syncThemeImages();
    setTimeout(function () {
      btn.classList.remove("rotating");
    }, 340);
  });
})();

/* ── PROGRESS BAR ── */
(function () {
  var p = document.getElementById("prog");
  if (!p) return;
  window.addEventListener(
    "scroll",
    function () {
      p.style.width =
        (scrollY / (document.body.scrollHeight - innerHeight)) * 100 + "%";
    },
    { passive: true },
  );
})();

/* ── MENU OVERLAY (hambúrguer ⇄ X) ── */
(function () {
  var btn = document.getElementById("menuToggle");
  var overlay = document.getElementById("navOverlay");
  var nl = document.getElementById("navLinks");
  if (!btn || !overlay) return;
  var open = false;

  function setMenu(state) {
    open = state;
    btn.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    overlay.classList.toggle("is-open", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  }

  btn.addEventListener("click", function () {
    setMenu(!open);
  });

  /* fecha ao clicar em qualquer link do menu */
  if (nl) {
    nl.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
  }

  /* fecha com a tecla ESC */
  document.addEventListener("keydown", function (e) {
    if (open && e.key === "Escape") setMenu(false);
  });
})();

/* ══════════════════════════════════════
   PROJECT CARDS — Scroll reveal (grid original)
══════════════════════════════════════ */
(function () {
  /* ══════════════════════════════════════
   PROJECT CARDS — Scroll reveal
══════════════════════════════════════ */
  (function () {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 60px 0px" },
    );

    document.querySelectorAll(".pcard, .ocard").forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      obs.observe(el);
      // fallback: se já está na viewport no load
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) el.classList.add("on");
    });
  })();

  /* ══════════════════════════════════════
   SKILL BARS
══════════════════════════════════════ */
  (function () {
    var bars = document.getElementById("skillBars");
    if (!bars) return;
    var animated = false;
    function animate() {
      if (animated) return;
      animated = true;
      bars.querySelectorAll(".skill-bar-fill").forEach(function (f) {
        f.style.width = f.getAttribute("data-w") + "%";
      });
    }
    new IntersectionObserver(
      function (e) {
        if (e[0].isIntersecting) animate();
      },
      { threshold: 0.2 },
    ).observe(bars);
  })();

  /* ══════════════════════════════════════
   STATS COUNTER ANIMATION
══════════════════════════════════════ */
  (function () {
    var statsBand = document.querySelector(".stats-band");
    if (!statsBand) return;
    var done = false;
    function animateCounters() {
      if (done) return;
      done = true;
      statsBand.querySelectorAll(".sbox-n").forEach(function (el) {
        var original = el.textContent.trim();
        var parsed = original.match(/^([+-]?)(\d+)$/);
        if (!parsed) return;
        var prefix = parsed[1] || "";
        var target = parseInt(parsed[2], 10);
        if (isNaN(target)) return;
        var start = 0;
        var duration = 1200;
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          el.textContent = prefix + Math.round(ease * target);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = prefix + target;
        }
        requestAnimationFrame(step);
      });
    }
    new IntersectionObserver(
      function (e) {
        if (e[0].isIntersecting) animateCounters();
      },
      { threshold: 0.4 },
    ).observe(statsBand);
  })();

  /* ══════════════════════════════════════
   SECTION TITLE REVEAL (char by char)
══════════════════════════════════════ */
  (function () {
    document.querySelectorAll(".sec-h").forEach(function (h) {
      h.classList.add("title-reveal");
    });
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("title-revealed");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 },
    );
    document.querySelectorAll(".title-reveal").forEach(function (el) {
      obs.observe(el);
    });
  })();

  /* ══════════════════════════════════════
   TIMELINE STAGGER REVEAL
══════════════════════════════════════ */
  (function () {
    var items = document.querySelectorAll(".t-item");
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("t-item-on");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );
    items.forEach(function (el, i) {
      el.style.transitionDelay = i * 90 + "ms";
      obs.observe(el);
    });
  })();

  /* ══════════════════════════════════════
   SK-CARD FLIP HOVER REVEAL
══════════════════════════════════════ */
  (function () {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );
    document.querySelectorAll(".sk-card").forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 3) * 70 + "ms";
      obs.observe(el);
    });
  })();

  /* ══════════════════════════════════════
   CERTIFICATIONS STAGGER
══════════════════════════════════════ */
  (function () {
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("on");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
    );
    document.querySelectorAll(".pub-item").forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      obs.observe(el);
    });
  })();

  /* ══════════════════════════════════════
   HERO — SCRAMBLE DECODER
   Usa só letras latinas maiúsculas → mesma fonte, mesmas métricas,
   zero layout shift durante a animação.
══════════════════════════════════════ */
  (function () {
    // Só letras latinas maiúsculas — mesma font-family do hero-name (serif)
    // Garante que nenhum glyph use fallback de sistema com métricas diferentes
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    function randChar() {
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    }

    function runDecoder(el) {
      var target = el.getAttribute("data-text") || "";
      var len = target.length;

      // Cada char sempre com sua cor final — o container .decoder-blue
      // controla a cor (gradiente) via CSS; aqui só marcamos os glyphs
      // embaralhados para o efeito de opacidade/scramble.
      function render(pos) {
        var out = "";
        for (var i = 0; i < len; i++) {
          if (target[i] === " ") {
            out += "\u00a0";
          } else if (i < pos) {
            // Letra revelada: cor final vem do CSS do container
            out += target[i];
          } else {
            // Glyph embaralhado: cor herdada do container (CSS)
            out += '<span class="decoder-glyph">' + randChar() + "</span>";
          }
        }
        el.innerHTML = out;
      }

      render(0);

      var startTime = null;
      var DURATION = 1400;

      function step(ts) {
        if (!startTime) startTime = ts;
        var pos = Math.min(
          len,
          Math.floor(((ts - startTime) / DURATION) * len),
        );
        render(pos);
        if (pos < len) {
          requestAnimationFrame(step);
        } else {
          el.innerHTML = target;
        }
      }

      // Pequeno delay para o browser pintar o estado inicial antes de animar
      requestAnimationFrame(function (ts) {
        requestAnimationFrame(step);
      });
    }

    // Inicia decoders assim que o DOM estiver pronto
    function start() {
      var decoders = document.querySelectorAll(".decoder-text");
      decoders.forEach(function (el) {
        runDecoder(el);
      });

      // Scroll indicators
      setTimeout(function () {
        var si = document.getElementById("scrollIndicator");
        var msi = document.getElementById("mobileScrollIndicator");
        if (si) si.classList.add("is-visible");
        if (msi) msi.classList.add("is-visible");
      }, 2000);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  })();

})();

/* ══════════════════════════════════════
   MODAL
══════════════════════════════════════ */
(function () {
  var overlay = document.getElementById("fileModal");
  var iframe = document.getElementById("modalIframe");
  var closeBtn = document.getElementById("modalClose");
  var titleEl = document.getElementById("modalTitle");
  var loading = document.getElementById("modalLoading");
  var errorBox = document.getElementById("modalError");
  var errorPath = document.getElementById("modalErrorPath");
  if (!overlay || !iframe || !closeBtn) return;

  window.requestPrivateFile = function (label) {
    titleEl.textContent = label || "Material indisponível";
    loading.classList.add("hidden");
    iframe.style.display = "none";
    hideFallback();
    if (errorPath) {
      errorPath.textContent =
        "Este material não está disponível no site no momento.";
    }
    errorBox.classList.add("show");
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  window.openFileModal = function (src, label) {
    var isPdf = /\.pdf$/i.test(src);
    var isImg = /\.(png|jpe?g|gif|webp|svg)$/i.test(src);

    titleEl.textContent = label || src;
    loading.classList.remove("hidden");
    errorBox.classList.remove("show");
    iframe.style.display = "block";
    hideFallback();
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";

    if (isPdf && window.location.protocol === "file:") {
      loading.classList.add("hidden");
      iframe.style.display = "none";
      showPdfFallback(src, label);
      return;
    }
    loadIframe(src);
  };

  function loadIframe(src) {
    var timer = setTimeout(function () {
      showError(src);
    }, 9000);
    iframe.onload = function () {
      clearTimeout(timer);
      setTimeout(function () {
        loading.classList.add("hidden");
      }, 140);
    };
    iframe.onerror = function () {
      clearTimeout(timer);
      showError(src);
    };
    iframe.src = /\.pdf$/i.test(src) ? src + "#toolbar=0&view=FitH" : src;
  }

  function showPdfFallback(src, label) {
    var fb = document.getElementById("modalPdfFallback");
    if (!fb) {
      fb = document.createElement("div");
      fb.id = "modalPdfFallback";
      fb.style.cssText =
        "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.25rem;background:var(--off);padding:2rem;text-align:center;z-index:3;";
      document.querySelector(".modal-body").appendChild(fb);
    }
    fb.style.display = "flex";
    fb.innerHTML =
      '<div style="width:56px;height:56px;border-radius:16px;background:var(--blue-lt);display:flex;align-items:center;justify-content:center;">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>' +
      "</svg></div>" +
      '<p style="font-family:var(--serif);font-size:1.1rem;font-weight:700;color:var(--ink)">' +
      (label || "Documento PDF") +
      "</p>" +
      '<p style="font-size:.8rem;color:var(--muted);max-width:34ch;line-height:1.7">' +
      "Navegadores bloqueiam PDFs locais no popup por segurança.<br>" +
      "Clique abaixo para visualizar em uma nova aba.</p>" +
      '<a href="' +
      src +
      '" target="_blank" rel="noopener" ' +
      'style="display:inline-flex;align-items:center;gap:.55rem;padding:.75rem 1.6rem;background:var(--blue);color:#fff;border-radius:9px;font-size:.8rem;font-weight:700;letter-spacing:.05em;text-decoration:none;box-shadow:0 4px 16px rgba(26,58,255,.3);">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M7 7h10v10"/></svg>' +
      "Abrir PDF</a>";
  }

  function hideFallback() {
    var fb = document.getElementById("modalPdfFallback");
    if (fb) fb.style.display = "none";
  }

  function showError(src) {
    loading.classList.add("hidden");
    iframe.style.display = "none";
    if (errorPath) errorPath.textContent = src;
    errorBox.classList.add("show");
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () {
      iframe.src = "about:blank";
      iframe.style.display = "block";
      errorBox.classList.remove("show");
      loading.classList.remove("hidden");
      hideFallback();
    }, 380);
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });
})();

/* ══════════════════════════════════════
   TIMELINE ALTERNADA — SCROLL PROGRESS
══════════════════════════════════════ */
(function () {
  var progressLine = document.querySelector(".timeline-progress-line");
  var progressContainer = document.querySelector(
    ".timeline-progress-container",
  );
  var dots = document.querySelectorAll(".t-alt-dot");

  if (!progressLine || !progressContainer || !dots.length) return;

  /* Linha de referência fixa na tela: o "ponto de leitura" que avança
     conforme o usuário rola a página (meio da viewport) */
  function updateTimelineProgress() {
    var containerRect = progressContainer.getBoundingClientRect();
    if (containerRect.height <= 0) return;

    var refY = window.innerHeight * 0.5;

    /* Altura preenchida (em px), medida a partir do próprio eixo central,
       não da seção inteira — é o que estava causando o avanço impreciso */
    var filledPx = refY - containerRect.top;
    filledPx = Math.max(0, Math.min(containerRect.height, filledPx));
    var ratio = filledPx / containerRect.height;

    /* Aplica o progresso à barra via transform (evita reflow/repaint de layout) */
    progressLine.style.transform = "scaleY(" + ratio + ")";

    /* Ponto (em coordenadas de viewport) até onde a barra já preencheu */
    var fillFrontY = containerRect.top + filledPx;

    /* Acende cada bolinha exatamente quando a barra do meio a alcança,
       e apaga de volta se o usuário rolar para cima — efeito dinâmico */
    dots.forEach(function (dot) {
      var dotRect = dot.getBoundingClientRect();
      var dotCenterY = dotRect.top + dotRect.height / 2;
      if (dotCenterY <= fillFrontY) {
        dot.classList.add("is-filled");
      } else {
        dot.classList.remove("is-filled");
      }
    });
  }

  /* Agrupa as leituras de scroll/resize em um único rAF por frame,
     em vez de recalcular getBoundingClientRect() a cada evento disparado */
  var ticking = false;
  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateTimelineProgress();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick, { passive: true });

  /* Primeira atualização */
  updateTimelineProgress();
})();

/* ══════════════════════════════════════
   TIMELINE ALTERNADA — ITEM REVEAL
══════════════════════════════════════ */
(function () {
  var obs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  document.querySelectorAll(".t-alt-item").forEach(function (el, i) {
    el.style.transitionDelay = i * 80 + "ms";
    obs.observe(el);
  });
})();

/* cursor padrão do sistema */

/* ══════════════════════════════════════
   SK2 ACCORDION — TECH STACK (HOVER)
══════════════════════════════════════ */
(function () {
  document.querySelectorAll(".sk2-card").forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      card.classList.add("sk2-open");
    });
    card.addEventListener("mouseleave", function () {
      card.classList.remove("sk2-open");
    });
  });
})();
