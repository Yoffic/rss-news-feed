const parseRSS = (data) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(data, 'text/xml');
  if (doc.firstChild.tagName !== 'rss') {
    return null;
  }
  const [...items] = doc.querySelectorAll('item');
  const mappedItems = items.map((item) => {
    const element = {
      title: item.querySelector('title').textContent,
      link: item.querySelector('link').textContent,
    };
    return element;
  });
  const feedData = {
    title: doc.querySelector('title').textContent,
    desc: doc.querySelector('description').textContent,
    items: mappedItems,
  };

  return feedData;
};

export default parseRSS;
