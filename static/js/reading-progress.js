/**
 * Glory Hinody — GPU-Composited Reading Progress Bar (reading-progress.js v2)
 * Uses transform: scaleX() + single-flight rAF guard (zero layout reflow)
 */
(function () {
  'use strict';

  function initReadingProgress() {
    var progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;

    var ticking = false;

    function updateProgress() {
      ticking = false;
      var docElem = document.documentElement;
      var docBody = document.body;
      var scrollTop = window.pageYOffset || docElem.scrollTop || docBody.scrollTop || 0;
      var scrollHeight = (docElem.scrollHeight || docBody.scrollHeight) - docElem.clientHeight;
      var ratio = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
      progressBar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
    }

    function onScrollOrResize() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingProgress);
  } else {
    initReadingProgress();
  }
})();
