import 'bootstrap/dist/css/bootstrap.css';
import _ from 'lodash';
import axios from 'axios';
import render from './renders';
import parseRSS from './parser';
import validate from './validator';

const updateValidationState = (state) => {
  validate(state.form.urlField, state.feed.channels)
    .then((errors) => {
      const { form } = state;
      form.errors = errors;
      form.valid = _.isEqual(errors, {});
    });
};

const state = {
  form: {
    processState: 'filling',
    urlField: '',
    valid: false,
    errors: {},
  },
  feed: {
    channels: [],
    errors: {},
  },
};

const form = document.getElementById('form');
const field = document.getElementById('url-address');

field.addEventListener('input', (e) => {
  state.form.urlField = e.target.value;
  updateValidationState(state);
});

const proxy = 'cors-anywhere.herokuapp.com';
const errorFeedMessages = {
  data: 'Check the RSS channel. There is no RSS data for display.',
  direction: 'URL not found. Please try again.',
  base: 'Network problems. Please try again.',
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'sending';
  const link = state.form.urlField;
  const requestUrl = `https://${proxy}/${link}`;
  state.form.urlField = '';
  const errors = {};

  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response.data);
      if (!feedData) {
        errors.data = errorFeedMessages.data;
        state.form.processState = 'finished';
      } else {
        state.form.processState = 'finished';
        const channelData = {
          name: link,
          data: feedData,
          id: _.uniqueId(),
        };
        state.feed.channels = [channelData, ...state.feed.channels];
      }
    })
    .catch((error) => {
      if (error.response.status === 404) {
        errors.direction = errorFeedMessages.direction;
        state.form.processState = 'finished';
      } else if (error.request) {
        errors.base = errorFeedMessages.base;
        state.form.processState = 'finished';
      }
    })
    .then(() => {
      state.feed.errors = errors;
    });
});

render(state);
