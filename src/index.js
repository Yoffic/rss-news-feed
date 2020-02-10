import 'bootstrap/dist/css/bootstrap.css';
import { isEqual, uniqueId } from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import render from './renders';
import parseRSS from './parser';
import validate from './validator';

const state = {
  form: {
    processState: 'filling',
    field: '',
    valid: false,
    errors: {},
  },
  feed: {
    urls: [],
    data: {
      channels: [],
      news: [],
    },
    errors: {},
  },
};

const createFeedData = (link, data) => {
  const id = uniqueId();
  const channel = {
    id,
    title: data.title,
    description: data.desc,
  };
  const news = { id, items: data.items };
  state.feed.urls = [{ id, link }, ...state.feed.urls];
  state.feed.data.channels = [channel, ...state.feed.data.channels];
  state.feed.data.news = [news, ...state.feed.data.news];
};

const updateFeedData = (id, data) => {
  const [dataToUpdate] = state.feed.data.news.filter((newsItem) => newsItem.id === id);
  data.items.forEach((item) => {
    const [matchedNews] = dataToUpdate.links.filter((newsItem) => isEqual(newsItem, item));
    if (!matchedNews) {
      dataToUpdate.links = [item, ...dataToUpdate.links];
    }
  });
  const unchangedNews = state.feed.data.news.filter((newsItem) => newsItem.id !== id);
  state.feed.data.news = [dataToUpdate, ...unchangedNews];
};

const addFeedData = (link, feedData) => {
  const [addedUrl] = state.feed.urls.filter((url) => url.link === link);
  if (addedUrl) {
    updateFeedData(addedUrl.id, feedData);
  } else {
    createFeedData(link, feedData);
  }
};

const proxy = 'https://cors-anywhere.herokuapp.com';

const getRSS = (link) => {
  const requestUrl = `${proxy}/${link}`;
  const errors = {};

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then((t) => {
    axios.get(requestUrl)
      .then((response) => {
        const feedData = parseRSS(response.data);
        if (!feedData) {
          errors.data = t('errors.feed.data');
          state.form.processState = 'finished';
          state.form.valid = false;
        } else {
          state.form.processState = 'finished';
          state.form.valid = false;
          addFeedData(link, feedData);
          setTimeout(() => getRSS(link), 5000);
        }
      })
      .catch((error) => {
        if (error.request) {
          errors.base = t('errors.feed.base');
        } else if (error.response) {
          errors.direction = t('errors.feed.direction');
        }
      })
      .then(() => {
        state.form.valid = false;
        state.form.processState = 'finished';
        state.feed.errors = errors;
      });
  });
};

const updateValidationState = () => (
  validate(state.feed.urls, state.form.field)
    .then((errors) => {
      state.form.errors = errors;
      state.form.valid = isEqual(errors, {});
    })
);

const form = document.getElementById('form');
const field = document.getElementById('url-address');

field.addEventListener('input', (e) => {
  state.form.field = e.target.value;
  updateValidationState();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  const link = state.form.field;
  state.form.field = '';
  getRSS(link);
});

render(state);
