// A5: three tables. Arms the shared CSS loop (.a5--go) and pauses it while the figure is off screen
// (.a5--paused), so the loop starts from the top the first time it is seen.
// Reduced motion (or no JS): never armed, the still after the hit shows.
(function () {
  var mods = document.querySelectorAll(".a5");
  if (!mods.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  function arm(el) {
    if (mq.matches) { el.classList.remove("a5--go", "a5--paused"); return; }
    el.classList.add("a5--go");
  }

  mods.forEach(function (el) {
    el.classList.add("a5--paused");
    arm(el);
    if (!("IntersectionObserver" in window)) { el.classList.remove("a5--paused"); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { el.classList.toggle("a5--paused", !e.isIntersecting && !mq.matches); });
    }, { threshold: 0.2 }).observe(el);
  });

  var onChange = function () { mods.forEach(arm); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
