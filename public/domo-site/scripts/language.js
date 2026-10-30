(() => {
  const controls = [...document.querySelectorAll('[data-language]')];
  if (!controls.length) return;
  const languageKey = 'domo-language';
  let locale = 'en';
  let dictionary = {};
  try {locale = localStorage.getItem(languageKey) === 'el' ? 'el' : 'en';} catch {}
  // Entity boundaries must not split a sentence into untranslated fragments.
  document.documentElement.normalize();
  const englishText = new WeakMap();
  const englishAttributes = new WeakMap();
  const attributes = ['alt','aria-label','placeholder','title','content'];
  const dynamic = '[data-catalog-dynamic],script,style,.language-switch,svg,[data-reveal-lines],[data-animated-title],.news-caption,.project-results-status,.enquiry-status,[data-location-value]';
  function translate(value) {
    if (locale === 'en') return value;
    const trimmed = value.trim();
    let replacement = dictionary[trimmed];
    if (!replacement && /^\d+ projects?$/.test(trimmed)) {
      const count = parseInt(trimmed,10);
      replacement = `${count} ${count === 1 ? 'έργο' : 'έργα'}`;
    }
    if (!replacement && /[↗←→]$/.test(trimmed)) {
      const label = trimmed.slice(0,-1).trim();
      if (dictionary[label]) replacement = `${dictionary[label]} ${trimmed.slice(-1)}`;
    }
    return replacement ? value.replace(trimmed,replacement) : value;
  }
  window.DomoI18n = {t:translate,get language(){return locale;}};
  function applyLanguage(next) {
    locale = next;
    const walker = document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest(dynamic)) continue;
      if (!englishText.has(node)) englishText.set(node,node.nodeValue);
      node.nodeValue = translate(englishText.get(node));
    }
    document.querySelectorAll('img,[aria-label],input,textarea,iframe,meta[name="description"]').forEach(element => {
      if (element.closest('[data-catalog-dynamic],.language-switch,[data-location-value]') || element.hasAttribute('data-location-photo')) return;
      if (!englishAttributes.has(element)) {
        englishAttributes.set(element,Object.fromEntries(attributes.filter(attribute => element.hasAttribute(attribute)).map(attribute => [attribute,element.getAttribute(attribute)])));
      }
      for (const [attribute,value] of Object.entries(englishAttributes.get(element))) element.setAttribute(attribute,translate(value));
    });
    document.querySelectorAll('[data-animated-title]').forEach(title => {
      const value = translate(title.dataset.animatedTitle);
      if (title.textContent !== value) {
        title.replaceChildren(...Array.from(value,(letter,index) => {
          const span = document.createElement('span');
          span.className = 'division-title-letter';
          span.setAttribute('aria-hidden','true');
          span.style.setProperty('--letter-index',index);
          span.textContent = letter;
          return span;
        }));
      }
      title.setAttribute('aria-label',value);
    });
    document.querySelectorAll('[lang]').forEach(element => {
      if (!element.closest('.language-switch')) element.lang = locale;
    });
    document.documentElement.lang = locale;
    controls.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.language === locale)));
    try {localStorage.setItem(languageKey,locale);} catch {}
    window.dispatchEvent(new CustomEvent('languagechange',{detail:{language:locale}}));
  }
  fetch('/DOMO/data/translations.json').then(response => {
    if (!response.ok) throw new Error('Unable to load language copy');
    return response.json();
  }).then(data => {
    dictionary = {...Object.fromEntries(Object.entries(data.el_to_en).map(([el,en]) => [en,el])),...data.en_to_el};
    controls.forEach(button => button.addEventListener('click',() => applyLanguage(button.dataset.language)));
    applyLanguage(locale);
  }).catch(() => {document.documentElement.lang='en';});
})();
