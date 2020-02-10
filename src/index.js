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
    urlField: '',
    valid: false,
    errors: {},
  },
  feed: {
    channels: [],
    data: {
      names: [],
      items: [],
    },
    errors: {},
  },
};

const createFeedData = (link, data) => {
  const id = uniqueId();
  const name = {
    id,
    title: data.title,
    description: data.desc,
  };
  const items = { id, links: data.items };
  state.feed.channels = [{ link, id }, ...state.feed.channels];
  state.feed.data.names = [name, ...state.feed.data.names];
  state.feed.data.items = [items, ...state.feed.data.items];
};

const updateFeedData = (id, data) => {
  const [dataToUpdate] = state.feed.data.items.filter((item) => item.id === id);
  console.log(dataToUpdate);
  data.items.forEach((element) => {
    const [newLink] = dataToUpdate.links.filter((item) => isEqual(item, element));
    if (!newLink) {
      dataToUpdate.links = [element, ...dataToUpdate.links];
    }
  });
  const unchangedItems = state.feed.data.items.filter((item) => item.id !== id);
  state.feed.data.items = [dataToUpdate, ...unchangedItems];
};

const addFeedData = (link, feedData) => {
  const [addedChannel] = state.feed.channels.filter((channel) => channel.link === link);
  console.log(addedChannel);
  if (addedChannel) {
    updateFeedData(addedChannel.id, feedData);
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
  validate(state.feed.channels, state.form.urlField)
    .then((errors) => {
      state.form.errors = errors;
      state.form.valid = isEqual(errors, {});
    })
);

const form = document.getElementById('form');
const field = document.getElementById('url-address');

field.addEventListener('input', (e) => {
  state.form.urlField = e.target.value;
  updateValidationState();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  const link = state.form.urlField;
  state.form.urlField = '';
  getRSS(link);
});

render(state);
