(() => {
  const section=document.querySelector('.testimonials');
  if(!section)return;
  const slides=[...section.querySelectorAll('[data-testimonial-slide]')];
  const choices=[...section.querySelectorAll('[data-testimonial-select]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0,playing=!reduced.matches,visible=false,timer;
  function controls(){
    choices.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===selected)));
  }
  function schedule(){
    clearTimeout(timer);
    if(!playing||!visible||document.hidden||section.matches(':hover')||section.contains(document.activeElement)||selected===slides.length-1)return;
    const words=slides[selected].querySelector('p').textContent.trim().split(/\s+/).length;
    timer=setTimeout(()=>select(selected+1),Math.max(8000,words*280+2000));
  }
  function select(index,manual=false){
    if(index<0||index>=slides.length)return;
    if(manual)playing=!reduced.matches;
    slides[selected].hidden=true;slides[selected].classList.remove('is-entering');
    selected=index;slides[selected].hidden=false;slides[selected].classList.add('is-entering');
    if(selected===slides.length-1)playing=false;
    controls();schedule();
  }
  choices.forEach((button,index)=>button.addEventListener('click',()=>select(index,true)));
  section.addEventListener('pointerenter',()=>clearTimeout(timer));
  section.addEventListener('pointerleave',schedule);
  section.addEventListener('focusin',()=>clearTimeout(timer));
  section.addEventListener('focusout',()=>setTimeout(schedule,0));
  document.addEventListener('visibilitychange',schedule);
  window.addEventListener('languagechange',()=>{controls();schedule();});
  reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;controls();schedule();}});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.35}).observe(section);
  else{visible=true;schedule();}
  controls();
})();
