import axios from 'axios';

function ajaxHeart(event) {
  event.preventDefault();

  console.log('Heart it!!!!!!!!');

  axios.post(this.action)
    .then(({ data }) => {
      const isHearted = this.heart.classList.toggle('heart__button--hearted');
    });
};

export default ajaxHeart;