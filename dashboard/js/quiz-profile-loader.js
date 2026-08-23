// Loader profilo quiz condiviso dalla dashboard
(function () {
  'use strict';

  function getProfileName(profile) {
    if (!profile) return '';
    return profile.name || profile.title || profile.label || profile.profilo || '';
  }

  function readStoredProfile() {
    const keys = ['quizProfile', 'quiz_profile', 'profiloQuiz', 'profilo_quiz'];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const value = JSON.parse(raw);
        const name = typeof value === 'string' ? value : getProfileName(value);
        if (name) return name;
      } catch (_) {
        const raw = localStorage.getItem(key);
        if (raw) return raw;
      }
    }
    return '';
  }

  function updateLabels(name) {
    if (!name) return;
    document.querySelectorAll('[data-quiz-profile], #quiz-profile, .quiz-profile, [data-profile-label]').forEach((element) => {
      element.textContent = name;
    });
  }

  function loadProfile() {
    updateLabels(readStoredProfile());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfile);
  } else {
    loadProfile();
  }
  window.addEventListener('storage', loadProfile);
})();