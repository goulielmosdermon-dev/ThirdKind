const newsPreviews = [...document.querySelectorAll('.news-preview')];
const newsCaptionLink = document.querySelector('.news-caption a');
function selectNews(index) {
  newsCaptionLink.textContent = window.DomoI18n?.t(newsPreviews[index].dataset.title) || newsPreviews[index].dataset.title;
  newsCaptionLink.href = newsPreviews[index].dataset.url;
  newsPreviews.forEach((preview, position) => {
    preview.dataset.distance = String(Math.abs(position - index));
    preview.dataset.selected = String(position === index);
  });
}
let newsHoverTimer;
let newsHoverCandidate=-1;
function clearNewsHover(){clearTimeout(newsHoverTimer);newsHoverCandidate=-1;}
const newsGallery=document.querySelector('.news-gallery');
newsGallery.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse')return;
  const index=newsPreviews.indexOf(event.target.closest('.news-preview'));
  if(index===newsHoverCandidate)return;
  clearNewsHover();
  if(index<0 || newsPreviews[index].dataset.selected==='true')return;
  newsHoverCandidate=index;
  const delay=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--news-hover-delay')) || 240;
  newsHoverTimer=setTimeout(()=>selectNews(index),delay);
});
newsGallery.addEventListener('pointerleave',clearNewsHover);
newsPreviews.forEach((preview, index) => {
  preview.addEventListener('click', () => {clearNewsHover();selectNews(index);});
  preview.addEventListener('focus', () => {clearNewsHover();selectNews(index);});
  preview.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % newsPreviews.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + newsPreviews.length) % newsPreviews.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = newsPreviews.length - 1;
    if (next !== undefined) {event.preventDefault();newsPreviews[next].focus();}
  });
});

window.addEventListener('languagechange', () => selectNews(Math.max(0,newsPreviews.findIndex(preview => preview.dataset.distance === '0'))));

selectNews(Math.max(0,newsPreviews.findIndex(preview => preview.dataset.distance === '0')));
