(() => {
  const canonicalPath = path => path.replace(/\/+$/, '') || '/';
  const storageKey = 'domo-navigation-transition';
  let previous;
  try {
    previous = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    sessionStorage.removeItem(storageKey);
  } catch {}
  let initialStyle;
  if (previous && canonicalPath(previous.path) === canonicalPath(location.pathname) && Date.now() - previous.time < 15000) {
    const values = Object.values(previous.sizes || {});
    if (values.length === 8 && values.every(value => /^\d+(\.\d+)?px$/.test(value))) {
      const size = previous.sizes;
      initialStyle = document.createElement('style');
      initialStyle.textContent = `.site-header{padding:${size.top} ${size.right} ${size.bottom} ${size.left}!important}.site-header .site-logo{width:${size.logo}!important}.site-header .header-nav>:is(span,a){font-size:${size.text}!important}.site-header .menu-button{width:${size.control}!important;height:${size.controlHeight}!important}`;
      document.head.append(initialStyle);
    }
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!initialStyle) return;
    requestAnimationFrame(() => {
      const header = document.querySelector('.site-header');
      if (header) header.getBoundingClientRect();
      requestAnimationFrame(() => initialStyle.remove());
    });
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
    const target = new URL(link.href, location.href);
    if (target.origin !== location.origin || canonicalPath(target.pathname) === canonicalPath(location.pathname)) return;
    const header = document.querySelector('.site-header');
    const logo = header?.querySelector('.site-logo');
    const text = header?.querySelector('.header-nav>:is(span,a)');
    const control = header?.querySelector('.menu-button');
    if (!header || !logo || !text || !control) return;
    const css = getComputedStyle(header);
    const sizes = {top:css.paddingTop,right:css.paddingRight,bottom:css.paddingBottom,left:css.paddingLeft,logo:getComputedStyle(logo).width,text:getComputedStyle(text).fontSize,control:getComputedStyle(control).width,controlHeight:getComputedStyle(control).height};
    try {sessionStorage.setItem(storageKey, JSON.stringify({path:target.pathname,time:Date.now(),sizes}));} catch {}
  }, {capture:true});
})();
