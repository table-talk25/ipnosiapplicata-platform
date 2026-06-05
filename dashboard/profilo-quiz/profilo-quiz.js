function profiloPage() {
  return {
    loading: true,
    fetchError: false,
    user: {},
    profile: null,
    profileLetter: '',
    activeTab: 'profilo',
    showUserMenu: false,

    async init() {
      const pb = new PocketBase('https://app.ipnosiapplicata.it');
      const overlay = document.getElementById('loading-overlay');

      function hideOverlay() {
        if (overlay) { overlay.classList.add('hidden'); }
        setTimeout(() => { if (overlay) overlay.style.display = 'none'; }, 400);
      }

      // Auth check
      if (!pb.authStore.isValid) {
        window.location.href = '/login/?redirect=' + encodeURIComponent(window.location.pathname);
        return;
      }

      try {
        const userId = pb.authStore.model.id;
        this.user = pb.authStore.model;

        // Fetch quiz result
        let quizResult = null;
        try {
          const results = await pb.collection('quiz_results').getList(1, 1, {
            filter: `user = "${userId}"`,
            sort: '-created'
          });
          if (results.items.length > 0) {
            quizResult = results.items[0];
          }
        } catch(e) {
          console.warn('quiz_results fetch:', e);
        }

        if (!quizResult) {
          this.loading = false;
          hideOverlay();
          return;
        }

        this.profileLetter = quizResult.profile || '';

        // Fetch profile content
        try {
          const profiles = await pb.collection('quiz_profiles').getList(1, 1, {
            filter: `letter = "${this.profileLetter}"`
          });
          if (profiles.items.length > 0) {
            const p = profiles.items[0];
            // Resolve audio URLs
            if (p.audio_descrizione) {
              p.audio_descrizione = pb.files.getUrl(p, p.audio_descrizione);
            }
            if (p.audio_ipnotico) {
              p.audio_ipnotico = pb.files.getUrl(p, p.audio_ipnotico);
            }
            this.profile = p;
          }
        } catch(e) {
          console.warn('quiz_profiles fetch:', e);
        }

        this.loading = false;
        hideOverlay();

        // Scroll reveal
        this.$nextTick(() => {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
          }, { threshold: 0.1 });
          document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
        });

      } catch(err) {
        console.error('profiloPage init error:', err);
        this.fetchError = true;
        this.loading = false;
        hideOverlay();
      }
    },

    logout() {
      const pb = new PocketBase('https://app.ipnosiapplicata.it');
      pb.authStore.clear();
      window.location.href = '/login/';
    }
  };
}
