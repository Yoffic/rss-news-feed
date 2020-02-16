import * as yup from 'yup';

const checkoutUrl = yup.string().url().required();

const isValid = (url) => (
  checkoutUrl.isValid(url).then((valid) => valid)
);

const isAdded = (list, url) => {
  const [result] = list.filter((elem) => elem.url === url);
  return result !== undefined;
};

const validate = (urlList, urlAddress, texts) => {
  const errors = {};
  return isValid(urlAddress)
    .then((valid) => {
      if (!valid) {
        errors.url = texts('errors.input.url');
      }
      if (isAdded(urlList, urlAddress)) {
        errors.repetition = texts('errors.input.repetition');
      }
      return errors;
    });
};

export default validate;
