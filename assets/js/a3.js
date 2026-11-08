// A3: five chambers, five jobs. One chamber is lit at a time and its caption shows.
// Hover, focus or tap picks a chamber; when idle it moves on every 3 s (calm: 4.8 s).
// Reduced motion: no idle cycling (dots are hidden in CSS); hover / focus still pick a chamber.
// The dots run while the diagram is on screen and pause when it is not.
(function () {
  var mods = document.querySelectorAll(".a3");
  if (!mods.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var uid = 0;
  var all = [];

  mods.forEach(function (el) {
    var chs = [].slice.call(el.querySelectorAll(".a3-ch"));
    var caps = [].slice.call(el.querySelectorAll(".a3-cap"));
    var wires = [].slice.call(el.querySelectorAll(".a3-wire"));
    var svgs = [].slice.call(el.querySelectorAll(".a3-wires"));
    if (!chs.length) return;
    var calm = el.classList.contains("a3--calm");
    var order = chs.map(function (c) { return c.getAttribute("data-a3"); });
    var idx = 0, hold = false, visible = true, timer = null;
    uid += 1;

    el.classList.add("a3--js");

    chs.forEach(function (c) {
      var k = c.getAttribute("data-a3");
      var cap = el.querySelector('.a3-cap[data-a3="' + k + '"]');
      if (!cap) return;
      if (!cap.id) cap.id = "a3-" + uid + "-" + k;
      c.setAttribute("aria-describedby", cap.id);
    });

    if (calm) { // slower dots
      el.querySelectorAll("animateMotion").forEach(function (a) {
        a.setAttribute("dur", (parseFloat(a.getAttribute("dur")) * 1.6).toFixed(2) + "s");
        a.setAttribute("begin", (parseFloat(a.getAttribute("begin")) * 1.6).toFixed(2) + "s");
      });
    }

    function set(k) {
      idx = Math.max(0, order.indexOf(k));
      chs.forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-a3") === k); });
      caps.forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-a3") === k); });
      wires.forEach(function (w) { w.classList.toggle("is-on", k === "cory" || w.getAttribute("data-a3") === k); });
    }
    function tick() {
      if (hold || !visible) return;
      set(order[(idx + 1) % order.length]);
    }
    function restart() {
      clearInterval(timer);
      timer = null;
      if (mq.matches) return;
      timer = setInterval(tick, calm ? 4800 : 3000);
    }
    function pick(c) { hold = true; set(c.getAttribute("data-a3")); }
    function release() { hold = false; restart(); }

    chs.forEach(function (c) {
      c.addEventListener("mouseenter", function () { pick(c); });
      c.addEventListener("mouseleave", function () { if (document.activeElement !== c) release(); });
      c.addEventListener("focus", function () { pick(c); });
      c.addEventListener("blur", release);
      c.addEventListener("click", function () { pick(c); });
    });

    set(order[0]);
    restart();

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          visible = e.isIntersecting;
          svgs.forEach(function (s) {
            if (!s.pauseAnimations) return;
            if (visible && !mq.matches) s.unpauseAnimations(); else s.pauseAnimations();
          });
        });
      }, { threshold: 0.15 }).observe(el);
    }

    all.push({ restart: restart, svgs: svgs });
  });

  var onChange = function () {
    all.forEach(function (m) {
      m.restart();
      m.svgs.forEach(function (s) { if (s.pauseAnimations) { if (mq.matches) s.pauseAnimations(); else s.unpauseAnimations(); } });
    });
  };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
