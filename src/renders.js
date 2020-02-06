import { watch } from 'melanke-watchjs';

export default (state) => {
  const form = document.getElementById('form');
  const field = document.getElementById('url-address');
  const button = form.querySelector('button[type="submit"]');
  const banner = document.querySelector('.jumbotron');

  watch(state.form, 'errors', () => {
    const errorElement = field.nextElementSibling;
    const errMessage = Object.values(state.form.errors).flat();
    const value = state.form.urlField;
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

  watch(state.form, 'valid', () => {
    button.disabled = !state.form.valid;
  });

  watch(state.form, 'processState', () => {
    if (state.form.processState === 'fulfilled') {
      field.value = '';
      button.disabled = true;
    }
    if (state.form.processState === 'filling') {
      button.disabled = true;
    }
  });

  watch(state.feed, 'errors', () => {
    const errorElement = document.querySelector('[role="alert"]');
    const errMessage = Object.values(state.feed.errors).flat();
    console.log(errMessage);
    if (errorElement) {
      errorElement.remove();
    }
    if (!errMessage) {
      return;
    }
    const feedbackMessage = document.createElement('div');
    feedbackMessage.classList.add('alert', 'alert-warning');
    feedbackMessage.setAttribute('role', 'alert');
    feedbackMessage.innerHTML = errMessage;
    banner.after(feedbackMessage);
  }); // need to fix

  watch(state.feed, 'channels', () => {
    const { channels } = state.feed;
    channels.forEach(({ data }) => {
      const channel = document.createElement('div');
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
