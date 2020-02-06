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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'fulfilled';
  const link = state.form.urlField;
  const requestUrl = `https://${proxy}/${link}`;

  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response.data);
      if (_.isEqual(feedData, {})) {
        state.feed.errors.data = 'There is no RSS data.';
        state.form.processState = 'filling';
      } else {
        const channelData = {
          name: link,
          data: feedData,
          id: _.uniqueId(),
        };
        state.feed.channels = [channelData, ...state.feed.channels];
      }
    })
    .catch((error) => {
      state.feed.errors.base = 'Network problems. Try again.';
      state.form.processState = 'filling';
      throw error;
    }).then(() => {
      state.form.urlField = '';
    });
  console.log(state);
});

render(state);
