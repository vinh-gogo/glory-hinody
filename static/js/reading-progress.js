(function() {
  function initReadingProgress() {
    var progressBar = document.getElementById('reading-progress-bar');
    if (!progressBar) return;

    function updateProgress() {
      var docElem = document.documentElement;
      var docBody = document.body;
      var scrollTop = docElem.scrollTop || docBody.scrollTop;
      var scrollHeight = (docElem.scrollHeight || docBody.scrollHeight) - docElem.clientHeight;
      var percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      progressBar.style.width = Math.min(Math.max(percent, 0), 100) + '%';
    }

    window.addEventListener('scroll', function() {
      window.requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadingProgress);
  } else {
    initReadingProgress();
  }
})();
