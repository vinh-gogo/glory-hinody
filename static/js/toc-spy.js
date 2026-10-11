(function() {
  function initTocSpy() {
    var tocRail = document.querySelector('.post-toc-rail');
    if (!tocRail) return;

    var headings = document.querySelectorAll('.post-content h2, .post-content h3');
    var tocLinks = tocRail.querySelectorAll('li a');
    if (!headings.length || !tocLinks.length) return;

    var linkMap = {};
    tocLinks.forEach(function(link) {
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        try {
          linkMap[decodeURIComponent(href.slice(1))] = link;
        } catch(e) {
          linkMap[href.slice(1)] = link;
        }
      }
    });

    if (!('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          if (linkMap[id]) {
            tocLinks.forEach(function(l) { l.classList.remove('is-active'); });
            linkMap[id].classList.add('is-active');
          }
        }
      });
    }, {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    });

    headings.forEach(function(h) {
      if (h.id) observer.observe(h);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTocSpy);
  } else {
    initTocSpy();
  }
})();
