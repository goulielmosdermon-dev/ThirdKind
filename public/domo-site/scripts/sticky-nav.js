const stickyHeader = document.querySelector('.site-header');
const heroSection = document.querySelector('.hero');
let navFrame;
function updateNavigationBackground() {
  if (document.body.classList.contains('project-index-page')) {
    const scrolled = window.scrollY > 32;
    stickyHeader.classList.remove('has-background');
    stickyHeader.classList.toggle('is-project-scrolled', scrolled);
    return;
  }
  stickyHeader.classList.toggle('has-background', !heroSection || heroSection.getBoundingClientRect().bottom <= 0);
}
window.addEventListener('scroll', () => {
  cancelAnimationFrame(navFrame);
  navFrame = requestAnimationFrame(updateNavigationBackground);
}, {passive:true});
window.addEventListener('resize', updateNavigationBackground);
window.addEventListener('pageshow', updateNavigationBackground);
updateNavigationBackground();
