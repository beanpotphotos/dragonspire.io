// A7: the approval card. Arms the shared CSS loop (.a7--go) and pauses it while the figure is off screen
// (.a7--paused), so the loop starts from the top the first time it is seen.
// Reduced motion (or no JS): never armed, the still of the approved card shows.
(function () {
  var mods = document.querySelectorAll(".a7");
  if (!mods.length) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");

  function arm(el) {
    if (mq.matches) { el.classList.remove("a7--go", "a7--paused"); return; }
    el.classList.add("a7--go");
  }

  mods.forEach(function (el) {
    el.classList.add("a7--paused");
    arm(el);
    if (!("IntersectionObserver" in window)) { el.classList.remove("a7--paused"); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { el.classList.toggle("a7--paused", !e.isIntersecting && !mq.matches); });
    }, { threshold: 0.2 }).observe(el);
  });

  var onChange = function () { mods.forEach(arm); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
