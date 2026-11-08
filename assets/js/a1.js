// A1: the spire assembles. Build once (~8 s), hold 3 s, then loop: dim top-down, relight bottom-up.
// Reduced motion (or no JS): the finished spire, still. Pauses while off screen or in a hidden tab.
(function () {
  var fig = document.querySelector(".a1");
  if (!fig) return;
  var mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var timers = [];
  var onScreen = true;

  var LIVE = 6600, BUILT = 8000, HOLD = 3000, DIM = 1300, RELIGHT = 1900;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function set(cls, on) { fig.classList.toggle(cls, on); }
  function running() { return onScreen && !document.hidden; }

  function still() {
    clear();
    ["a1--go", "a1--live", "a1--dim", "a1--relight", "a1--paused"].forEach(function (c) { set(c, false); });
    set("a1--still", true);
  }

  function cycle() {
    if (!running()) { later(cycle, 500); return; } // wait until it can be seen
    set("a1--relight", false);
    set("a1--dim", true);
    later(function () {
      set("a1--dim", false);
      set("a1--relight", true);
      later(cycle, RELIGHT + HOLD);
    }, DIM);
  }

  function start() {
    clear();
    set("a1--still", false);
    void fig.getBoundingClientRect();
    set("a1--go", true);
    later(function () { set("a1--live", true); }, LIVE);
    later(cycle, BUILT + HOLD);
  }

  function syncPause() { set("a1--paused", !running()); }

  if (mq.matches) still(); else start();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      syncPause();
    }).observe(fig);
  }
  document.addEventListener("visibilitychange", syncPause);

  var onChange = function () { if (mq.matches) still(); else start(); };
  if (mq.addEventListener) mq.addEventListener("change", onChange);
  else if (mq.addListener) mq.addListener(onChange);
})();
