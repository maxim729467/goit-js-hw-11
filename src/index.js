import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';
import ApiService from './apiService';
import photosMarkup from './markup/photos.hbs';
import './css/styles.css';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader-wrapper');
const apiService = new ApiService();
let lightbox;
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
  gallery.insertAdjacentHTML('beforeend', photosMarkup({ photos }));
  loader.style.display = 'none';
  lightbox = new SimpleLightbox('.gallery a', options);
}

window.addEventListener('scroll', throttle(onScrollHandler, 1000));

async function onScrollHandler() {
  if (getScrollTop() < getDocumentHeight() - window.innerHeight) return;

  loader.style.display = 'block';
  const photos = await apiService.loadMorePhotos();
  gallery.insertAdjacentHTML('beforeend', photosMarkup({ photos }));
  loader.style.display = 'none';
  lightbox.refresh();
  scrollSmootly();
}

function getDocumentHeight() {
  const body = document.body;
  const html = document.documentElement;

  return Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
}

function getScrollTop() {
  return window.pageYOffset !== undefined
    ? window.pageYOffset
    : (document.documentElement || document.body.parentNode || document.body)
        .scrollTop;
}

function scrollSmootly() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
