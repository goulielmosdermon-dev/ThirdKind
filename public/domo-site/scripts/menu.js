const menu = document.querySelector('#main-menu');
const menuTrigger = document.querySelector('.site-header .menu-button');
const inactiveMenuSurfaces = [...document.querySelectorAll('.site-shell > section:not(.hero), .hero-images, .solutions-hero-content, .site-footer, .header-nav')];
let closingMenu = false;
let closeTimer;
function openMenu() {
  if (menu.open) return;
  clearTimeout(closeTimer);
  markCurrentMenuPage();
  closingMenu = false;
  document.body.classList.add('menu-is-open');
  inactiveMenuSurfaces.forEach(surface => {surface.inert = true;});
  menu.show();
  menuTrigger.setAttribute('aria-expanded', 'true');
  menuTrigger.setAttribute('aria-label', window.DomoI18n?.t('Close menu') || 'Close menu');
  menu.getBoundingClientRect();
  menu.classList.add('is-open');
}
function finishClose() {
  if (!closingMenu) return;
  closingMenu = false;
  clearTimeout(closeTimer);
  menu.close();
  document.body.classList.remove('menu-is-open');
  inactiveMenuSurfaces.forEach(surface => {surface.inert = false;});
  menuTrigger.focus({preventScroll:true});
}
function closeMenu() {
  if (!menu.open || closingMenu) return;
  closingMenu = true;
  menu.classList.remove('is-open');
  menuTrigger.setAttribute('aria-expanded', 'false');
  menuTrigger.setAttribute('aria-label', window.DomoI18n?.t('Open menu') || 'Open menu');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {finishClose();return;}
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--menu-slide-duration'));
  closeTimer = setTimeout(finishClose, duration + 100);
}
menuTrigger.addEventListener('click', () => menu.open ? closeMenu() : openMenu());
document.addEventListener('keydown', event => {
  if (!menu.open) return;
  if (event.key === 'Escape') {event.preventDefault();closeMenu();}
  if (event.key === 'Tab') {
    const focusable = [menuTrigger, document.querySelector('.site-header .site-logo'), ...document.querySelectorAll('.language-button'), ...menu.querySelectorAll('a')].filter(link => !link.closest('[inert]') && getComputedStyle(link).visibility !== 'hidden');
    const current = focusable.indexOf(document.activeElement);
    event.preventDefault();
    const next = (current + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
    focusable[next].focus();
  }
});
menu.addEventListener('transitionend', event => {
  if (event.target === menu && event.propertyName === 'transform') finishClose();
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
  if (link.dataset.submenu && window.matchMedia('(hover: none)').matches && menu.dataset.activeSubmenu !== link.dataset.submenu) {
    event.preventDefault();
    activateMenuCategories(link.dataset.submenu);
    return;
  }
  closeMenu();
}));

const menuPrimaryLinks = [...menu.querySelectorAll('.fullscreen-menu-links>a')];
const menuCategoryPanels = [...menu.querySelectorAll('.menu-submenu')];
function activateMenuCategories(name) {
  if (name) menu.dataset.activeSubmenu = name;
  else delete menu.dataset.activeSubmenu;
  menuPrimaryLinks.forEach(link => {
    if (link.dataset.submenu) link.setAttribute('aria-expanded', String(link.dataset.submenu === name));
  });
  menuCategoryPanels.forEach(panel => {
    const active = panel.id === `menu-${name}-categories`;
    panel.classList.toggle('is-active', active);
    panel.inert = !active;
    panel.setAttribute('aria-hidden', String(!active));
  });
}
menuPrimaryLinks.forEach(link => {
  link.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') activateMenuCategories(link.dataset.submenu);
  });
  link.addEventListener('focus', () => activateMenuCategories(link.dataset.submenu));
  link.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && link.dataset.submenu) {
      event.preventDefault();
      activateMenuCategories(link.dataset.submenu);
      menu.querySelector('.menu-submenu.is-active a')?.focus();
    }
  });
});
menuCategoryPanels.forEach(panel => panel.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    menu.querySelector(`.fullscreen-menu-links a[aria-controls="${panel.id}"]`)?.focus();
  }
}));
menu.addEventListener('pointerleave', () => {
  if (!menuCategoryPanels.some(panel => panel.contains(document.activeElement))) activateMenuCategories();
});
menu.addEventListener('close', () => activateMenuCategories());

window.addEventListener('languagechange', () => {const label = menu.open && !closingMenu ? 'Close menu' : 'Open menu';menuTrigger.setAttribute('aria-label', window.DomoI18n?.t(label) || label);});

function markCurrentMenuPage(){
  const path=location.pathname;
  menu.querySelectorAll('[aria-current="page"]').forEach(link=>link.removeAttribute('aria-current'));
  menuPrimaryLinks.forEach(link=>{
    const target=new URL(link.href,location.href);
    if(target.origin!==location.origin || target.hash)return;
    if(path===target.pathname || (target.pathname!=='/DOMO/' && path.startsWith(target.pathname)))link.setAttribute('aria-current','page');
  });
  const query=new URLSearchParams(location.search);
  if(path==='/DOMO/living/' && query.has('category')){
    menu.querySelectorAll('.menu-submenu-living a').forEach(link=>{
      const target=new URL(link.href,location.href);
      if(target.pathname===path && target.searchParams.get('category')===query.get('category') && target.searchParams.get('product')===query.get('product') && target.searchParams.get('collection')===query.get('collection'))link.setAttribute('aria-current','page');
    });
  }
}
markCurrentMenuPage();
window.addEventListener('popstate',markCurrentMenuPage);
