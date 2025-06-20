export default async function decorate(block) {
  let dataUrl = null;
  [...block.children].forEach((row) => {
    const linkElement = row.querySelector('a');
    if (linkElement) {
      dataUrl = linkElement.href;
      row.style.display = 'none';
    }
  });

  if (!dataUrl) return;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search for easy dinners, fashion, etc';
  searchInput.className = 'global-search-input';

  const resultsDropdown = document.createElement('div');
  resultsDropdown.className = 'search-dropdown';

  block.append(searchInput, resultsDropdown);

  const searchIndexData = await (await fetch(dataUrl)).json();

  function renderSearchOptions(query = '') {
    resultsDropdown.innerHTML = '';
    const normalizedQuery = query.toLowerCase();

    searchIndexData.data
      .filter((page) => page.path.startsWith('/search'))
      .filter((page) => page.title?.toLowerCase().includes(normalizedQuery))
      .forEach((page) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-option';
        resultItem.innerHTML = `
          <img src="${page.image || '/icons/default-icon.png'}" alt="${page.title}" />
          <span>${page.title}</span>
        `;

        resultItem.addEventListener('click', () => {
          window.location.href = page.path;
        });

        resultsDropdown.appendChild(resultItem);
      });

    resultsDropdown.style.display = resultsDropdown.children.length > 0 ? 'flex' : 'none';
  }

  searchInput.addEventListener('focus', () => renderSearchOptions(searchInput.value));
  searchInput.addEventListener('input', () => renderSearchOptions(searchInput.value));
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const searchText = searchInput.value.trim();
      if (searchText && resultsDropdown.children.length === 0) {
        window.dispatchEvent(
          new CustomEvent('title-search', { detail: { title: searchText } })
        );
        resultsDropdown.style.display = 'none';
      }
    }
  });

  searchInput.addEventListener('blur', () => {
    setTimeout(() => (resultsDropdown.style.display = 'none'), 200);
  });
}
