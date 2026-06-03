/**
 * nav-avatar.js — IpnosiApplicata
 * Renders the user avatar in the nav (#nav-avatar-wrap).
 * Call renderNavAvatar(avatarUrl, initial) after init().
 */
(function() {
  var PB_URL = 'https://api.ipnosiapplicata.it';

  window.buildNavAvatarUrl = function(userId, filename) {
    if (!userId || !filename) return null;
    return PB_URL + '/api/files/_pb_users_auth_/' + userId + '/' + encodeURIComponent(filename) + '?t=' + Date.now();
  };

  window.renderNavAvatar = function(src, initial) {
    var wrap = document.getElementById('nav-avatar-wrap');
    if (!wrap) return;

    var existingImg = wrap.querySelector('img#nav-avatar-img');
    var existingSpan = wrap.querySelector('span#nav-avatar-initials');

    if (src) {
      if (!existingImg) {
        existingImg = document.createElement('img');
        existingImg.id = 'nav-avatar-img';
        existingImg.alt = 'Avatar';
        existingImg.style.cssText = 'width:36px;height:36px;border-radius:50%;border:2px solid rgba(73,199,165,0.3);object-fit:cover;display:block;';
        existingImg.onerror = function() { renderNavAvatar(null, initial); };
        wrap.insertBefore(existingImg, wrap.firstChild);
      }
      existingImg.src = src;
      existingImg.style.display = 'block';
      if (existingSpan) existingSpan.style.display = 'none';
    } else {
      if (existingImg) existingImg.style.display = 'none';
      if (existingSpan) {
        existingSpan.style.display = '';
        existingSpan.textContent = initial || 'U';
      }
    }
  };
})();
