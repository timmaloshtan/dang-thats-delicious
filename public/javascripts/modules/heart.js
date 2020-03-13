import axios from 'axios';

import { $ } from './bling';

function ajaxHeart(event) {
  event.preventDefault();

  axios.post(this.action)
    .then(({ data }) => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
      $('.heart-count').textContent = data.hearts.length;
      if (isHearted) {
        this.heart.classList.add('heart__button--float');
        setTimeout(() => this.heart.classList.remove('heart__button--float'))
      }
    });
};

export default ajaxHeart;