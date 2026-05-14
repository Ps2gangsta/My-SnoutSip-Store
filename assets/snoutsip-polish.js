/* SnoutSip — Scroll reveal
   Tags every <section> on the page with .ss-reveal, then flips
   them to .ss-reveal--in as they enter the viewport. Safe on
   mobile and respects prefers-reduced-motion via the CSS layer. */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sections we never want to fade (header / announcement / marquee)
  var SKIP = [
    'shopify-section-header-group',
    'shopify-section-group-header-group',
    'horizontal-ticker',
    'announcement-bar',
    'header'
  ];
  function shouldSkip(el) {
    if (!el || !el.className) return true;
    var cls = String(el.className);
    for (var i = 0; i < SKIP.length; i++) {
      if (cls.indexOf(SKIP[i]) !== -1) return true;
    }
    // Skip sections inside the header group
    if (el.closest && el.closest('.shopify-section-header-group')) return true;
    if (el.closest && el.closest('.shopify-section-group-header-group')) return true;
    return false;
  }

  function tagSections() {
    var sections = document.querySelectorAll('.shopify-section');
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (shouldSkip(s)) continue;
      if (!s.classList.contains('ss-reveal')) {
        s.classList.add('ss-reveal');
      }
    }
  }

  function reveal(el) { el.classList.add('ss-reveal--in'); }

  function init() {
    tagSections();

    // No motion preference → show everything immediately
    if (prefersReduced || !('IntersectionObserver' in window)) {
      var nodes = document.querySelectorAll('.ss-reveal');
      for (var i = 0; i < nodes.length; i++) reveal(nodes[i]);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry.isIntersecting) {
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      }
    }, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08
    });

    var targets = document.querySelectorAll('.ss-reveal');
    for (var j = 0; j < targets.length; j++) {
      // If already in view on first paint, reveal without delay
      var rect = targets[j].getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        reveal(targets[j]);
      } else {
        io.observe(targets[j]);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Theme editor — re-tag when sections are added/edited
  document.addEventListener('shopify:section:load', tagSections);
  document.addEventListener('shopify:section:reorder', tagSections);
})();
