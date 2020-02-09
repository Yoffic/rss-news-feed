import 'bootstrap/dist/css/bootstrap.css';
import { isEqual, uniqueId } from 'lodash';
import axios from 'axios';
import render from './renders';
import parseRSS from './parser';
import validate from './validator';

const updateValidationState = (state) => (
  validate(state.feed.channels, state.form.urlField)
    .then((errors) => {
      const { form } = state;
      form.errors = errors;
      form.valid = isEqual(errors, {});
    })
);

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

const form = document.getElementById('form');
const field = document.getElementById('url-address');

field.addEventListener('input', (e) => {
  state.form.urlField = e.target.value;
  updateValidationState(state);
});

const errorFeedMessages = {
  data: 'Check the RSS channel. There is no RSS data for display.',
  direction: 'URL not found. Please try again.',
  base: 'Network problems. Please try again.',
};

const addFeedData = (link, feedData) => {
  const [addedChannel] = state.feed.channels.filter((channel) => channel.link === link);
  if (addedChannel) {
    const updatedFeedData = state.feed.data.items.filter((item) => item.id !== addedChannel.id);
    state.feed.data.items = updatedFeedData;
    const updatedFeedItems = { id: addedChannel.id, links: feedData.items };
    state.feed.data.items.push(updatedFeedItems);
    console.log(state.feed.data.items);
  } else {
    const id = uniqueId();
    const name = {
      id,
      title: feedData.title,
      description: feedData.desc,
    };
    const items = { id, links: feedData.items };
    state.feed.channels = [{ link, id }, ...state.feed.channels];
    state.feed.data.names = [name, ...state.feed.data.names];
    state.feed.data.items = [items, state.feed.data.items];
  }
};

const proxy = 'https://cors-anywhere.herokuapp.com';

const getRSS = (link) => {
  const requestUrl = `${proxy}/${link}`;
  const errors = {};

  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response.data);
      if (!feedData) {
        errors.data = errorFeedMessages.data;
        state.form.processState = 'finished';
        state.form.valid = false;
      } else {
        state.form.processState = 'finished';
        state.form.valid = false;
        addFeedData(link, feedData);
        setTimeout(() => getRSS(link), 60000);
      }
    })
    .catch((error) => {
      if (error.request) {
        errors.base = errorFeedMessages.base;
      } else if (error.response) {
        errors.direction = errorFeedMessages.direction;
      }
      console.log(error.request);
    })
    .then(() => {
      state.form.valid = false;
      state.form.processState = 'finished';
      state.feed.errors = errors;
    });
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  const link = state.form.urlField;
  state.form.urlField = '';
  getRSS(link);
});

render(state);
