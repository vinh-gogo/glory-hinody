/**
 * glory-hinody — Blog Stats & Interactions Engine
 * Manages Reactions (Likes), Comments Navigation, and Share Modal.
 */
(function () {
  'use strict';

  var STORE = 'glory_stats_v1';
  var LIKES_STORE = 'glory_user_likes_v1';
  var isEn = document.documentElement.lang === 'en';

  /* ── Storage Helpers ─────────────────────────────────────────── */
  function loadStats() {
    try { return JSON.parse(localStorage.getItem(STORE) || '{}'); }
    catch (e) { return {}; }
  }

  function saveStats(data) {
    try { localStorage.setItem(STORE, JSON.stringify(data)); }
    catch (e) {}
  }

  function loadLikes() {
    try { return JSON.parse(localStorage.getItem(LIKES_STORE) || '{}'); }
    catch (e) { return {}; }
  }

  function saveLikes(data) {
    try { localStorage.setItem(LIKES_STORE, JSON.stringify(data)); }
    catch (e) {}
  }

  function getCleanPath(url) {
    try {
      return new URL(url || location.href, location.origin).pathname;
    } catch (e) {
      return location.pathname;
    }
  }

  /* ── Micro Toast System ───────────────────────────────────────── */
  var toastTimer = null;
  function showToast(message, duration) {
    var toast = document.getElementById('glory-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-show');
    }, duration || 2000);
  }

  /* ── Render Stats & Liked state to DOM ────────────────────────── */
  function renderStats(container, data, isLiked) {
    if (!container) return;
    var likesBtn    = container.querySelector('.stat-likes');
    var commentsBtn = container.querySelector('.stat-comments');
    var sharesBtn   = container.querySelector('.stat-shares');

    var likesCount    = likesBtn ? likesBtn.querySelector('.stat-count') : null;
    var commentsCount = commentsBtn ? commentsBtn.querySelector('.stat-count') : null;
    var sharesCount   = sharesBtn ? sharesBtn.querySelector('.stat-count') : null;

    if (likesCount && data && data.likes != null) likesCount.textContent = data.likes;
    if (commentsCount && data && data.comments != null) commentsCount.textContent = data.comments;
    if (sharesCount && data && data.shares != null) sharesCount.textContent = data.shares;

    if (likesBtn) {
      if (isLiked) {
        likesBtn.classList.add('is-liked');
        likesBtn.title = isEn ? 'Liked (click to unlike)' : 'Đã thích (nhấn để bỏ thích)';
      } else {
        likesBtn.classList.remove('is-liked');
        likesBtn.title = isEn ? 'Like this post' : 'Thích bài viết (Like)';
      }
    }
  }

  /* ── Sync all containers of a specific path on DOM ────────────── */
  function syncPathOnDOM(targetPath) {
    var stats = loadStats();
    var likes = loadLikes();
    var data = stats[targetPath] || { likes: 0, comments: 0, shares: 0 };
    var isLiked = !!likes[targetPath];

    document.querySelectorAll('.post-stats-pill').forEach(function (el) {
      var url = el.getAttribute('data-url');
      var path = url ? getCleanPath(url) : location.pathname;
      if (path === targetPath) {
        renderStats(el, data, isLiked);
      }
    });
  }

  /* ── Initialize List Page Stats ───────────────────────────────── */
  function initListPage() {
    var stats = loadStats();
    var likes = loadLikes();
    document.querySelectorAll('article.post-entry, article.log-entry').forEach(function (article) {
      var link = article.querySelector('a.entry-link');
      var statsEl = article.querySelector('.post-stats-pill');
      if (!statsEl) return;
      var path = link ? getCleanPath(link.href) : (statsEl.getAttribute('data-url') ? getCleanPath(statsEl.getAttribute('data-url')) : null);
      if (!path) return;
      var data = stats[path] || { likes: 0, comments: 0, shares: 0 };
      renderStats(statsEl, data, !!likes[path]);
    });
  }

  /* ── Initialize Post Page Stats ───────────────────────────────── */
  function initPostPage() {
    var stats = loadStats();
    var likes = loadLikes();
    var path = location.pathname;
    var statsEl = document.querySelector('.single-post-meta .post-stats-pill');
    if (statsEl) {
      var data = stats[path] || { likes: 0, comments: 0, shares: 0 };
      renderStats(statsEl, data, !!likes[path]);
    }
  }

  /* ── Share Modal Controller ───────────────────────────────────── */
  var activeShareUrl = '';
  var activeShareTitle = '';

  function openShareModal(url, title) {
    var modal = document.getElementById('share-modal');
    if (!modal) return;

    activeShareUrl = url || window.location.href;
    activeShareTitle = title || document.title;

    var titleEl = document.getElementById('share-target-title');
    var inputEl = document.getElementById('share-link-input');
    var copyBtn = document.getElementById('share-link-copy-btn');
    var nativeWrap = document.getElementById('share-native-wrap');

    if (titleEl) titleEl.textContent = activeShareTitle;
    if (inputEl) inputEl.value = activeShareUrl;
    if (copyBtn) copyBtn.textContent = isEn ? '[COPY LINK]' : '[SAO CHÉP LIÊN KẾT]';

    if (nativeWrap) {
      if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
        nativeWrap.style.display = 'block';
      } else {
        nativeWrap.style.display = 'none';
      }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeShareModal() {
    var modal = document.getElementById('share-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function recordShare(url) {
    var path = getCleanPath(url);
    var stats = loadStats();
    var current = stats[path] || { likes: 0, comments: 0, shares: 0 };
    current.shares = (current.shares || 0) + 1;
    stats[path] = current;
    saveStats(stats);
    syncPathOnDOM(path);
  }

  function initShareModal() {
    var modal = document.getElementById('share-modal');
    if (!modal) return;

    var closeBtn = document.getElementById('share-modal-close-btn');
    var backdrop = document.getElementById('share-modal-backdrop');
    var copyBtn  = document.getElementById('share-link-copy-btn');
    var nativeBtn = document.getElementById('share-native-btn');

    if (closeBtn) closeBtn.addEventListener('click', closeShareModal);
    if (backdrop) backdrop.addEventListener('click', closeShareModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeShareModal();
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        if (!activeShareUrl) return;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(activeShareUrl).then(function () {
            copyBtn.textContent = isEn ? '[COPIED! ✓]' : '[ĐÃ SAO CHÉP! ✓]';
            recordShare(activeShareUrl);
            showToast(isEn ? '✅ Link copied to clipboard!' : '✅ Đã sao chép liên kết vào bộ nhớ tạm!');
            setTimeout(function () {
              copyBtn.textContent = isEn ? '[COPY LINK]' : '[SAO CHÉP LIÊN KẾT]';
            }, 2000);
          });
        }
      });
    }

    if (nativeBtn) {
      nativeBtn.addEventListener('click', function () {
        if (navigator.share) {
          navigator.share({
            title: activeShareTitle,
            url: activeShareUrl
          }).then(function () {
            recordShare(activeShareUrl);
            showToast(isEn ? '✅ Shared successfully!' : '✅ Đã chia sẻ thành công!');
            closeShareModal();
          }).catch(function () {});
        }
      });
    }

    /* Channels */
    modal.querySelectorAll('.share-channel-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var platform = btn.getAttribute('data-platform');
        var shareUrl = '';
        var u = encodeURIComponent(activeShareUrl);
        var t = encodeURIComponent(activeShareTitle);

        if (platform === 'facebook') {
          shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
        } else if (platform === 'x') {
          shareUrl = 'https://x.com/intent/tweet?text=' + t + '&url=' + u;
        } else if (platform === 'linkedin') {
          shareUrl = 'https://www.linkedin.com/sharing/share-offsite/?url=' + u;
        } else if (platform === 'telegram') {
          shareUrl = 'https://t.me/share/url?url=' + u + '&text=' + t;
        }

        if (shareUrl) {
          window.open(shareUrl, '_blank', 'noopener,noreferrer,width=620,height=520');
          recordShare(activeShareUrl);
          showToast(isEn ? 'Opening ' + platform + '...' : 'Đang mở ' + platform + '...');
        }
      });
    });
  }

  /* ── Interactive Click Delegations ────────────────────────────── */
  document.addEventListener('click', function (e) {
    /* 1. REACTION / LIKE BUTTON */
    var likeBtn = e.target.closest('.stat-likes');
    if (likeBtn) {
      e.preventDefault();
      e.stopPropagation();

      var pill = likeBtn.closest('.post-stats-pill');
      var url = likeBtn.getAttribute('data-url') || (pill ? pill.getAttribute('data-url') : null) || location.href;
      var path = getCleanPath(url);

      var stats = loadStats();
      var likes = loadLikes();
      var current = stats[path] || { likes: 0, comments: 0, shares: 0 };
      var isLiked = !!likes[path];

      if (isLiked) {
        delete likes[path];
        current.likes = Math.max(0, (current.likes || 1) - 1);
        saveLikes(likes);
        stats[path] = current;
        saveStats(stats);
        syncPathOnDOM(path);
        showToast(isEn ? 'Like removed' : 'Đã hủy thích bài viết');
      } else {
        likes[path] = true;
        current.likes = (current.likes || 0) + 1;
        saveLikes(likes);
        stats[path] = current;
        saveStats(stats);
        syncPathOnDOM(path);
        showToast(isEn ? '❤️ Liked this post!' : '❤️ Cảm ơn bạn đã thích bài viết!');
      }
      return;
    }

    /* 2. COMMENTS BUTTON */
    var commentBtn = e.target.closest('.stat-comments');
    if (commentBtn) {
      e.preventDefault();
      e.stopPropagation();

      var commentsSection = document.getElementById('comments');
      var sidebar = document.getElementById('post-sidebar-left');
      var target = sidebar || commentsSection;
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        if (sidebar) sidebar.classList.add('highlight-flash');
        if (commentsSection) commentsSection.classList.add('highlight-flash');
        setTimeout(function () {
          if (sidebar) sidebar.classList.remove('highlight-flash');
          if (commentsSection) commentsSection.classList.remove('highlight-flash');
        }, 1800);
      } else {
        var pill = commentBtn.closest('.post-stats-pill');
        var url = commentBtn.getAttribute('data-url') || (pill ? pill.getAttribute('data-url') : null);
        if (url) {
          window.location.href = url + '#comments';
        }
      }
      return;
    }

    /* 3. SHARES BUTTON (POPUPS SHARE MODAL) */
    var shareBtn = e.target.closest('.stat-shares');
    if (shareBtn) {
      e.preventDefault();
      e.stopPropagation();

      var pill = shareBtn.closest('.post-stats-pill');
      var url = shareBtn.getAttribute('data-url') || (pill ? pill.getAttribute('data-url') : null) || location.href;
      var title = shareBtn.getAttribute('data-title') || (pill ? pill.getAttribute('data-title') : null) || document.title;
      openShareModal(url, title);
      return;
    }

    /* 4. Bottom Copy Link Button */
    var bottomCopyBtn = e.target.closest('#btn-copy-share-url');
    if (bottomCopyBtn) {
      recordShare(location.href);
      if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
        navigator.share({
          title: document.title,
          url: window.location.href
        }).catch(function () {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          var oldText = bottomCopyBtn.textContent;
          bottomCopyBtn.textContent = isEn ? '[LINK COPIED!]' : '[ĐÃ SAO CHÉP!]';
          showToast(isEn ? '✅ Link copied to clipboard!' : '✅ Đã sao chép liên kết!');
          setTimeout(function () { bottomCopyBtn.textContent = oldText; }, 2000);
        });
      }
      return;
    }

    /* 5. Bottom Social Share Links */
    var shareLink = e.target.closest(
      'a[href*="facebook.com/shar"],' +
      'a[href*="twitter.com/share"],' +
      'a[href*="x.com/intent"],' +
      'a[href*="t.me/share"],' +
      'a[href*="telegram.me/share"],' +
      'a[href*="whatsapp.com/send"],' +
      'a[href*="linkedin.com/share"]'
    );
    if (shareLink) {
      recordShare(location.href);
    }
  });

  /* ── Giscus Metadata Listener ─────────────────────────────────── */
  window.addEventListener('message', function (e) {
    if (e.origin !== 'https://giscus.app') return;
    var msg = e.data && e.data.giscus;
    if (!msg || !msg.discussion) return;

    var path = location.pathname;
    var stats = loadStats();
    var current = stats[path] || { likes: 0, comments: 0, shares: 0 };

    /* Parse giscus reactions */
    var giscusLikes = 0;
    if (msg.discussion.reactionGroups && Array.isArray(msg.discussion.reactionGroups)) {
      giscusLikes = msg.discussion.reactionGroups.reduce(function (s, g) {
        return s + (g.count || 0);
      }, 0);
    } else if (msg.discussion.reactions) {
      giscusLikes = Object.values(msg.discussion.reactions).reduce(function (s, v) {
        return s + (typeof v === 'number' ? v : 0);
      }, 0);
    }

    /* If user liked locally, ensure count >= giscusLikes */
    var likes = loadLikes();
    var localLiked = !!likes[path];
    current.likes = Math.max(current.likes || 0, giscusLikes + (localLiked ? 1 : 0));

    if (msg.discussion.totalCommentCount != null) {
      current.comments = msg.discussion.totalCommentCount;
    }

    current.updated = Date.now();
    stats[path] = current;
    saveStats(stats);
    syncPathOnDOM(path);
  });

  /* ── Bootstrap ────────────────────────────────────────────────── */
  function initAll() {
    initListPage();
    initPostPage();
    initShareModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
