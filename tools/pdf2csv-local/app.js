const languageButtons = document.querySelectorAll('[data-lang]');
const i18nTargets = document.querySelectorAll('[data-i18n]');

const setLanguage = (lang) => {
  i18nTargets.forEach((el) => {
    const targetLang = el.getAttribute('data-i18n');
    if (targetLang === lang) {
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  });

  languageButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
};

languageButtons.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

setLanguage('ja');

// PDF -> CSV conversion logic will be implemented in subsequent tasks.
