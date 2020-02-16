import {
  filter, find, isEqual, uniqueId, differenceBy,
} from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import render from './renders';
import parseRSS from './parser';
import validate from './validator';

const updateValidationState = (state, texts) => {
  const { feed, form } = state;
  return validate(feed.urls, form.field, texts)
    .then((errors) => {
      form.errors = errors;
      form.valid = isEqual(errors, {});
    });
};

const createFeedData = (url, data, state) => {
  const { feed } = state;
  const id = uniqueId();
  const channel = {
    id,
    title: data.title,
    description: data.desc,
  };
  const news = { id, items: data.items };
  feed.urls = [{ id, url }, ...feed.urls];
  feed.data.channels = [channel, ...feed.data.channels];
  feed.data.news = [news, ...feed.data.news];
};

const updateFeedData = (id, currentNews, state) => {
  const { feed } = state;
  const previousNews = find(feed.data.news, ['id', id]);
  const newItems = differenceBy(currentNews.items, previousNews.items, 'title');
  if (newItems.length !== 0) {
    const updatedNews = { id, items: [...newItems, ...previousNews.items] };
    const unchangedNews = filter(feed.data.news, (el) => el.id !== id);
    feed.data.news = [updatedNews, ...unchangedNews];
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
  const { form, feed } = state;
  const errors = {};

  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response.data);
      if (!feedData) {
        errors.data = texts('errors.feed.data');
        form.processState = 'finished';
        form.valid = false;
      } else {
        form.processState = 'finished';
        form.valid = false;
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
      form.valid = false;
      form.processState = 'finished';
      feed.errors = errors;
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
