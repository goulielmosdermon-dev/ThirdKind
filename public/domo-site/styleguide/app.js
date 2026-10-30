let toastTimer;
document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{const toast=document.querySelector('.toast');try{await navigator.clipboard.writeText(button.dataset.copy);toast.textContent=`${button.dataset.copy} copied`;}catch{toast.textContent=button.dataset.copy;}toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),1800);}));
document.querySelector('.menu-toggle').addEventListener('click',event=>{const button=event.currentTarget;button.setAttribute('aria-expanded',button.getAttribute('aria-expanded')!=='true');});

const woodArtwork = document.querySelector('.wood-artwork');
const woodStrokeSelect = document.querySelector('#wood-stroke-select');
const woodPaths = [...woodArtwork.querySelectorAll('.wood-stroke')];
function replayWood() {
 const selected = woodStrokeSelect.value;
 const stagger = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--wood-draw-stagger'));
 woodPaths.forEach(path => {path.classList.remove('is-drawing');path.classList.toggle('is-muted', selected !== 'all' && path.id !== selected);path.style.animationDelay = '';});
 woodArtwork.getBoundingClientRect();
 woodPaths.filter(path => selected === 'all' || path.id === selected).forEach((path,index) => {path.style.animationDelay = `${index * stagger}ms`;path.classList.add('is-drawing');});
}
document.querySelector('#wood-replay').addEventListener('click', replayWood);
woodStrokeSelect.addEventListener('change', replayWood);
