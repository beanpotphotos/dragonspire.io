// A2: chatbot DM versus DragonSpire. Plays once when scrolled into view; Replay restarts it.
// Side by side, both halves play together. Stacked (phones), each half starts when it is reached;
// the caption plays with the DragonSpire half. Reduced motion: never armed, the end state shows.
(function () {
  var mods = document.querySelectorAll(".a2");
  if (!mods.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mq.matches) return;

  mods.forEach(function (el) {
    var bot = el.querySelector(".a2__side--bot");
    var ds = el.querySelector(".a2__side--ds");
    var foot = el.querySelector(".a2__foot");
    var btn = el.querySelector(".a2-replay");
    if (!bot || !ds || !foot) return;
    el.classList.add("a2--armed");

    var timers = [];
    var started = { bot: false, ds: false };

    function k() { return parseFloat(getComputedStyle(el).getPropertyValue("--a2-k")) || 1; }
    function len(scope) { return (parseFloat(scope.getAttribute("data-a2-length")) || 13) * k() * 1000; }
    function stacked() { return ds.offsetTop > bot.offsetTop + 20; }

    function play(scopes) {
      scopes.forEach(function (s) { s.classList.remove("is-playing", "is-done"); });
      void el.offsetWidth; // restart CSS animations
      scopes.forEach(function (s) {
        s.classList.add("is-playing");
        timers.push(setTimeout(function () { s.classList.add("is-done"); }, len(s)));
      });
    }
    function start(which) {
      if (started[which]) return;
      if (!stacked()) { started.bot = started.ds = true; play([bot, ds, foot]); return; }
      started[which] = true;
      play(which === "bot" ? [bot] : [ds, foot]);
    }

    if (btn) btn.addEventListener("click", function () {
      timers.forEach(clearTimeout);
      timers = [];
      started.bot = started.ds = true;
      play([bot, ds, foot]);
    });

    if (!("IntersectionObserver" in window)) { start("bot"); start("ds"); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        start(e.target === bot ? "bot" : "ds");
        if (started.bot) io.unobserve(bot);
        if (started.ds) io.unobserve(ds);
      });
    }, { threshold: 0.3 });
    io.observe(bot);
    io.observe(ds);
  });

  // If the reader switches reduced motion on mid-visit, drop to the still.
  var onChange = function (e) {
    if (!e.matches) return;
    mods.forEach(function (el) { el.classList.remove("a2--armed"); });
  };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
