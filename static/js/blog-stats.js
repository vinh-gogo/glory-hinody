(function () {
  var STORE = 'glory_stats_v1';

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
    catch (e) { return {}; }
  }

  function save(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); }
    catch (e) {}
  }

  /* ── Hiển thị số lên DOM ──────────────────────────────────── */
  function renderStats(container, data) {
    if (!container || !data) return;
    var likes    = container.querySelector('.stat-likes .stat-count');
    var comments = container.querySelector('.stat-comments .stat-count');
    var shares   = container.querySelector('.stat-shares .stat-count');
    if (likes)    likes.textContent    = data.likes    != null ? data.likes    : '—';
    if (comments) comments.textContent = data.comments != null ? data.comments : '—';
    if (shares)   shares.textContent   = data.shares   != null ? data.shares   : '—';
  }

  /* ── Trang danh sách: đọc cache và hiển thị ──────────────── */
  function initListPage() {
    var stats = load();
    document.querySelectorAll('article.post-entry').forEach(function (article) {
      var link = article.querySelector('a.entry-link');
      if (!link) return;
      var path = new URL(link.href, location.origin).pathname;
      var statsEl = article.querySelector('.post-stats');
      if (statsEl && stats[path]) renderStats(statsEl, stats[path]);
    });
  }

  /* ── Trang bài viết: đọc cache và hiển thị ngay ──────────── */
  function initPostPage() {
    var stats = load();
    var path  = location.pathname;
    var statsEl = document.querySelector('.post-stats');
    if (statsEl && stats[path]) renderStats(statsEl, stats[path]);
  }

  /* ── Nghe Giscus metadata (likes + comments) ─────────────── */
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://giscus.app') return;
    var msg = e.data && e.data.giscus;
    if (!msg || !msg.discussion) return;

    var path    = location.pathname;
    var stats   = load();
    var current = stats[path] || {};

    /* Giscus gửi reactionGroups: [{content, count, viewerHasReacted}] */
    if (msg.discussion.reactionGroups) {
      current.likes = msg.discussion.reactionGroups.reduce(function (s, g) {
        return s + (g.count || 0);
      }, 0);
    } else if (msg.discussion.reactions) {
      /* Fallback nếu format cũ */
      current.likes = Object.values(msg.discussion.reactions).reduce(function (s, v) {
        return s + (typeof v === 'number' ? v : 0);
      }, 0);
    }
    current.comments = msg.discussion.totalCommentCount != null
      ? msg.discussion.totalCommentCount
      : (current.comments || 0);
    current.shares   = current.shares || 0;
    current.updated  = Date.now();

    stats[path] = current;
    save(stats);

    var statsEl = document.querySelector('.post-stats');
    if (statsEl) renderStats(statsEl, current);
  });

  /* ── Đếm click nút share ─────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest(
      'a[href*="facebook.com/shar"],' +
      'a[href*="twitter.com/share"],' +
      'a[href*="x.com/share"],' +
      'a[href*="t.me/share"],' +
      'a[href*="telegram.me/share"],' +
      'a[href*="whatsapp.com/send"],' +
      'a[href*="linkedin.com/shar"]'
    );
    if (!link) return;

    var path    = location.pathname;
    var stats   = load();
    var current = stats[path] || { likes: 0, comments: 0, shares: 0 };
    current.shares = (current.shares || 0) + 1;
    stats[path] = current;
    save(stats);

    /* Cập nhật hiển thị ngay */
    var statsEl = document.querySelector('.post-stats');
    if (statsEl) renderStats(statsEl, current);
  });

  /* ── Khởi chạy ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initListPage();
      initPostPage();
    });
  } else {
    initListPage();
    initPostPage();
  }
})();
