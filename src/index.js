import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import ApiService from './apiService';
import photosMarkup from './markup/photos.hbs';
import './css/styles.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader-wrapper');
const apiService = new ApiService();

let observerTarget = null;

const lightboxOptions = {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
  enableKeyboard: true,
  animationSpeed: 150,
  fadeSpeed: 200,
};

const observer = new IntersectionObserver(entries => {
  if (entries[0].intersectionRatio <= 0) return;
  onScrollHandler();
});

const lightbox = new SimpleLightbox('.gallery a', lightboxOptions);

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
  updateGallery(photos);
}

async function onScrollHandler() {
  observer.unobserve(observerTarget);
  loader.style.display = 'block';
  const photos = await apiService.loadMorePhotos();
  loader.style.display = 'none';

  if (!photos.length) return;
  updateGallery(photos);
  scrollSmootly();
}

function scrollSmootly() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function updateGallery(photos) {
  gallery.insertAdjacentHTML('beforeend', photosMarkup({ photos }));
  lightbox.refresh();
  observerTarget = gallery.lastElementChild;
  observer.observe(observerTarget);
}
