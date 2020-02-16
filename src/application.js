import { isEqual, uniqueId, differenceBy, filter, find } from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import render from './renders';
import parseRSS from './parser';
import validate from './validator';

const updateValidationState = (state, texts) => (
  validate(state.feed.urls, state.form.field, texts)
    .then((errors) => {
      state.form.errors = errors;
      state.form.valid = isEqual(errors, {});
    })
);

const createFeedData = (url, data, state) => {
  const id = uniqueId();
  const channel = {
    id,
    title: data.title,
    description: data.desc,
  };
  const news = { id, items: data.items };
  state.feed.urls = [{ id, url }, ...state.feed.urls];
  state.feed.data.channels = [channel, ...state.feed.data.channels];
  state.feed.data.news = [news, ...state.feed.data.news];
};

const updateFeedData = (id, currentNews, state) => {
  const previousNews = find(state.feed.data.news, ['id', id]);
  const [newItem] = differenceBy(currentNews.items, previousNews.items, 'title');
  if (newItem) {
    const updatedNews = [newItem, ...previousNews.items];
    const unchangedNews = filter(state.feed.data.news, (el) => el.id !== id);
    state.feed.data.news = [updatedNews, ...unchangedNews];
  }
};

const addFeedData = (url, feedData, state) => {
  const addedUrl = find(state.feed.urls, ['url', url]);
  if (addedUrl) {
    updateFeedData(addedUrl.id, feedData, state);
  } else {
    createFeedData(url, feedData, state);
  }
};

const proxy = 'https://cors-anywhere.herokuapp.com';

const getRSS = (url, texts, state) => {
  const requestUrl = `${proxy}/${url}`;
  const errors = {};

  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response.data);
      if (!feedData) {
        errors.data = texts('errors.feed.data');
        state.form.processState = 'finished';
        state.form.valid = false;
      } else {
        state.form.processState = 'finished';
        state.form.valid = false;
        addFeedData(url, feedData, state);
        setTimeout(() => getRSS(url, texts, state), 5000);
      }
    })
    .catch((error) => {
      if (error.request) {
        errors.base = texts('errors.feed.base');
      } else if (error.response) {
        errors.direction = texts('errors.feed.direction');
      }
    })
    .then(() => {
      state.form.valid = false;
      state.form.processState = 'finished';
      state.feed.errors = errors;
    });

};

export default () => {
  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then((t) => {
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

    const form = document.getElementById('form');
    const field = document.getElementById('url-address');

    field.addEventListener('input', (e) => {
      state.form.field = e.target.value;
      updateValidationState(state, t);
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      state.form.processState = 'sending';
      state.form.field = '';
      getRSS(url, t, state);
    });

    render(state);
  });
};
