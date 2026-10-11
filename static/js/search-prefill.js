(function() {
  function initSearchPrefill() {
    var urlParams = new URLSearchParams(window.location.search);
    var q = urlParams.get('q');
    if (!q) return;

    var searchInput = document.getElementById('searchInput') || document.querySelector('.searchbox input');
    if (!searchInput) return;

    searchInput.value = q;
    var evt = new Event('input', { bubbles: true, cancelable: true });
    searchInput.dispatchEvent(evt);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearchPrefill);
  } else {
    initSearchPrefill();
  }
})();
