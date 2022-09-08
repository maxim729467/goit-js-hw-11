import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';

const DEFAULT_PARAMS = {
  key: '21273112-45be21eebf5785c737b42a518',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
};

axios.defaults.baseURL = 'https://pixabay.com/';

class ApiService {
  constructor() {
    this.searchQuery = '';
    this.searchPage = 1;
    this.isLoadMore = true;
    this.loadedImages = 0;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  async getPhotos() {
    this.searchPage = 1;
    this.isLoadMore = true;
    this.loadedImages = 0;
    return this.fetch();
  }

  async loadMorePhotos() {
    if (!this.isLoadMore) {
      Notify.info("We're sorry, but you've reached the end of search results.");
      return [];
    }
    this.searchPage += 1;
    return this.fetch();
  }

  async fetch() {
    try {
      const res = await axios.get('api/', {
        params: {
          ...DEFAULT_PARAMS,
          page: this.searchPage,
          q: this.searchQuery,
        },
      });

      if (!res.data.total) {
        Notify.info(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return [];
      }

      const { totalHits, hits } = res.data;
      this.loadedImages += hits.length;
      if (this.loadedImages >= totalHits) this.isLoadMore = false;
      if (this.searchPage === 1) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
      }

      return hits;
    } catch (error) {
      Notify.failure(error.message);
      return [];
    }
  }
}

export default ApiService;
