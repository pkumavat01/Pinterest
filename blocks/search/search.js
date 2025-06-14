export default async function decorate(block) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search for easy dinners, fashion, etc';
  input.className = 'search-input';

  const dropdown = document.createElement('div');
  dropdown.className = 'search-dropdown';

  block.append(input, dropdown);

  const [queryIndexRes, dataRes] = await Promise.all([
    fetch('/query-index.json'),
    fetch('/data.json'),
  ]);

  const queryIndex = await queryIndexRes.json();
  const dataJson = await dataRes.json();
  const sheets = dataJson[':names'] || [];

  const filteredPages = queryIndex.data
    ? queryIndex.data.filter(p => p.path.startsWith('/search'))
    : [];

  input.addEventListener('focus', () => {
    dropdown.innerHTML = '';
    sheets.forEach((sheet) => {
      const pageMeta = filteredPages.find(p => p.path === `/search/${sheet}`);
      if (!pageMeta) return;

      const item = document.createElement('div');
      item.className = 'search-option';
      item.innerHTML = `
        <img src="${pageMeta.image || '/icons/default-icon.png'}" alt="${pageMeta.title || sheet}" />
        <span>${pageMeta.title || sheet}</span>
      `;
      item.addEventListener('click', () => {
        window.location.href = `/search/${sheet}`;
      });
      dropdown.appendChild(item);
    });
    dropdown.style.display = 'block';
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      dropdown.style.display = 'none';
    }, 200);
  });
}
