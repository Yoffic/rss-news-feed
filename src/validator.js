import * as yup from 'yup';
import { includes } from 'lodash';

const errorMessage = {
  url: 'Invalid URL',
  repetition: 'This URL has already been added.',
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
  const added = data.filter((channel) => includes(channel, text));
  return added.length > 0;
};

const validate = (text, data) => {
  const errors = {};
  return isValidUrl(text).then((valid) => {
    if (!valid) {
      errors.url = errorMessage.url;
    }
    if (isAdded(text, data)) {
      errors.repetition = errorMessage.repetition;
    }
    return errors;
  });
};

export default validate;
