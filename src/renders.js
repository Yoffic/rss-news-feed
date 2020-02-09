import { watch } from 'melanke-watchjs';

export default (state) => {
  const { feed, form } = state;
  const subscribeForm = document.getElementById('form');
  const field = document.getElementById('url-address');
  const button = subscribeForm.querySelector('button[type="submit"]');
  const banner = document.querySelector('.jumbotron');

  watch(form, 'errors', () => {
    const errorElement = field.nextElementSibling;
    const errMessage = Object.values(form.errors).flat();
    const value = form.urlField;
    if (errorElement) {
      field.classList.remove('is-invalid');
      errorElement.remove();
    }
    if (!errMessage.length || !value.length) {
      return;
    }
    const feedbackMessage = document.createElement('div');
    feedbackMessage.classList.add('invalid-feedback');
    feedbackMessage.innerHTML = errMessage;
    field.classList.add('is-invalid');
    field.after(feedbackMessage);
  });

  watch(form, 'valid', () => {
    button.disabled = !form.valid;
  });

  watch(form, 'urlField', () => {
    field.value = form.urlField;
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
    const errMessage = Object.values(feed.errors).flat();
    if (errorElement) {
      errorElement.remove();
    }
    if (!errMessage.length) {
      return;
    }
    const feedbackMessage = document.createElement('div');
    feedbackMessage.classList.add('alert', 'alert-warning');
    feedbackMessage.setAttribute('role', 'alert');
    feedbackMessage.innerHTML = errMessage;
    subscribeForm.after(feedbackMessage);
  });

  watch(feed.data, 'items', () => {
    const { names, items } = feed.data;
    names.forEach((channel) => {
      const feedElement = document.getElementById(channel.id);
      if (feedElement) {
        feedElement.remove();
      }

      const feedChannel = document.createElement('div');
      feedChannel.id = channel.id;
      const title = document.createElement('h2');
      title.innerHTML = channel.title;
      feedChannel.appendChild(title);

      const description = document.createElement('p');
      description.innerHTML = channel.description;
      feedChannel.appendChild(description);

      const news = document.createElement('ul');
      const [feedRSS] = items.filter((item) => item.id === channel.id);
      feedRSS.links.forEach((item) => {
        const listItem = document.createElement('li');
        news.appendChild(listItem);
        const link = document.createElement('a');
        link.innerHTML = item.title;
        link.href = item.link;
        listItem.appendChild(link);
      });
      feedChannel.appendChild(news);

      banner.after(feedChannel);
    });
  });
};
