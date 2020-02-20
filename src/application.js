import {
  find, uniqueId, differenceBy,
} from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales';
import render from './renders';
import parseRSS from './parser';
import validate from './validator';

const updateValidationState = (state) => {
  const { feed, form } = state;
  try {
    validate(feed.urls, form.field);
    form.valid = true;
    form.errors = [];
  } catch (error) {
    form.valid = false;
    form.errors = [error.type];
  }
};

const createFeedData = (url, data, state) => {
  const { feed, form } = state;
  const id = uniqueId();
  const channel = {
    id,
    title: data.title,
    description: data.desc,
  };
  const news = { id, items: data.items };
  feed.urls.push({ id, url });
  feed.channels.unshift(channel);
  feed.news.push(news);
  feed.state = 'success';
  form.field = '';
};

const updateFeedData = (id, currentNews, state) => {
  const { feed } = state;
  const newsToUpdate = find(feed.news, ['id', id]);
  const newItems = differenceBy(currentNews.items, newsToUpdate.items, 'title');
  if (newItems.length !== 0) {
    newsToUpdate.items.unshift(...newItems);
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

const getRSS = (url, state) => {
  const requestUrl = `${proxy}/${url}`;
  const { form, feed } = state;
  feed.state = '';

  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response.data);
      form.processState = 'finished';
      addFeedData(url, feedData, state);
      setTimeout(() => getRSS(url, state), 5000);
    })
    .catch((error) => {
      if (error.request) {
        feed.errors = error.request.status === 0 ? ['network'] : ['access'];
      } else {
        feed.errors = [error.type];
      }
      form.processState = 'filling';
      feed.state = 'failed';
    });
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      field: '',
      valid: false,
      errors: [],
    },
    feed: {
      state: '',
      urls: [],
      channels: [],
      news: [],
      errors: [],
    },
  };

  const form = document.getElementById('form');
  const field = document.getElementById('url-address');

  field.addEventListener('input', (e) => {
    state.form.field = e.target.value;
    updateValidationState(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    state.form.processState = 'sending';
    getRSS(url, state);
  });

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  }).then((t) => {
    render(state, t);
  });
};
