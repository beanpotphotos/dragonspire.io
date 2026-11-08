// DragonSpire.io page script: the numbers strip counts up once when it scrolls into view.
// Without JS or with reduced motion, the final numbers in the markup show.
(function () {
  var strip = document.querySelector(".numbers");
  if (!strip || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var nums = strip.querySelectorAll(".stat__num[data-count]");
  if (!nums.length) return;

  var r = strip.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: leave final values

  function fmt(el, v) {
    var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
    return v.toFixed(d) + (el.getAttribute("data-suffix") || "");
  }
  function run(el) {
    var end = parseFloat(el.getAttribute("data-count"));
    var dur = 1400, t0 = null;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(el, end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  nums.forEach(function (el) { el.textContent = fmt(el, 0); });
  var io = new IntersectionObserver(function (entries) {
    var e = entries[entries.length - 1];
    if (e.isIntersecting) { io.disconnect(); nums.forEach(run); return; }
    if (e.boundingClientRect.bottom < 0) { // jumped past it (anchor, restored scroll): just show the values
      io.disconnect();
      nums.forEach(function (el) { el.textContent = fmt(el, parseFloat(el.getAttribute("data-count"))); });
    }
  }, { threshold: 0.4 });
  io.observe(strip);
})();
