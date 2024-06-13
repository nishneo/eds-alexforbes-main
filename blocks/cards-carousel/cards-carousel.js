import { fetchPlaceholders } from '../../scripts/aem.js';

function updateActiveSlide(slide, entry, mediaQuery) {
  const block = slide.closest('.cards-carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  let prevIndex;

  if (mediaQuery.matches) /* we are in mobile */ {
    prevIndex = slideIndex;
    block.dataset.activeSlide = slideIndex;
  } else {
    const negative = entry.boundingClientRect.x < 0;
    prevIndex = negative ? slideIndex + 1 : Math.max(0, slideIndex - 1);
    block.dataset.activeSlide = negative ? slideIndex : prevIndex;
  }

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    if (idx !== prevIndex) {
      aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    }
  });
}

/**
 * Disables navigation buttons in a carousel if the current slide is at the beginning or end.
 * @param {HTMLElement} slide - The slide element to check.
 */
function disableInfiniteSlide(slide, mediaQuery) {
  const block = slide.closest('.cards-carousel');
  if (!block) return;

  const activeSlide = parseInt(block.dataset.activeSlide, 10);
  const rows = block.querySelectorAll('.carousel-slides > li');
  const lastSlide = rows.length - (mediaQuery.matches ? 1 : 2);

  const navButtons = block.querySelectorAll('.carousel-navigation-buttons > button');
  navButtons[0].disabled = (activeSlide === 0);
  navButtons[1].disabled = (activeSlide === lastSlide);
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(entry.target, entry, mediaQuery);
        disableInfiniteSlide(entry.target, mediaQuery);
      }
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `cards-carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column) => {
    column.classList.add('carousel-slide-content');
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `cards-carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders['cards-carousel'] || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  const handleWidthChange = (mediaQuery) => {
    if (mediaQuery.matches) {
      block.classList.remove('two-per-slide');
    } else {
      block.classList.add('two-per-slide');
    }
  };

  // Initial check
  const mediaQuery = window.matchMedia('(max-width: 600px)');
  handleWidthChange(mediaQuery);
  // Add event listener for changes in the media query
  mediaQuery.addEventListener('change', () => handleWidthChange(mediaQuery));

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
