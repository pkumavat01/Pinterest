export default async function decorate(block) {
  const input = createSearchInput();
  const dropdown = createDropdown();
  const cardWrapper = createCardWrapper(); // For showing fallback results

  block.append(input, dropdown, cardWrapper);

  const [queryIndexRes, dataRes] = await Promise.all([
    fetch('/query-index.json'),
    fetch('/data.json'),
  ]);

  const queryIndex = await queryIndexRes.json();
  const dataJson = await dataRes.json();
  const sheets = dataJson[':names'] || [];

  const filteredPages = (queryIndex.data || []).filter(p => p.path.startsWith('/search'));

  // Render dropdown options based on input
  function renderOptions(searchTerm = '') {
    dropdown.innerHTML = '';
    const term = searchTerm.toLowerCase();

    sheets.forEach(sheet => {
      const pageMeta = filteredPages.find(p => p.path === `/search/${sheet}`);
      if (!pageMeta) return;

      const title = pageMeta.title || sheet;
      if (title.toLowerCase().includes(term)) {
        dropdown.appendChild(createOption(title, pageMeta.image, sheet));
      }
    });

    dropdown.style.display = dropdown.children.length > 0 ? 'flex' : 'none';
  }

  // Show cards matching entered title (fallback if no dropdown match)
  function showCardsByTitle(title) {
    cardWrapper.innerHTML = '';
    const term = title.toLowerCase();

    let found = false;

    sheets.forEach(sheet => {
      const records = dataJson[sheet]?.data || [];
      records.forEach(record => {
        if (record.Title?.toLowerCase().includes(term)) {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <img src="${record['Image URL'] || '/icons/default-icon.png'}" alt="${record.Title}">
            <h3>${record.Title}</h3>
            <p>${record.Description || ''}</p>
          `;
          cardWrapper.appendChild(card);
          found = true;
        }
      });
    });

    if (!found) {
      cardWrapper.innerHTML = '<p>No results found for your search.</p>';
    }
  }

  // Events
  input.addEventListener('focus', () => {
    renderOptions(input.value);
  });

  input.addEventListener('input', () => {
    renderOptions(input.value);
  });

  input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const title = input.value.trim();
    const hasDropdown = dropdown.children.length > 0;

    if (!hasDropdown && title) {
      // Dispatch custom event to main body
      const event = new CustomEvent('title-search', { detail: { title } });
      window.dispatchEvent(event);
      dropdown.style.display = 'none';
    }
  }
});

  input.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.style.display = 'none';
    }, 200);
  });

  // Utilities
  function createSearchInput() {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for easy dinners, fashion, etc';
    input.className = 'global-search-input';
    return input;
  }

  function createDropdown() {
    const div = document.createElement('div');
    div.className = 'search-dropdown';
    return div;
  }

  function createCardWrapper() {
    const div = document.createElement('div');
    div.className = 'search-cards-wrapper';
    return div;
  }

  function createOption(title, image, sheet) {
    const option = document.createElement('div');
    option.className = 'search-option';
    option.innerHTML = `
      <img src="${image || '/icons/default-icon.png'}" alt="${title}" />
      <span>${title}</span>
    `;
    option.addEventListener('click', () => {
      window.location.href = `/search/${sheet}`;
    });
    return option;
  }
}
