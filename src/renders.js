import { watch } from 'melanke-watchjs';

export default (state, texts) => {
  const { feed, form } = state;
  const subscribeForm = document.getElementById('form');
  const field = document.getElementById('url-address');
  const button = subscribeForm.querySelector('button[type="submit"]');
  const banner = document.querySelector('.jumbotron');
  const contentArea = document.createElement('div');
  contentArea.classList.add('container');
  banner.after(contentArea);

  watch(form, 'errors', () => {
    const errorElement = field.nextElementSibling;
    const errors = Object.keys(form.errors);
    const value = form.field;
    if (errorElement) {
      field.classList.remove('is-invalid');
      errorElement.remove();
    }
    if (errors.length === 0 || value === '') {
      return;
    }
    const feedbackMessage = document.createElement('div');
    feedbackMessage.classList.add('invalid-feedback');
    feedbackMessage.innerHTML = errors.map((type) => texts(`errors.input.${type}`)).flat();
    field.after(feedbackMessage);
    field.classList.add('is-invalid');
  });

  watch(form, 'valid', () => {
    button.disabled = !form.valid;
  });

  watch(form, 'field', () => {
    field.value = form.field;
  });

  watch(form, 'processState', () => {
    const { processState } = form;
    switch (processState) {
      case 'filling':
        button.disabled = false;
        break;
      case 'sending':
        button.disabled = true;
        break;
      case 'finished':
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  });

  watch(feed, 'errors', () => {
    const errorElement = subscribeForm.nextElementSibling;
    const errors = Object.keys(feed.errors);
    if (errorElement) {
      errorElement.remove();
    }
    if (errors.length === 0) {
      return;
    }
    const feedbackMessage = document.createElement('div');
    feedbackMessage.classList.add('alert', 'alert-warning');
    feedbackMessage.setAttribute('role', 'alert');
    feedbackMessage.innerHTML = errors.map((type) => texts(`errors.feed.${type}`)).flat();
    subscribeForm.after(feedbackMessage);
  });

  watch(feed.data, 'news', () => {
    const { channels, news } = feed.data;
    channels.forEach((channel) => {
      const feedElement = document.getElementById(channel.id);
      if (feedElement) {
        feedElement.remove();
      }

      const feedChannel = document.createElement('section');
      feedChannel.id = channel.id;
      feedChannel.classList.add('my-5');
      contentArea.appendChild(feedChannel);

      const title = document.createElement('h2');
      title.innerHTML = channel.title;
      title.classList.add('h4');
      feedChannel.appendChild(title);

      const description = document.createElement('p');
      description.classList.add('lead');
      description.innerHTML = channel.description;
      feedChannel.appendChild(description);

      const feedNews = document.createElement('ul');
      feedNews.classList.add('list-unstyled');
      feedChannel.appendChild(feedNews);

      const [feedRSS] = news.filter((newsItem) => newsItem.id === channel.id);
      feedRSS.items.forEach((newsItem) => {
        const listElement = document.createElement('li');
        listElement.classList.add('my-3');
        feedNews.appendChild(listElement);
        const link = document.createElement('a');
        link.innerHTML = newsItem.title;
        link.href = newsItem.link;
        link.classList.add('text-decoration-none', 'text-info');
        listElement.appendChild(link);
      });
    });
  });
};
