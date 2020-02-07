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

  watch(feed, 'channels', () => {
    const { channels } = feed;
    channels.forEach(({ data, id }) => {
      const feedElement = document.getElementById(id);
      if (feedElement) {
        feedElement.remove();
      }
      const channel = document.createElement('div');
      channel.id = id;
      const title = document.createElement('h2');
      title.innerHTML = data.title;
      const description = document.createElement('p');
      description.innerHTML = data.description;
      const news = document.createElement('ul');
      data.items.forEach((item) => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.innerHTML = item.title;
        link.href = item.link;
        listItem.append(link);
        news.append(listItem);
      });
      channel.append(title, description, news);
      banner.after(channel);
    });
  });
};
