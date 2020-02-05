const parseRSS = (data) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(data.data, 'text/xml');

  const feedData = {};
  feedData.title = doc.querySelector('title').textContent;
  feedData.description = doc.querySelector('description').textContent;
  const [...items] = doc.querySelectorAll('item');
  const elems = items.map((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    return { title, link };
  });
  feedData.items = elems;

  return feedData;
};

export default parseRSS;
