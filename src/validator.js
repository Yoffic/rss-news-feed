import * as yup from 'yup';

const errorMessage = {
  url: 'Invalid URL',
  repetition: 'This URL has already been added.',
};

const checkoutUrl = yup.string().url().required();

const isValid = (url) => (
  checkoutUrl.isValid(url).then((valid) => valid)
);

const isAdded = (list, item) => {
  const [result] = list.filter((elem) => elem.link === item);
  return result !== undefined;
};

const validate = (urlList, urlAddress) => {
  const errors = {};
  return isValid(urlAddress)
    .then((valid) => {
      if (!valid) {
        errors.url = errorMessage.url;
      }
      if (isAdded(urlList, urlAddress)) {
        errors.repetition = errorMessage.repetition;
      }
      return errors;
    });
};

export default validate;
