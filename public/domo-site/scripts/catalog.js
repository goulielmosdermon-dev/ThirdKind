(() => {
  const section = document.querySelector('.division-collection');
  if (!section) return;
  const division = location.pathname.includes('/DOMO/contract') ? 'contract' : 'living';
  const grid = section.querySelector('.division-category-grid');
  const cards = [...grid.querySelectorAll('.division-category')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const language = () => window.DomoI18n?.language || 'en';
  const copy = (en, el) => language() === 'el' ? el : en;
  const text = value => value?.[language()] || value?.en || '';
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let catalog, currentCategory = null, currentProduct = null, busy = false, originalHeight, selectedCard, returnScrollY, currentCollection=null;
  section.classList.add('division-browser');
  const panel = document.createElement('div'); panel.className = 'catalog-panel';panel.setAttribute('data-catalog-dynamic','');panel.hidden = true; section.append(panel);
  const detail = panel.cloneNode(); section.append(detail);
  let pageLocked=false;
  const lockedSiblings=new Map();
  function lockPage(){
    if(pageLocked)return;
    window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top,behavior:'instant'});
    document.documentElement.classList.add('catalog-scroll-locked');
    [...section.parentElement.children,document.querySelector('.site-footer')].forEach(element=>{
      if(!element || element===section)return;
      lockedSiblings.set(element,element.inert);element.inert=true;
    });
    pageLocked=true;
  }
  function unlockPage(){
    document.documentElement.classList.remove('catalog-scroll-locked');
    lockedSiblings.forEach((inert,element)=>element.inert=inert);
    lockedSiblings.clear();pageLocked=false;
  }
  const ready = fetch('/DOMO/data/catalog.json').then(r => {if(!r.ok) throw Error('catalog');return r.json();}).then(data => catalog = data);
  ready.catch(() => {});
  const wait = ms => new Promise(resolve => setTimeout(resolve,reduced.matches ? 0 : ms));
  async function animate(element, frames, duration = 850) {
    if(reduced.matches) return;
    await element.animate(frames,{duration,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}).finished;
    element.getAnimations().forEach(animation => animation.cancel());
  }
  const backLabel = () => copy(`Back to ${division === 'living' ? 'Living' : 'Contract'}`,division === 'living' ? 'Πίσω στην Κατοικία' : 'Πίσω στις Κατασκευές');
  function backButton(){return `<button class="catalog-back" type="button" data-return>← ${backLabel()}</button>`;}
  const kitchenCollections={ithaki:['Ithaki collection','Ithaki'],ios:['Ios collection','Ios'],pelion:['Pelion collection','Pilio'],'porto-heli':['Porto Heli collection','Porto Heli'],gloss:['Gloss collection','Gloss'],rustic:['Rustic collection','Rustic'],athens:['Athens collection','Athina'],kasteli:['Kasteli collection','Kasteli'],kimolos:['Kimolos collection','Kimolos'],mani:['Mani collection','Mani'],nisyros:['Nisyros collection','Nisyros']};
  function title(category){if(category==='kitchens' && currentCollection)return window.DomoI18n?.t(kitchenCollections[currentCollection][0]) || kitchenCollections[currentCollection][0];return text(catalog[category]?.title) || cards.find(c=>c.dataset.category === category)?.querySelector('h2').textContent || category;}
  function products(category){
    const items=catalog[category]?.items || [];
    if(category!=='kitchens' || !currentCollection)return items;
    const match=kitchenCollections[currentCollection][1].toLowerCase();
    return items.filter(item=>item.title.en.toLowerCase().includes(match));
  }
  function renderList(arriving = true){
    panel.innerHTML = `<div class="catalog-panel-head"><h2 class="h1" tabindex="-1">${escape(title(currentCategory))}</h2>${backButton()}</div><div class="catalog-rows">${products(currentCategory).map((p,i)=>`<div class="catalog-row${arriving?' is-arriving':''}" style="--row:${i}"><h3>${escape(text(p.title))}</h3><button class="catalog-read-more" type="button" data-product="${p.id}" aria-label="${escape(copy('Read more about ','Περισσότερα για ')+text(p.title))}">${copy('Read more','Περισσότερα')} <span aria-hidden="true">↗</span></button><img class="catalog-row-preview" src="${encodeURI(p.preview || p.image)}" alt="${escape(text(p.title))}" decoding="async"></div>`).join('')}</div>`;
  }
  function renderProduct(){
    const p=currentProduct;
    detail.innerHTML=`<div class="catalog-panel-head"><button class="catalog-back" type="button" data-list>← ${escape(title(currentCategory))}</button>${backButton()}</div><div class="catalog-product-layout"><img class="catalog-product-image" src="${encodeURI(p.image)}" alt="${escape(text(p.title))}"><div class="catalog-product-copy"><h2 class="h2" tabindex="-1">${escape(text(p.title))}</h2><p class="body">${escape(text(p.copy))}</p><button class="button-primary" type="button" data-enquire>${copy('Interested in this product','Ενδιαφέρομαι για το προϊόν')} <span aria-hidden="true">↗</span></button></div></div>`;
  }
  function writeHistory(){
    const url=new URL(location.href);url.searchParams.set('category',currentCategory);
    if(currentProduct)url.searchParams.set('product',currentProduct.id);else url.searchParams.delete('product');
    history.pushState({catalog:true},'',url);
  }
  async function openCategory(card, write=true){
    if(busy || currentCategory) return;
    busy=true;section.classList.add('is-busy');section.setAttribute('aria-busy','true');
    try{await ready;}catch{busy=false;section.classList.remove('is-busy');section.removeAttribute('aria-busy');location.href=card.dataset.source;return;}
    currentCategory=card.dataset.category;const collection=new URLSearchParams(location.search).get('collection');currentCollection=currentCategory==='kitchens' && kitchenCollections[collection]?collection:null;selectedCard=card;originalHeight=section.getBoundingClientRect().height;
    const initialCardBounds=card.getBoundingClientRect();
    returnScrollY=initialCardBounds.bottom>0 && initialCardBounds.top<window.innerHeight
      ? window.scrollY
      : Math.max(0,window.scrollY+initialCardBounds.top+initialCardBounds.height/2-window.innerHeight/2);
    section.style.height=`${originalHeight}px`;section.getBoundingClientRect();
    card.classList.add('is-selected');section.classList.add('is-selecting');
    cards.filter(c=>c!==card).forEach(c=>c.inert=true);
    section.style.height=`${window.innerHeight}px`;section.classList.add('is-expanded');
    const sectionBounds=section.getBoundingClientRect();
    const cardBounds=card.getBoundingClientRect();
    const headerHeight=document.querySelector('.site-header')?.getBoundingClientRect().height || 0;
    const clearance=headerHeight+24;
    const scale=Math.min(1,Math.max(1,window.innerHeight-clearance*2)/cardBounds.height);
    const x=sectionBounds.width/2-(cardBounds.left-sectionBounds.left+cardBounds.width/2);
    const y=window.innerHeight/2-(cardBounds.top-sectionBounds.top+cardBounds.height/2);
    card.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
    section.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
    await wait(950);
    lockPage();
    await wait(550);
    renderList();panel.hidden=false;
    await Promise.all([animate(grid,[{transform:'translateX(0)',opacity:1},{transform:'translateX(-110%)',opacity:0}],1350),animate(panel,[{transform:'translateX(100%)'},{transform:'translateX(0)'}],1350)]);
    grid.hidden=true;grid.inert=true;
    if(write)writeHistory();
    panel.querySelector('h2').focus({preventScroll:true});
    busy=false;section.classList.remove('is-busy');section.removeAttribute('aria-busy');
  }
  async function openProduct(id,write=true){
    if(busy)return;const p=products(currentCategory).find(p=>p.id===id);if(!p)return;
    busy=true;currentProduct=p;renderProduct();detail.hidden=false;panel.inert=true;
    await Promise.all([animate(panel,[{transform:'translateX(0)'},{transform:'translateX(-100%)'}]),animate(detail,[{transform:'translateX(100%)'},{transform:'translateX(0)'}])]);
    panel.hidden=true;if(write)writeHistory();detail.querySelector('h2').focus({preventScroll:true});busy=false;
  }
  async function showList(write=true){
    if(busy || !currentProduct)return;busy=true;panel.hidden=false;panel.inert=false;
    await Promise.all([animate(detail,[{transform:'translateX(0)'},{transform:'translateX(100%)'}]),animate(panel,[{transform:'translateX(-100%)'},{transform:'translateX(0)'}])]);
    detail.hidden=true;const old=currentProduct.id;currentProduct=null;if(write)writeHistory();panel.querySelector(`[data-product="${old}"]`)?.focus({preventScroll:true});busy=false;
  }
  function restoreGridScroll(){
    const start=window.scrollY;
    if(reduced.matches){window.scrollTo({top:returnScrollY,behavior:'instant'});return Promise.resolve();}
    return new Promise(resolve=>{
      const began=performance.now();
      function frame(now){
        const progress=Math.min(1,(now-began)/950);
        const eased=1-Math.pow(1-progress,3);
        window.scrollTo({top:start+(returnScrollY-start)*eased,behavior:'instant'});
        if(progress<1)requestAnimationFrame(frame);else resolve();
      }
      requestAnimationFrame(frame);
    });
  }
  async function returnHome(write=true){
    if(busy || !currentCategory)return;busy=true;section.classList.add('is-busy');
    const active=currentProduct?detail:panel;grid.hidden=false;grid.inert=false;
    await Promise.all([animate(active,[{transform:'translateX(0)'},{transform:'translateX(100%)'}]),animate(grid,[{transform:'translateX(-110%)',opacity:0},{transform:'translateX(0)',opacity:1}])]);
    panel.hidden=detail.hidden=true;panel.inert=false;selectedCard.style.transform='';section.style.height=`${originalHeight}px`;section.classList.remove('is-expanded');
    await Promise.all([wait(950),restoreGridScroll()]);section.classList.remove('is-selecting');cards.forEach(c=>{c.inert=false;c.classList.remove('is-selected')});
    await wait(500);section.style.height='';unlockPage();selectedCard.focus({preventScroll:true});currentCategory=currentProduct=null;
    if(write){const url=new URL(location.href);url.searchParams.delete('category');url.searchParams.delete('product');url.searchParams.delete('collection');history.pushState({catalog:true},'',url);}
    busy=false;section.classList.remove('is-busy');
  }
  cards.forEach((card,i)=>{
    card.dataset.source=card.href;card.dataset.category=division==='living'?(i===0?'wardrobes':'kitchens'):`contract-${i}`;
    card.href=`?category=${card.dataset.category}`;
    card.addEventListener('click',e=>{if(e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)return;e.preventDefault();openCategory(card);});
  });
  section.addEventListener('click',e=>{if(e.target.closest('[data-return]'))returnHome();else if(e.target.closest('[data-list]'))showList();else if(e.target.closest('[data-product]'))openProduct(e.target.closest('[data-product]').dataset.product);else if(e.target.closest('[data-enquire]'))openEnquiry();});
  const dialog=document.createElement('dialog');dialog.className='catalog-dialog';dialog.setAttribute('data-catalog-dynamic','');document.body.append(dialog);
  let enquiryTrigger;
  function openEnquiry(){
    enquiryTrigger=document.activeElement;
    dialog.innerHTML=`<div class="catalog-dialog-head"><h2>${copy('Product enquiry','Ενδιαφέρον για το προϊόν')}</h2><button class="catalog-close" type="button" aria-label="${copy('Close','Κλείσιμο')}">×</button></div><p>${escape(text(currentProduct.title))}</p><form class="catalog-form"><label>${copy('Full name','Ονοματεπώνυμο')}<input name="name" autocomplete="name" required></label><label>Email<input type="email" name="email" autocomplete="email" required></label><label>${copy('Subject','Θέμα')}<input name="subject" required value="${escape(text(currentProduct.title))}"></label><label>${copy('Your enquiry','Το μήνυμά σας')}<textarea name="message" required></textarea></label><label class="catalog-copy-check"><input type="checkbox" name="copy">${copy('Send me a copy','Στείλτε μου ένα αντίγραφο')}</label><button class="button-primary" type="submit">${copy('Prepare email','Προετοιμασία email')} ↗</button><p class="catalog-form-note">${copy('Review and send your enquiry from your email app.','Ελέγξτε και στείλτε το μήνυμα από την εφαρμογή email σας.')}</p><p class="catalog-form-status" role="status"></p></form>`;
    dialog.showModal();
  }
  dialog.addEventListener('click',e=>{if(e.target===dialog || e.target.closest('.catalog-close'))dialog.close();});
  dialog.addEventListener('close',()=>enquiryTrigger?.focus({preventScroll:true}));
  dialog.addEventListener('submit',e=>{
    e.preventDefault();const form=e.target;if(!form.reportValidity())return;const d=new FormData(form);
    const body=`${copy('Name','Όνομα')}: ${d.get('name')}\nEmail: ${d.get('email')}\n${text(currentProduct.title)}\n${currentProduct.source}\n\n${d.get('message')}`;
    const params=new URLSearchParams({subject:d.get('subject'),body});if(d.get('copy'))params.set('cc',d.get('email'));
    location.href=`mailto:info@domogroup.gr?${params.toString().replace(/\+/g,'%20')}`;
    form.querySelector('.catalog-form-status').textContent=copy('Email draft requested. Review and send it from your email app.','Το προσχέδιο email είναι έτοιμο. Ελέγξτε και στείλτε το από την εφαρμογή email σας.');
  });
  window.addEventListener('languagechange',()=>{if(currentCategory){const y=panel.scrollTop;renderList(false);panel.scrollTop=y;if(currentProduct)renderProduct();}if(dialog.open)dialog.close();});
  window.addEventListener('resize',()=>{if(currentCategory)section.style.height=`${window.innerHeight}px`;});
  async function restoreURL(){
    if(busy){setTimeout(restoreURL,100);return;}const query=new URLSearchParams(location.search),category=query.get('category'),id=query.get('product');
    if(!category){await returnHome(false);return;}
    const card=cards.find(c=>c.dataset.category===category);if(!card)return;
    if(currentCategory && currentCategory!==category)await returnHome(false);
    if(!currentCategory)await openCategory(card,false);
    if(id && currentProduct?.id!==id)await openProduct(id,false);else if(!id && currentProduct)await showList(false);
  }
  window.addEventListener('popstate',restoreURL);
  ready.then(restoreURL).catch(()=>{});
})();
