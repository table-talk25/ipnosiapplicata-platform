// Loader profilo quiz condiviso dalla dashboard
(function () {
  'use strict';

  const PROFILE_KEYS = ['quizProfile', 'quiz_profile', 'profiloQuiz', 'profilo_quiz', 'quizResult', 'quiz_result', 'userQuizProfile'];

  function profileName(profile) {
    if (!profile) return '';
    if (typeof profile === 'string') return profile.trim();
    if (Array.isArray(profile)) return profile.map(profileName).find(Boolean) || '';
    return String(
      profile.profileName || profile.profile_name || profile.resultProfile || profile.result_profile ||
      profile.name || profile.title || profile.label || profile.profilo || profile.profile || ''
    ).trim();
  }

  function readProfile() {
    for (const key of PROFILE_KEYS) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const name = profileName(parsed);
        if (name) return name;
      } catch (_) {
        const name = profileName(raw);
        if (name) return name;
      }
    }
    return '';
  }

  function updateDashboard(name) {
    const profileBox = document.querySelector('[data-quiz-profile-card], [data-quiz-profile], #quiz-profile, .quiz-profile');
    if (!profileBox) return;

    const title = profileBox.querySelector('[data-quiz-profile-title], [data-profile-label], .quiz-profile-title, h3, h4');
    const description = profileBox.querySelector('[data-quiz-profile-description], .quiz-profile-description, p');
    const cta = profileBox.querySelector('[data-quiz-profile-cta], a[href*="quiz"]');

    if (name) {
      if (title) title.textContent = name;
      if (description) description.textContent = 'Il tuo profilo del Quiz del Coraggio';
      if (cta) cta.style.display = 'none';
      profileBox.classList.add('has-quiz-profile');
    } else {
      if (title) title.textContent = 'Scopri il tuo profilo';
      if (description) description.textContent = 'Fai il Quiz del Coraggio per sbloccare i contenuti personalizzati.';
      if (cta) cta.style.display = '';
      profileBox.classList.remove('has-quiz-profile');
    }
  }

  function loadProfile() {
    updateDashboard(readProfile());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProfile);
  } else {
    loadProfile();
  }

  window.addEventListener('storage', loadProfile);
  window.addEventListener('quiz-profile-updated', loadProfile);
})();