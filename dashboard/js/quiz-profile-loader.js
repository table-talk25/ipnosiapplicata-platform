/**
 * Quiz Profile Loader
 * Funzione condivisa per caricare e mostrare il profilo quiz in tutte le pagine della dashboard
 */

async function fetchQuizProfile() {
  try {
    if (!pb || !pb.authStore?.model?.id) {
      console.warn('Quiz Profile Loader: PocketBase non inizializzato o utente non loggato');
      return null;
    }

    const profile = await pb.collection('quiz_results').getFirstListItem(
      `user = "${pb.authStore.model.id}"`,
      { sort: '-created' }
    );

    return profile;
  } catch (error) {
    console.error('Quiz Profile Loader: Errore nel fetch del profilo quiz:', error);
    return null;
  }
}

async function loadQuizProfileToElement(elementId, fieldName = 'profilo') {
  const profile = await fetchQuizProfile();
  
  if (!profile) {
    console.warn('Quiz Profile Loader: Nessun profilo trovato');
    return false;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Quiz Profile Loader: Elemento con ID "${elementId}" non trovato`);
    return false;
  }

  const profileValue = profile[fieldName] || profile.profilo || profile.nome_profilo || 'Profilo non disponibile';
  
  element.textContent = profileValue;
  
  localStorage.setItem('quizProfileName', profileValue);
  localStorage.setItem('quizProfileLastUpdate', Date.now().toString());
  localStorage.setItem('quizProfileData', JSON.stringify(profile));

  console.log('Quiz Profile Loader: Profilo caricato con successo:', profileValue);
  return true;
}

async function refreshQuizProfile(elementId = 'profilo-quiz-header', fieldName = 'profilo') {
  localStorage.removeItem('quizProfileLastUpdate');
  return await loadQuizProfileToElement(elementId, fieldName);
}

window.addEventListener('storage', (e) => {
  if (e.key === 'quizProfileUpdated') {
    const profileName = localStorage.getItem('quizProfileName');
    const headerElement = document.getElementById('profilo-quiz-header');
    if (headerElement && profileName) {
      headerElement.textContent = profileName;
    }
    console.log('Quiz Profile Loader: Profilo aggiornato da storage event:', profileName);
  }
});

function notifyQuizProfileUpdate(profileName) {
  localStorage.setItem('quizProfileName', profileName);
  localStorage.setItem('quizProfileUpdated', Date.now().toString());
}

window.fetchQuizProfile = fetchQuizProfile;
window.loadQuizProfileToElement = loadQuizProfileToElement;
window.refreshQuizProfile = refreshQuizProfile;
window.notifyQuizProfileUpdate = notifyQuizProfileUpdate;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    const headerElement = document.getElementById('profilo-quiz-header');
    if (headerElement) {
      await loadQuizProfileToElement('profilo-quiz-header');
    }
  });
} else {
  (async () => {
    const headerElement = document.getElementById('profilo-quiz-header');
    if (headerElement) {
      await loadQuizProfileToElement('profilo-quiz-header');
    }
  })();
}
