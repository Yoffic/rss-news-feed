import * as yup from 'yup';
import { find } from 'lodash';

const checkoutUrl = yup.string().url().required();

const isValid = (url) => (
  checkoutUrl.isValid(url).then((valid) => valid)
);

const isAdded = (list, url) => {
  const result = find(list, ['url', url]);
  return !!result;
};

const validate = (urlList, urlAddress) => {
  const errors = {};
  return isValid(urlAddress)
    .then((valid) => {
      if (!valid) {
        errors.url = 'url';
      }
      if (isAdded(urlList, urlAddress)) {
        errors.repetition = 'repetition';
      }
      return errors;
    });
};

export default validate;
