(() => {
  const section=document.querySelector('.locations');
  const photos=[...section.querySelectorAll('[data-location-photo]')];
  const fields=Object.fromEntries([...section.querySelectorAll('[data-location-value]')].map(element=>[element.dataset.locationValue,element]));
  const controls=[...section.querySelectorAll('[data-location-step]')];
  let locations=[];
  let selected=0;
  let visiblePhoto=0;
  let request=0;
  const greek=()=>window.DomoI18n?.language==='el';
  function renderDetails() {
    const place=locations[selected];
    if(!place)return;
    fields.name.textContent=greek()?place.name_el:place.name;
    fields.address.textContent=greek()?place.address_el:place.address;
    fields.phone.textContent=place.phone;fields.phone.href=`tel:${place.telephone}`;
    fields.email.textContent=place.email;fields.email.href=`mailto:${place.email}`;
    const directions=section.querySelector('[data-location-map]');
    if(directions)directions.href='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Domogroup '+place.address);
    fields.count.textContent=`${selected+1} / ${locations.length}`;
    photos[visiblePhoto].alt=greek()?place.image_alt_el:place.image_alt;
  }
  async function selectLocation(index) {
    selected=(index+locations.length)%locations.length;
    const token=++request;
    const place=locations[selected];
    const next=1-visiblePhoto;
    photos[next].src=place.image;
    try {if(photos[next].decode)await photos[next].decode();} catch {}
    if(token!==request)return;
    photos[visiblePhoto].classList.remove('is-active');photos[visiblePhoto].setAttribute('aria-hidden','true');
    visiblePhoto=next;
    photos[visiblePhoto].classList.add('is-active');photos[visiblePhoto].removeAttribute('aria-hidden');
    renderDetails();
  }
  controls.forEach(button=>button.disabled=true);
  fetch('/DOMO/data/locations.json').then(response=>{if(!response.ok)throw new Error('Locations unavailable');return response.json();}).then(data=>{
    locations=data;controls.forEach(button=>button.disabled=false);renderDetails();
    controls.forEach(button=>button.addEventListener('click',()=>selectLocation(selected+Number(button.dataset.locationStep))));
  }).catch(()=>{controls.forEach(button=>button.hidden=true);});
  window.addEventListener('languagechange',renderDetails);
})();
