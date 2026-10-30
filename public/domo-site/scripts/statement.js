const statement = document.querySelector('.statement');
const text = statement.querySelector('[data-reveal-lines]');
const phrases = text.innerHTML.split(/<br\s*\/?\s*>/i).map(part => part.trim());

let resizeFrame;
function buildLines() {
  const currentPhrases = phrases.map(phrase => window.DomoI18n?.t(phrase) || phrase);
  const width = statement.clientWidth - parseFloat(getComputedStyle(statement).paddingLeft) - parseFloat(getComputedStyle(statement).paddingRight);
  text.replaceChildren();
  text.setAttribute('aria-label', currentPhrases.join(' '));
  const lines = [];
  for (const phrase of currentPhrases) {
    const measure = document.createElement('span');
    measure.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    text.append(measure);
    let line = '';
    for (const word of phrase.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      measure.textContent = candidate;
      if (line && measure.getBoundingClientRect().width > width) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    measure.remove();
  }
  const stagger = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reveal-stagger'));
  lines.forEach((line, index) => {
    const mask = document.createElement('span');
    mask.className = 'statement-line';
    mask.setAttribute('aria-hidden', 'true');
    const inner = document.createElement('span');
    inner.className = 'statement-line-inner';
    inner.style.transitionDelay = `${index * stagger}ms`;
    inner.textContent = line;
    mask.append(inner);
    text.append(mask);
  });
}
document.fonts.ready.then(() => {
  buildLines();
  if (!('IntersectionObserver' in window)) {statement.classList.add('is-visible');return;}
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      requestAnimationFrame(() => statement.classList.add('is-visible'));
      observer.disconnect();
    }
  }, {threshold: 0.3});
  observer.observe(statement);
});
window.addEventListener('resize', () => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(buildLines);
});

window.addEventListener('languagechange', buildLines);
