import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => `
    <a href="/store/${store.slug}" class="search__result">
      <strong>${store.name}</strong
    </a>
  `).join('');
}

function typeAhead(search) {
  if (!search) {
    return;
  }

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');
  
  searchInput.on('input', function(event) {
    if (!this.value) {
      searchResults.style.display = 'none';
      return; 
    }

    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    axios.get(`/api/search?q=${this.value}`)
      .then(({ data }) => {
        if (data.length) {
          return searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(data));
        }

        searchResults.innerHTML = `
          <div class="search__result">No results for "${dompurify.sanitize(this.value)}" found!</div>
        `
      })
      .catch(console.error);
  });

  searchInput.on('keyup', function(event) {
    if (![13, 38, 40].includes(event.keyCode)) {
      return;
    }
    
    const activeClass = 'search__result--active';

    const current = search.querySelector(`.${activeClass}`);

    const results = search.querySelectorAll('.search__result');

    let next;

    if (event.keyCode ===  40 && current) {
      next = current.nextElementSibling || results[0];
    } else if (event.keyCode === 40) {
       next = results[0];
    } else if (event.keyCode === 38 && current) {
      next = current.previousElementSibling || results[results.length - 1 ];
    } else if (event.keyCode === 38) {
      next = results[results.length - 1 ];
    } else if (event.keyCode === 13 && current) {
      return window.location.href = current.href
    } else if (event.keyCode === 13) {
      return;
    }

    current && current.classList.remove(activeClass);
    next.classList.add(activeClass);
  });
}

export default typeAhead;
