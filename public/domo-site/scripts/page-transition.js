(() => {
  const canonicalPath = path => path.replace(/\/+$/, '') || '/';
  const key = 'domo-page-transition';
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let incoming;
  try {
    incoming = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
  } catch {}
  if (!reduced.matches && incoming && canonicalPath(incoming.path) === canonicalPath(location.pathname) && Date.now() - incoming.time < 15000) {
    root.classList.add('page-entering');
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.replace('page-entering', 'page-revealing');
      }));
    });
  }
  let leaving = false;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download') || reduced.matches) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || canonicalPath(target.pathname) === canonicalPath(location.pathname) || !/^https?:$/.test(target.protocol)) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    root.classList.remove('page-revealing', 'page-entering');
    // Start below the frame even if the previous entry transition has completed above it.
    root.classList.add('page-transition-reset');
    root.getBoundingClientRect();
    root.classList.remove('page-transition-reset');
    root.classList.add('page-leaving');
    const duration = parseFloat(getComputedStyle(root).getPropertyValue('--page-transition-duration'));
    setTimeout(() => {
      try {sessionStorage.setItem(key, JSON.stringify({path:target.pathname,time:Date.now()}));} catch {}
      location.assign(target.href);
    }, duration + 30);
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) {
      leaving = false;
      root.classList.remove('page-entering', 'page-revealing', 'page-leaving', 'page-transition-reset');
    }
  });
})();
