import { SERVER_URL } from '../../scripts/config.js';

export default async function decorate(block) {
  const currentPageKey = window.location.pathname.split('/').pop();

  // Get JSON data URL from block's children
  let dataUrl;
  [...block.children].forEach((row) => {
    const linkElement = row.querySelector('a'); 
    if (linkElement?.href) dataUrl = linkElement.href;
  });

  if (!dataUrl) return;

  // Fetch or retrieve cached data
  let allPagesData;
  if (sessionStorage.getItem('cachedData')) {
    allPagesData = JSON.parse(sessionStorage.getItem('cachedData'));
  } else {
    const response = await fetch(dataUrl);
    allPagesData = await response.json();
    sessionStorage.setItem('cachedData', JSON.stringify(allPagesData));
  }

  const currentPageData = allPagesData[currentPageKey];
  if (!currentPageData || !Array.isArray(currentPageData.data)) {
    block.innerHTML = '<p>No results found.</p>';
    return;
  }

  const allItems = currentPageData.data;
  const allCategories = [...new Set(allItems.map((item) => item.Category).filter(Boolean))];
  
  const categoryColors = {};
  allCategories.forEach((category) => {
    const color = allItems.find((item) => item.Category === category)?.Color || '#ffffff';
    categoryColors[category] = color;
  });

  let activeCategory = null;
  let searchQuery = '';
  let filterMode = 'local';

  const carouselElement = buildCategoryCarousel(allCategories, allItems);
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'card-container';

  block.innerHTML = '';
  block.append(carouselElement, resultsContainer);

  function buildCategoryCarousel(categories, items) {
    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'carousel-wrapper';
    const carousel = document.createElement('div');
    carousel.className = 'carousel selector block';
    carousel.dataset.blockName = 'carousel';
    carousel.dataset.blockStatus = 'loaded';

    categories.forEach((category) => {
      const imageUrl = items.find((item) => item.Category === category)?.['Image URL'] || '/icons/default-icon.png';
      const categoryCard = document.createElement('div');
      categoryCard.style.cursor = 'pointer';
      categoryCard.style.backgroundColor = categoryColors[category] || '#ffffff';
      categoryCard.innerHTML = `
        <div data-valign="middle">
          <picture>
            <source type="image/webp" srcset="${imageUrl}">
            <img loading="lazy" alt="${category}" src="${imageUrl}" width="275" height="183">
          </picture>
        </div>
        <div data-valign="middle"><p>${category}</p></div>
      `;
      categoryCard.addEventListener('click', () => {
        activeCategory = category;
        searchQuery = '';
        filterMode = 'local';
        renderItems();
      });
      carousel.appendChild(categoryCard);
    });

    carouselWrapper.appendChild(carousel);
    return carouselWrapper;
  }

  function renderItems() {
    resultsContainer.innerHTML = '';
    const sourceItems =
      filterMode === 'global'
        ? Object.values(allPagesData).flatMap((sheet) => Array.isArray(sheet.data) ? sheet.data : [])
        : allItems;

    const filteredItems = sourceItems.filter((item) => {
      const matchesCategory = activeCategory ? item.Category === activeCategory : true;
      const matchesTitle = item.Title?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTitle;
    });

    if (!filteredItems.length) {
      resultsContainer.innerHTML = '<p>No matching results.</p>';
      return;
    }

    filteredItems.forEach((item) => {
      const itemCard = document.createElement('div');
      itemCard.className = 'card';
      itemCard.innerHTML = `
        <div class="image-container">
          <img src="${item['Image URL'] || '/icons/default-icon.png'}" alt="${item.Title}">
          <div class="overlay"><span class="overlay-text">Open</span></div>
        </div>
        <h5>${item.Title}</h5>
        <p><i>${item.Category} | ${item.Subcategory}</i></p>
        <p>${item.Description}</p>
      `;

      if (sessionStorage.getItem('username')) {
        const imageContainer = itemCard.querySelector('.image-container');
        const likeButton = document.createElement('div');
        likeButton.className = 'like-overlay';
        likeButton.innerHTML = `<img src="/icons/heart.svg" alt="Like">`;
        likeButton.addEventListener('click', async (e) => {
          e.stopPropagation();
          const favoritePayload = {
            user: sessionStorage.getItem('username'),
            favorites: [{ title: item.Title || '', description: item.Description || '', image: item['Image URL'] || '' }],
          };
          try {
            const response = await fetch(`${SERVER_URL}/api/favorites/sync`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(favoritePayload),
            });
            const result = await response.json();
            if (result.success) {
              alert('Added to favorites!');
              likeButton.style.opacity = 0.4;
            } else {
              alert('Failed to add favorite.');
            }
          } catch {
            alert('Server error while adding favorite.');
          }
        });
        imageContainer.appendChild(likeButton);
      }

      resultsContainer.appendChild(itemCard);
    });
  }

  renderItems();

  window.addEventListener('title-search', (e) => {
    searchQuery = e.detail.title;
    activeCategory = null;
    filterMode = 'global';
    renderItems();
  });
}
