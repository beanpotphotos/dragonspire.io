// A4: one swing of the axe. Scroll-driven: as the reader scrolls through the steps list named in
// the figure's data-a4-steps (a CSS selector for an <ol>), the token travels between stations and
// the matching beat shows. Without a steps list, progress comes from the figure crossing the screen.
// The figure's parent gets "a4-on" so the page can lay out the scroll steps.
// Reduced motion (or no JS): never armed, the static numbered strip shows.
(function () {
  var figs = document.querySelectorAll(".a4");
  if (!figs.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mods = [];

  figs.forEach(function (fig) {
    var sel = fig.getAttribute("data-a4-steps");
    var list = sel ? document.querySelector(sel) : null;
    var m = {
      fig: fig,
      steps: list ? [].slice.call(list.children) : [],
      track: fig.querySelector(".a4-track"),
      beats: [].slice.call(fig.querySelectorAll(".a4-beat")),
      sts: [].slice.call(fig.querySelectorAll(".a4-st")),
      cur: -1,
      key: ""
    };
    if (m.track && m.beats.length) mods.push(m);
  });
  if (!mods.length) return;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function update(m) {
    var vh = window.innerHeight, b = 0, f = 0, i, r;
    var fr = m.fig.getBoundingClientRect();
    if (m.steps.length) {
      var side = fr.left >= m.steps[0].getBoundingClientRect().right - 1; // steps beside the figure
      var line = side ? vh * 0.55 : clamp(fr.bottom + (vh - fr.bottom) * 0.35, vh * 0.45, vh * 0.85);
      for (i = 0; i < m.steps.length; i++) {
        r = m.steps[i].getBoundingClientRect();
        if (r.top <= line) { b = i; f = (line - r.top) / Math.max(1, r.height); }
      }
    } else {
      var p = clamp((vh * 0.75 - fr.top) / (fr.height + vh * 0.5), 0, 0.9999) * m.beats.length;
      b = Math.floor(p);
      f = p - b;
    }
    b = clamp(b, 0, m.beats.length - 1);
    var beat = m.beats[b];
    var from = +beat.getAttribute("data-from"), to = +beat.getAttribute("data-to");
    var t = ease(clamp(clamp(f, 0, 1) / 0.6, 0, 1));
    m.track.style.setProperty("--pos", (from + (to - from) * t).toFixed(3));

    if (b !== m.cur) {
      m.cur = b;
      m.beats.forEach(function (el, j) { el.classList.toggle("is-on", j === b); });
      m.steps.forEach(function (el, j) { el.classList.toggle("is-active", j === b); });
    }
    var key = b + ":" + (t >= 1);
    if (key !== m.key) {
      m.key = key;
      m.sts.forEach(function (el, j) {
        el.classList.toggle("is-on", j === from || j === to);
        el.classList.toggle("is-here", t >= 1 ? j === to : j === from);
      });
    }
  }

  var armed = false, queued = false;
  function frame() { queued = false; if (armed) mods.forEach(update); }
  function request() { if (!queued) { queued = true; requestAnimationFrame(frame); } }

  function arm(on) {
    armed = on;
    mods.forEach(function (m) {
      m.fig.classList.toggle("a4--armed", on);
      if (m.steps.length && m.fig.parentElement) m.fig.parentElement.classList.toggle("a4-on", on);
      if (!on) {
        m.cur = -1; m.key = "";
        m.beats.concat(m.steps, m.sts).forEach(function (el) { el.classList.remove("is-on", "is-active", "is-here"); });
      }
    });
    if (on) request();
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  arm(!mq.matches);

  var onChange = function (e) { arm(!e.matches); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
