// DragonSpire design system runtime.
document.documentElement.classList.add("js");

// Draw diagrams once when scrolled into view.
(function () {
  var items = document.querySelectorAll(".draw-on-view");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-drawn"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-drawn"); io.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  items.forEach(function (el) { io.observe(el); });
})();

// Light/dark toggle: button[data-theme-toggle] flips data-theme on <html> and remembers it.
// A saved choice is only applied on pages that have a toggle.
(function () {
  var KEY = "ds-theme";
  var html = document.documentElement;
  var buttons = document.querySelectorAll("button[data-theme-toggle]");
  if (!buttons.length) return;
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "light" || saved === "dark") html.setAttribute("data-theme", saved);

  function current() { return html.getAttribute("data-theme") === "light" ? "light" : "dark"; }
  function sync() {
    var next = current() === "light" ? "dark" : "light";
    buttons.forEach(function (b) {
      b.setAttribute("aria-label", "Switch to " + next + " mode");
      b.setAttribute("title", "Switch to " + next + " mode");
    });
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      var next = current() === "light" ? "dark" : "light";
      html.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
      sync();
    });
  });
  sync();
})();

// Phone menu: button[data-nav-toggle] opens and closes its .site-nav.
(function () {
  document.querySelectorAll("button[data-nav-toggle]").forEach(function (btn) {
    var nav = btn.closest(".site-nav");
    if (!nav) return;
    function set(open) {
      nav.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function () { set(!nav.classList.contains("is-open")); });
    nav.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); btn.focus(); }
    });
    nav.querySelectorAll(".site-nav__menu a").forEach(function (a) {
      a.addEventListener("click", function () { set(false); });
    });
  });
})();
