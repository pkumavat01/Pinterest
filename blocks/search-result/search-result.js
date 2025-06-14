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
  console.log(categories)
  const carousel = document.createElement('div');
  carousel.className = 'subcategory-carousel';

  categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.className = 'subcategory-btn';
    btn.addEventListener('click', () => {
      renderCards(cat);
      setActive(btn);
    });
    carousel.appendChild(btn);
  });

  const cardsWrapper = document.createElement('div');
  cardsWrapper.className = 'card-container';

  function renderCards(filterCat = null) {
    cardsWrapper.innerHTML = '';
    const filtered = filterCat ? allCards.filter(c => c.Subcategory === filterCat) : allCards;
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

  // Initial render
  renderCards();

  block.appendChild(carousel);
  block.appendChild(cardsWrapper);
}
