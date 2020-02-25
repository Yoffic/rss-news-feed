import * as yup from 'yup';

export default (url, list) => (
  yup.string()
    .url()
    .required()
    .notOneOf(list)
    .validateSync(url)
);
