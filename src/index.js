import 'bootstrap/dist/css/bootstrap.css';
import _ from 'lodash';
import axios from 'axios';

import * as yup from 'yup';
import { watch } from 'melanke-watchjs';
import parseRSS from './parser';

const errorMessage = {
  url: 'Введите действующий адрес сайта',
  double: 'Данный сайт уже добавлен в ленту. Введите новый адрес.',
};

const checkoutUrl = yup.object().shape({
  urlAddress: yup.string().url().required(),
});

const isValidUrl = (text) => {
  const textObject = { urlAddress: text };
  return checkoutUrl
    .isValid(textObject)
    .then((valid) => valid);
};

const isAdded = (text, data) => {
  const added = data.filter((channel) => _.includes(channel, text));
  return added.length > 0;
};

const validate = (text, data) => {
  const errors = {};
  return isValidUrl(text).then((valid) => {
    if (!valid) {
      errors.url = errorMessage.url;
    }
    if (isAdded(text, data)) {
      errors.double = errorMessage.double;
    }
    return errors;
  });
};

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
  },
};

const form = document.getElementById('form');
const field = document.getElementById('url-address');
const button = document.querySelector('#form button[type="submit"]');

field.addEventListener('input', (e) => {
  state.form.urlField = e.target.value;
  updateValidationState(state);
});

const proxy = 'cors-anywhere.herokuapp.com';

form.addEventListener('submit', (e) => {
  e.preventDefault();
  state.form.processState = 'fulfilled';
  const channelData = {
    name: state.form.urlField,
  };
  const link = state.form.urlField;
  const requestUrl = `https://${proxy}/${link}`;
  axios.get(requestUrl)
    .then((response) => {
      const feedData = parseRSS(response);
      channelData.data = feedData;
    });
  state.feed.channels.push(channelData);
  state.form.urlField = '';
  console.log(state);
});

watch(state.form, 'errors', () => {
  const errorElement = field.nextElementSibling;
  const errMessage = Object.values(state.form.errors).flat();
  const value = state.form.urlField;
  if (errorElement) {
    field.classList.remove('is-invalid');
    errorElement.remove();
  }
  if (!errMessage.length || !value.length) {
    return;
  }
  const feedbackMessage = document.createElement('div');
  feedbackMessage.classList.add('invalid-feedback');
  feedbackMessage.innerHTML = errMessage;
  field.classList.add('is-invalid');
  field.after(feedbackMessage);
});

watch(state.form, 'valid', () => {
  button.disabled = !state.form.valid;
});

watch(state.form, 'processState', () => {
  if (state.form.processState === 'fulfilled') {
    field.value = '';
    button.disabled = true;
  }
});
