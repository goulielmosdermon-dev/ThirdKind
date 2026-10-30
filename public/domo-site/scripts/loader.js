(() => {
  const key = 'domo-intro-seen';
  const root = document.documentElement;
  let seen = false;
  try {seen = sessionStorage.getItem(key) === '1';sessionStorage.setItem(key,'1');} catch {}
  if (seen || root.classList.contains('page-entering')) return;
  root.classList.add('site-loading');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let overlay;
  let savedInert = [];
  let done = false;
  function cleanup() {
    if (done) return;
    done = true;
    root.classList.remove('site-loading','loader-exiting');
    overlay?.remove();
    savedInert.forEach(([element,inert]) => {element.inert = inert;});
    window.dispatchEvent(new Event('introcomplete'));
  }
  const domReady = document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded',resolve,{once:true})) : Promise.resolve();
  const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load',resolve,{once:true}));
  const markup = fetch('/DOMO/components/loader.html').then(response => {if(!response.ok) throw new Error('Loader artwork unavailable');return response.text();});
  const delay = duration => new Promise(resolve => setTimeout(resolve,duration));
  Promise.all([domReady,markup]).then(async ([,html]) => {
    if(done) return;
    const wrapper = document.createElement('div');wrapper.innerHTML = html;overlay = wrapper.firstElementChild;
    let greek = false;
    try {greek = localStorage.getItem('domo-language') === 'el';} catch {}
    if (greek) {
      const words = overlay.querySelectorAll('[data-loader-word]');
      words[0].textContent='ΑΠΟ';words[1].parentElement.hidden=true;words[2].textContent='ΞΥΛΟ';
      const lines=overlay.querySelectorAll('.loader-tagline span');
      lines[0].textContent='Η σύγχρονη μορφή';lines[1].textContent='μιας παλιάς τέχνης.';
      overlay.setAttribute('aria-label','Φόρτωση ιστοτόπου');
    }
    savedInert=[...document.body.children].filter(element=>element.tagName!=='SCRIPT').map(element=>[element,element.inert]);
    savedInert.forEach(([element])=>{element.inert=true;});
    document.body.append(overlay);
    const css=getComputedStyle(root);
    const minimum=reduced?0:parseFloat(css.getPropertyValue('--loader-min-time'));
    await Promise.all([delay(minimum),Promise.race([Promise.all([loaded,document.fonts?.ready||Promise.resolve()]),delay(5000)])]);
    if(done) return;
    if(reduced){cleanup();return;}
    root.classList.add('loader-exiting');overlay.classList.add('is-leaving');
    const duration=parseFloat(css.getPropertyValue('--loader-exit-duration'));
    setTimeout(cleanup,duration+50);
  }).catch(cleanup);
  // Never trap the page behind a failed asset or an interrupted navigation.
  setTimeout(cleanup,8000);
  window.addEventListener('pageshow',event=>{if(event.persisted)cleanup();});
})();
