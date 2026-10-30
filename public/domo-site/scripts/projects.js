const projectImages = document.querySelectorAll('.project-image');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        entry.target.classList.remove('reveal-pending');
        entry.target.classList.add('is-revealing');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.6});
  projectImages.forEach((image, index) => {
    if (index === 0) {
      image.classList.add('is-revealing');
      return;
    }
    image.classList.add('reveal-pending');
    observer.observe(image);
  });
}
