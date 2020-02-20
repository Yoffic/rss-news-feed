import * as yup from 'yup';
import { find } from 'lodash';

const checkoutUrl = yup.string().url().required();

const isValid = (url) => checkoutUrl.validateSync(url);

const isAdded = (list, url) => {
  const result = find(list, ['url', url]);
  return !!result;
};

const validate = (urlList, urlAddress) => {
  if (isAdded(urlList, urlAddress)) {
    const error = new Error();
    error.type = 'repetition';
    throw error;
  }
  return isValid(urlAddress);
};

export default validate;
