import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ApiService from './apiService';
import photosMarkup from './markup/photos.hbs';
import './css/styles.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader-wrapper');
const apiService = new ApiService();

let lightbox = null;
let observer = null;
let observerTarget = null;

const options = {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
  enableKeyboard: true,
  animationSpeed: 150,
  fadeSpeed: 200,
};

form.addEventListener('submit', onFormSubmit);

async function onFormSubmit(e) {
  e.preventDefault();
  gallery.innerHTML = '';
  const value = e.target.elements.searchQuery.value;

  if (!value.trim().length) return;

  loader.style.display = 'block';
  apiService.query = value;
  const photos = await apiService.getPhotos();
  loader.style.display = 'none';

  if (!photos.length) return;

  gallery.insertAdjacentHTML('beforeend', photosMarkup({ photos }));
  lightbox = new SimpleLightbox('.gallery a', options);
  observerTarget = gallery.lastElementChild;

  observer = new IntersectionObserver(entries => {
    if (entries[0].intersectionRatio <= 0) return;
    onScrollHandler();
  });

  observer.observe(observerTarget);
}

async function onScrollHandler() {
  observer.unobserve(observerTarget);
  loader.style.display = 'block';
  const photos = await apiService.loadMorePhotos();

  if (photos.length) {
    gallery.insertAdjacentHTML('beforeend', photosMarkup({ photos }));
    lightbox.refresh();
    observerTarget = gallery.lastElementChild;
    observer.observe(observerTarget);
    scrollSmootly();
  }

  loader.style.display = 'none';
}

function scrollSmootly() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
