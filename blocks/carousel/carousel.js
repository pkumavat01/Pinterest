import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  block.querySelectorAll('.carousel-slide').forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      link.tabIndex = idx === slideIndex ? 0 : -1;
    });
  });

  block.querySelectorAll('.carousel-slide-indicator').forEach((indicator, idx) => {
    const button = indicator.querySelector('button');
    button.disabled = idx === slideIndex;
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;
  const validIndex = (slideIndex + totalSlides) % totalSlides;
  const targetSlide = slides[validIndex];

  block.querySelector('.carousel-slides')?.scrollTo({
    left: targetSlide.offsetLeft,
    behavior: 'smooth',
  });

  updateActiveSlide(targetSlide);
}

function bindEvents(block) {
  const indicators = block.querySelectorAll('.carousel-slide-indicator button');
  indicators.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.closest('.carousel-slide-indicator').dataset.targetSlide;
      showSlide(block, parseInt(target, 10));
    });
  });

  block.querySelector('.slide-prev')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) - 1);
  });

  block.querySelector('.slide-next')?.addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide || 0, 10) + 1);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-slide').forEach((slide) => observer.observe(slide));
}

function createSlide(row, index, carouselId) {
  const slide = document.createElement('li');
  slide.className = 'carousel-slide';
  slide.dataset.slideIndex = index;
  slide.id = `carousel-${carouselId}-slide-${index}`;

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(colIdx === 0 ? 'carousel-slide-image' : 'carousel-slide-content');
    slide.appendChild(column);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading?.id) {
    slide.setAttribute('aria-labelledby', heading.id);
  }

  return slide;
}

let carouselId = 0;

export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-${carouselId}`;
  const rows = [...block.querySelectorAll(':scope > div')];
  const isSingleSlide = rows.length < 2;
  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.className = 'carousel-slides-container';

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.className = 'carousel-slides';
  container.appendChild(slidesWrapper);

  let slideIndicators;

  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');

    slideIndicators = document.createElement('ol');
    slideIndicators.className = 'carousel-slide-indicators';
    nav.appendChild(slideIndicators);

    const navButtons = document.createElement('div');
    navButtons.className = 'carousel-navigation-buttons';
    navButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.appendChild(navButtons);
    block.appendChild(nav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.appendChild(slide);

    if (slideIndicators) {
      const li = document.createElement('li');
      li.className = 'carousel-slide-indicator';
      li.dataset.targetSlide = idx;
      li.innerHTML = `<button type="button" aria-label="${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.appendChild(li);
    }

    row.remove(); // Remove original slide markup from block
  });

  block.prepend(container);

  if (!isSingleSlide) bindEvents(block);

  
  const selectorItems = document.querySelectorAll('.carousel.selector.block > div');
  console.log(selectorItems)
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 90%)`;
  };

  selectorItems.forEach((item) => {
    item.style.backgroundColor = getRandomColor();
    console.log(getRandomColor())
  });
}
