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
  let searchMode = 'local'; // 'local' or 'global'

  // DOM Containers
  const carouselWrapper = createCarousel(categories, allCards);
  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-container';

  block.append(carouselWrapper, cardsWrapper);

  // Carousel creation
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
        searchMode = 'local'; // back to local mode
        renderCards();
      });

      carousel.appendChild(outerDiv);
    });

    wrapper.appendChild(carousel);
    return wrapper;
  }

  function renderCards() {
    cardsWrapper.innerHTML = '';

    // Choose data source: either local page data or full sheet
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
        <img src="${card['Image URL'] || '/icons/default-icon.png'}" alt="${card.Title}">
        <h3>${card.Title}</h3>
        <p>${card.Description}</p>
      `;
      cardsWrapper.appendChild(div);
    });
  }

  // Initial render (local data)
  renderCards();

  // Listen to global title search from header — search across all data
  window.addEventListener('title-search', (e) => {
    searchTerm = e.detail.title;
    selectedCategory = null;
    searchMode = 'global'; // switch to global search
    renderCards();
  });
}
