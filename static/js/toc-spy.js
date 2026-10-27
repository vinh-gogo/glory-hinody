(function () {
  function initTocSpy() {
    var tocRail = document.querySelector('.post-toc-rail');
    if (!tocRail) return;

    var headings = Array.prototype.slice.call(
      document.querySelectorAll('.post-content h2[id], .post-content h3[id]')
    );
    var tocLinks = Array.prototype.slice.call(tocRail.querySelectorAll('li a'));
    if (!headings.length || !tocLinks.length) return;

    var linkMap = {};
    tocLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        try {
          linkMap[decodeURIComponent(href.slice(1))] = link;
        } catch (e) {
          linkMap[href.slice(1)] = link;
        }
      }
    });

    var activeId = '';
    var ticking = false;

    function updateActiveHeading() {
      ticking = false;
      var chosen = headings[0];
      var offset = 148;

      for (var i = 0; i < headings.length; i++) {
        var rect = headings[i].getBoundingClientRect();
        if (rect.top <= offset) {
          chosen = headings[i];
        } else {
          break;
        }
      }

      var nextId = chosen ? chosen.id : '';
      if (!nextId || nextId === activeId || !linkMap[nextId]) return;
      activeId = nextId;

      for (var j = 0; j < tocLinks.length; j++) {
        tocLinks[j].classList.remove('is-active');
      }
      linkMap[nextId].classList.add('is-active');
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateActiveHeading);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateActiveHeading();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTocSpy);
  } else {
    initTocSpy();
  }
})();
