/**
 * Anonymous user ID persistence.
 * Uses localStorage with cookie fallback for cross-session tracking.
 */
(function () {
  var STORAGE_KEY = 'wedding_user_id';
  var COOKIE_NAME = 'wedding_user_id';
  var COOKIE_MAX_AGE = 31536000; // 1 year

  function generateUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getFromCookie() {
    var match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(value) {
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(value) +
      '; max-age=' + COOKIE_MAX_AGE +
      '; path=/; SameSite=Lax';
  }

  function getOrCreateUserId() {
    var id;
    try {
      id = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      id = null;
    }
    if (!id) {
      id = getFromCookie();
    }
    if (!id) {
      id = generateUuid();
      try {
        localStorage.setItem(STORAGE_KEY, id);
      } catch (e) {}
      setCookie(id);
    }
    return id;
  }

  window.getOrCreateUserId = getOrCreateUserId;
})();
