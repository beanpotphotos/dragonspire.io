// A6: Dee Emma's table manners. Shows one scene at a time (3 s each, a 12 s loop); the CSS sweeps the
// playhead and pops the notes. While Dee Emma's wave plays (the scene's data-speak="from-to", seconds)
// her avatar lights. Off screen the loop stops; back on screen the current scene replays from its start.
// Reduced motion (or no JS): never armed, the four scenes show as a static strip.
(function () {
  var mods = document.querySelectorAll(".a6");
  if (!mods.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var all = [];

  mods.forEach(function (el) {
    var scenes = [].slice.call(el.querySelectorAll(".a6-scene"));
    var steps = [].slice.call(el.querySelectorAll(".a6-steps li"));
    var avatar = el.querySelector(".a6-avatar");
    if (!scenes.length) return;
    var idx = 0, timers = [], visible = false;

    function k() { return parseFloat(getComputedStyle(el).getPropertyValue("--a6-k")) || 1; }
    function clear() { timers.forEach(clearTimeout); timers = []; if (avatar) avatar.classList.remove("is-speaking"); }

    function show(i) {
      clear();
      idx = i;
      scenes.forEach(function (s) { s.classList.remove("is-on"); });
      steps.forEach(function (s, j) { s.classList.remove("is-on"); s.classList.toggle("is-done", j < i); });
      void el.offsetWidth; // restart the scene's CSS animations
      scenes[i].classList.add("is-on");
      if (steps[i]) steps[i].classList.add("is-on");
      var ms = 1000 * k();
      var sp = (scenes[i].getAttribute("data-speak") || "").split("-");
      if (avatar && sp.length === 2) {
        timers.push(setTimeout(function () { avatar.classList.add("is-speaking"); }, parseFloat(sp[0]) * ms));
        timers.push(setTimeout(function () { avatar.classList.remove("is-speaking"); }, parseFloat(sp[1]) * ms));
      }
      timers.push(setTimeout(function () { show((idx + 1) % scenes.length); }, 3 * ms));
    }

    function arm() {
      clear();
      if (mq.matches) {
        el.classList.remove("a6--go");
        scenes.forEach(function (s) { s.classList.remove("is-on"); });
        return;
      }
      el.classList.add("a6--go");
      if (visible) show(idx); else scenes[idx].classList.add("is-on");
    }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var was = visible;
          visible = e.isIntersecting;
          el.classList.toggle("a6--paused", !visible);
          if (mq.matches) return;
          if (visible && !was) show(idx);
          if (!visible && was) clear();
        });
      }, { threshold: 0.2 }).observe(el);
    } else {
      visible = true;
    }

    arm();
    all.push(arm);
  });

  var onChange = function () { all.forEach(function (f) { f(); }); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
