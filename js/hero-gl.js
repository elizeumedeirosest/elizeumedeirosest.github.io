/* ─────────────────────────────────────────────────────────────
   hero-gl.js  ·  Hero Wave Background  ·  v9-final
   
   Ondas suaves com sombra, surgindo da direita.
   Adapta-se ao dark mode automaticamente.
───────────────────────────────────────────────────────────────*/
(function () {
  "use strict";

  function init() {
    var hero = document.getElementById("hero");
    if (!hero) return;

    var canvas = document.getElementById("hero-gl-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "hero-gl-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;" +
        "z-index:1;pointer-events:none;display:block;";
      hero.insertBefore(canvas, hero.firstChild);
    }

    var ctx = canvas.getContext("2d");
    var W = 1,
      H = 1;

    function resize() {
      W = hero.clientWidth || window.innerWidth;
      H = hero.clientHeight || window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    var t0 = performance.now();
    var slow = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

    /* ── camadas ──────────────────────────────────────────────
       Cada camada: posição base, amplitude, velocidade, fase,
       onde começa o fade-in horizontal (0–1).
       As cores são definidas no draw() com base no dark mode. */
    var LAYERS = [
      { baseY: 0.6, amp: 0.065, speed: 0.13, phase: 0.0, startX: 0.42 },
      { baseY: 0.68, amp: 0.055, speed: 0.1, phase: 1.4, startX: 0.36 },
      { baseY: 0.75, amp: 0.045, speed: 0.08, phase: 2.7, startX: 0.3 },
      { baseY: 0.82, amp: 0.038, speed: 0.06, phase: 1.0, startX: 0.22 },
    ];

    /* ── calcula os vértices Y da onda ao longo de X ─────────*/
    var SEGS = 14; /* mais segmentos → curva mais suave */
    function waveY(layer, t, x) {
      var p = layer.phase;
      var sp = layer.speed;
      var nx = x / W; /* normalizado 0–1 */
      return (
        layer.baseY * H +
        Math.sin(p + t * sp + nx * 4.8) * layer.amp * H +
        Math.sin(p + t * sp * 0.65 + nx * 8.2 + 1.3) * layer.amp * H * 0.42 +
        Math.sin(p + t * sp * 0.4 + nx * 2.9 + 2.8) * layer.amp * H * 0.18
      );
    }

    /* ── desenha uma camada ──────────────────────────────────*/
    function drawWave(layer, t, fillColor, shadowColor) {
      var sx = layer.startX * W;
      var segW = W / SEGS;

      /* coleta pontos da onda */
      var pts = [];
      for (var s = 0; s <= SEGS; s++) {
        pts.push({ x: s * segW, y: waveY(layer, t, s * segW) });
      }

      /* ── 1. Sombra/brilho abaixo da crista ─────────────────
         Gradiente vertical: da cor-sombra logo abaixo da crista
         até totalmente transparente ~30% abaixo.             */
      var minY = pts[0].y;
      for (var i = 1; i <= SEGS; i++) if (pts[i].y < minY) minY = pts[i].y;

      var shadowGrad = ctx.createLinearGradient(0, minY, 0, minY + H * 0.18);
      shadowGrad.addColorStop(0, shadowColor);
      shadowGrad.addColorStop(0.5, shadowColor.replace(/[\d.]+\)$/, "0.06)"));
      shadowGrad.addColorStop(1, shadowColor.replace(/[\d.]+\)$/, "0)"));

      /* ── 2. Gradiente horizontal (fade esquerda → direita) ─*/
      var hGrad = ctx.createLinearGradient(
        sx * 0.4,
        0,
        sx + (W - sx) * 0.55,
        0,
      );
      hGrad.addColorStop(0, fillColor.replace(/[\d.]+\)$/, "0)"));
      hGrad.addColorStop(0.4, fillColor.replace(/[\d.]+\)$/, "0.12)"));
      hGrad.addColorStop(1, fillColor);

      /* ── 3. Constrói o path da onda ─────────────────────── */
      ctx.beginPath();
      ctx.moveTo(0, H);

      /* primeiro ponto */
      ctx.lineTo(pts[0].x, pts[0].y);

      /* bezier cúbico entre cada par de pontos */
      for (var j = 0; j < SEGS; j++) {
        var cp1x = pts[j].x + segW / 3;
        var cp1y = pts[j].y;
        var cp2x = pts[j + 1].x - segW / 3;
        var cp2y = pts[j + 1].y;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pts[j + 1].x, pts[j + 1].y);
      }

      ctx.lineTo(W, H);
      ctx.closePath();

      /* preenche com gradiente horizontal */
      ctx.fillStyle = hGrad;
      ctx.fill();

      /* ── 4. Camada de sombra (sobreposta ao fill) ───────── */
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(pts[0].x, pts[0].y);
      for (var k = 0; k < SEGS; k++) {
        ctx.bezierCurveTo(
          pts[k].x + segW / 3,
          pts[k].y,
          pts[k + 1].x - segW / 3,
          pts[k + 1].y,
          pts[k + 1].x,
          pts[k + 1].y,
        );
      }
      ctx.lineTo(W, H);
      ctx.closePath();

      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = shadowGrad;
      ctx.fill();
      ctx.restore();
    }

    /* ── loop ────────────────────────────────────────────────*/
    var rafId = null;
    var running = false;

    function draw(now) {
      rafId = requestAnimationFrame(draw);

      var t = ((now || performance.now()) - t0) / 1000;
      if (slow) t *= 0.05;

      ctx.clearRect(0, 0, W, H);

      var dark = document.body.classList.contains("dark");

      /* Paleta de cores adaptativa */
      var fills, shadows;
      if (dark) {
        /* dark mode: ondas azul-ardósia sutis */
        fills = [
          "rgba(30,45,80,0.55)",
          "rgba(28,42,74,0.52)",
          "rgba(26,38,68,0.50)",
          "rgba(24,35,62,0.48)",
        ];
        shadows = [
          "rgba(15,25,55,0.30)",
          "rgba(15,25,55,0.28)",
          "rgba(15,25,55,0.26)",
          "rgba(15,25,55,0.24)",
        ];
      } else {
        /* light mode: ondas cinza-lavanda muito suaves */
        fills = [
          "rgba(228,229,240,0.42)",
          "rgba(231,232,242,0.40)",
          "rgba(234,235,244,0.40)",
          "rgba(238,239,247,0.42)",
        ];
        shadows = [
          "rgba(200,202,222,0.18)",
          "rgba(202,204,224,0.16)",
          "rgba(205,207,226,0.15)",
          "rgba(208,210,228,0.14)",
        ];
      }

      for (var i = 0; i < LAYERS.length; i++) {
        drawWave(LAYERS[i], t, fills[i], shadows[i]);
      }
    }

    /* Liga/desliga o loop de desenho. Evita gastar CPU/GPU (e travar
       o scroll no mobile) quando o hero está fora da tela ou a aba
       está em segundo plano — o canvas nunca precisava rodar o tempo
       todo, só enquanto está realmente visível. */
    function play() {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(draw);
    }
    function pause() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting && !document.hidden) play();
          else pause();
        },
        { threshold: 0 },
      );
      io.observe(hero);
    } else {
      play();
    }

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else {
        var r = hero.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) play();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
