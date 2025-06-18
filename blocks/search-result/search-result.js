export default async function decorate(block) {
  const pagePath = window.location.pathname.split('/').pop();
  const res = await fetch('/data.json');
  const data = await res.json();
  const pageData = data[pagePath];

  if (!pageData || !Array.isArray(pageData.data)) {
    block.innerHTML = '<p>No results found.</p>';
    return;
  }

  const allCards = pageData.data;
  const categories = [...new Set(allCards.map(c => c.Category).filter(Boolean))];

  let selectedCategory = null;
  let searchTerm = '';
  let searchMode = 'local'; 

  const carouselWrapper = createCarousel(categories, allCards);
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-container';

  block.append(carouselWrapper, cardsWrapper);

  function createCarousel(categories, cards) {
    const wrapper = document.createElement('div');
    wrapper.className = 'carousel-wrapper';

    const carousel = document.createElement('div');
    carousel.className = 'carousel selector block';
    carousel.dataset.blockName = 'carousel';
    carousel.dataset.blockStatus = 'loaded';

    categories.forEach(cat => {
      const firstImage = cards.find(card => card.Category === cat && card['Image URL'])?.['Image URL'] || '/icons/default-icon.png';
      const outerDiv = document.createElement('div');
      outerDiv.style.cursor = 'pointer';

      outerDiv.innerHTML = `
        <div data-valign="middle">
          <picture>
            <source type="image/webp" srcset="${firstImage}" media="(min-width: 600px)">
            <source type="image/webp" srcset="${firstImage}">
            <source type="image/png" srcset="${firstImage}" media="(min-width: 600px)">
            <img loading="lazy" alt="${cat}" src="${firstImage}" width="275" height="183">
          </picture>
        </div>
        <div data-valign="middle"><p>${cat}</p></div>
      `;

      outerDiv.addEventListener('click', () => {
        selectedCategory = cat;
        searchTerm = '';
        searchMode = 'local'; 
        renderCards();
      });

      carousel.appendChild(outerDiv);
    });

    wrapper.appendChild(carousel);
    return wrapper;
  }

function renderCards() {
  cardsWrapper.innerHTML = '';

  const cardsToRender = searchMode === 'global'
    ? Object.values(data)
        .filter(sheet => Array.isArray(sheet.data))
        .flatMap(sheet => sheet.data)
    : allCards;

  const filtered = cardsToRender.filter(card => {
    const matchCategory = selectedCategory ? card.Category === selectedCategory : true;
    const matchTitle = card.Title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchTitle;
  });

  if (!filtered.length) {
    cardsWrapper.innerHTML = '<p>No matching results.</p>';
    return;
  }

  filtered.forEach(card => {
    const div = document.createElement('div');
    div.className = 'card';

    div.innerHTML = `
      <div class="image-container">
        <img src="${card['Image URL'] || '/icons/default-icon.png'}" alt="${card.Title}">
        <div class="overlay">
          <span class="overlay-text">Open</span>
        </div>
      </div>
      <h5>${card.Title}</h5>
      <p><i>${card.Category} | ${card.Subcategory}</i></p>
      <p>${card.Description}</p>
    `;

    const isLoggedIn = !!sessionStorage.getItem('username');
    if (isLoggedIn) {
      const imageDiv = div.querySelector('.image-container');
      const heartBtn = document.createElement('div');
      heartBtn.className = 'like-overlay';
      heartBtn.innerHTML = `<img src="/icons/heart.svg" alt="Like">`;

      heartBtn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const img = card['Image URL'] || '/icons/default-icon.png';
        const title = card.Title || '';
        const desc = card.Description || '';
        const user = sessionStorage.getItem('username') || 'Punam';

        if (!img || !title) return alert('Missing data to save favorite.');

        const favorite = {
          user,
          favorites: [
            {
              title,
              description: desc,
              image: img,
            },
          ],
        };

        try {
          const res = await fetch('http://localhost:5000/api/favorites/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favorite),
          });

          const result = await res.json();
          if (result.success) {
            alert('Added to favorites!');
            heartBtn.style.opacity = 0.4;
          } else {
            alert('Failed to add favorite.');
          }
        } catch (err) {
          console.error('Favorite error:', err);
          alert('Server error while adding favorite.');
        }
      });

      imageDiv.appendChild(heartBtn);
    }

    cardsWrapper.appendChild(div);
  });
}

  renderCards();

  window.addEventListener('title-search', (e) => {
    searchTerm = e.detail.title;
    selectedCategory = null;
    searchMode = 'global';
    renderCards();
  });

  const bgShades = ['#FFE4E1', '#E6E6FA', '#F0FFF0', '#FFFACD', '#E0FFFF'];
  const carouselItems = document.querySelectorAll('.carousel.selector.block > div');

  carouselItems.forEach((item, index) => {
    const color = bgShades[index % bgShades.length];
    item.style.backgroundColor = color;
  });

}
