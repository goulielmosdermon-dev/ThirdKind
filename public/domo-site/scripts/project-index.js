const projectSearch = document.querySelector('#project-search');
const projectCards = [...document.querySelectorAll('.project-index-gallery .project-image')];
const projectFilters = [...document.querySelectorAll('.project-filter')];
const emptyProjects = document.querySelector('.project-index-empty');
const clearProjectSearch = document.querySelector('.project-search-clear');
const projectStatus = document.querySelector('.project-results-status');
let selectedProjectCategory = 'All';
const normalizeProjectText = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/ς/g, 'σ');
function filterProjectIndex() {
  const query = normalizeProjectText(projectSearch.value.trim());
  let visible = 0;
  projectCards.forEach(card => {
    const matchesCategory = selectedProjectCategory === 'All' || card.dataset.category === selectedProjectCategory;
    const matchesSearch = normalizeProjectText(card.dataset.search).includes(query);
    card.hidden = !(matchesCategory && matchesSearch);
    if (!card.hidden) {
      card.dataset.layout = ['small', 'large', 'right'][visible % 3];
      visible++;
    }
  });
  emptyProjects.hidden = visible > 0;
  clearProjectSearch.hidden = !projectSearch.value;
  const count = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
  projectStatus.textContent = window.DomoI18n?.t(count) || count;
}
projectSearch.addEventListener('input', filterProjectIndex);
document.querySelector('.project-search').addEventListener('submit', event => {event.preventDefault();filterProjectIndex();});
projectFilters.forEach(button => button.addEventListener('click', () => {
  selectedProjectCategory = button.dataset.filter;
  projectFilters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  filterProjectIndex();
}));
clearProjectSearch.addEventListener('click', () => {projectSearch.value = '';filterProjectIndex();projectSearch.focus();});
document.querySelector('#reset-project-filters').addEventListener('click', () => {
  projectSearch.value = '';
  selectedProjectCategory = 'All';
  projectFilters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === 'All')));
  filterProjectIndex();
  projectSearch.focus();
});

window.addEventListener('languagechange', filterProjectIndex);
