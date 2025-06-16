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
  const categories = [...new Set(allCards.map(c => c.Subcategory).filter(Boolean))];

  let selectedCategory = null;
  let searchTerm = '';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search by title...';
  searchInput.className = 'title-search-input';

  const carousel = document.createElement('div');
  carousel.className = 'subcategory-carousel';

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'subcategory-btn';
    btn.addEventListener('click', () => {
      selectedCategory = cat;
      setActive(btn);
      renderCards();
    });
    carousel.appendChild(btn);
  });

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-container';

  function renderCards() {
    cardsWrapper.innerHTML = '';
    const filtered = allCards.filter(card => {
      const matchCategory = selectedCategory ? card.Subcategory === selectedCategory : true;
      const matchTitle = card.Title?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchTitle;
    });

    if (filtered.length === 0) {
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

  function setActive(activeBtn) {
    carousel.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value;
    renderCards();
  });

  // Initial render (all cards, no filter)
  renderCards();

  // Append in order
  block.appendChild(searchInput);
  block.appendChild(carousel);
  block.appendChild(cardsWrapper);
}
