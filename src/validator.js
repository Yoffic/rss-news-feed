import * as yup from 'yup';
import i18next from 'i18next';
import resources from './locales';

const checkoutUrl = yup.string().url().required();

const isValid = (url) => (
  checkoutUrl.isValid(url).then((valid) => valid)
);

const isAdded = (list, item) => {
  const [result] = list.filter((elem) => elem.link === item);
  return result !== undefined;
};

const validate = (urlList, urlAddress) => (
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  }).then((t) => {
    const errors = {};
    return isValid(urlAddress)
      .then((valid) => {
        if (!valid) {
          errors.url = t('errors.input.url');
        }
        if (isAdded(urlList, urlAddress)) {
          errors.repetition = t('errors.input.repetition');
        }
        return errors;
      });
  })
);

export default validate;
