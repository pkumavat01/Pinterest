import { createOptimizedPicture } from '../../scripts/aem.js';
import { SERVER_URL } from '../../scripts/config.js';

function buildCardListFromBlockChildren(block) {
  const listElement = document.createElement('ul');

  [...block.children].forEach((row) => {
    const listItem = document.createElement('li');
    listItem.append(...row.children);

    [...listItem.children].forEach((div) => {
      div.className = div.querySelector('picture')
        ? 'cards-card-image'
        : 'cards-card-body';
    });

    listElement.appendChild(listItem);
  });

  listElement.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture')?.replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]),
    );
  });

  return listElement;
}
function wrapButtonContainers() {
  document
    .querySelectorAll('.cards.long > ul > li .cards-card-body')
    .forEach((cardBody) => {
      if (cardBody.querySelector('.button-carousel')) return;
      const buttons = Array.from(
        cardBody.querySelectorAll('.button-container'),
      );

      if (buttons.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'button-carousel';
        buttons.forEach((btn) => wrapper.appendChild(btn));
        cardBody.insertBefore(wrapper, cardBody.firstChild);
      }
    });
}

function addLikeButtons(listElement) {
  listElement
    .querySelectorAll('.cards-card-image')
    .forEach((imageDiv) => {
      const likeButton = document.createElement('div');
      likeButton.className = 'like-overlay';
      likeButton.innerHTML = '<img src="/icons/heart.svg" alt="Like">';

      likeButton.addEventListener('click', async (e) => {
        e.stopPropagation();
        const cardElement = imageDiv.closest('li');
        const imageUrl = imageDiv.querySelector('img')?.src;
        const title = cardElement.querySelector('h5, h3, h4')?.textContent?.trim() || '';
        const description = cardElement.querySelector('p')?.textContent?.trim() || '';
        const username = sessionStorage.getItem('username') || 'Punam';

        if (!imageUrl || !title) {
          return alert('Missing data to save favorite.');
        }

        const favoriteData = {
          user: username,
          favorites: [{ title, description, image: imageUrl }],
        };

        try {
          const res = await fetch(`${SERVER_URL}/api/favorites/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(favoriteData),
          });

          const result = await res.json();
          if (result.success) {
            alert('Added to favorites!');
            likeButton.style.opacity = 0.4;
          } else {
            alert('Failed to add favorite.');
          }
        } catch (error) {
          console.error('Error adding favorite:', error);
          alert('Server error. Please try again.');
        }
      });

      imageDiv.appendChild(likeButton);
    });
}

function addSeeMorePaginationForList(listSelector, buttonSelector, getCounts) {
  const cards = [...document.querySelectorAll(`${listSelector} > li`)];
  let { init, increment } = getCounts();

  let currentCount = init;

  function showCards(count) {
    cards.forEach((card, index) => {
      card.style.display = index < count ? '' : 'none';
    });
  }

  showCards(currentCount);

  const seeMoreButton = document.querySelector(buttonSelector);
  if (!seeMoreButton) return;

  seeMoreButton.addEventListener('click', () => {
    currentCount = Math.min(cards.length, currentCount + increment);
    showCards(currentCount);
    if (currentCount >= cards.length) seeMoreButton.style.display = 'none';
  });

  window.addEventListener('resize', () => {
    ({ init, increment } = getCounts());
    currentCount = init;
    showCards(currentCount);
    seeMoreButton.style.display = '';
  });
}

async function loadDynamicFavorites(listElement) {
  const username = sessionStorage.getItem('username') || 'Punam';
  try {
    const res = await fetch(`${SERVER_URL}/api/favorites/${username}`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.favorites)) {
      listElement.innerHTML = '<li><p>No favorites found.</p></li>';
      return;
    }

    listElement.innerHTML = '';
    const fragment = document.createDocumentFragment();

    data.favorites.forEach((cardData) => {
      const listItem = document.createElement('li');

      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-card-image';
      if (cardData.image.startsWith('http')) {
        const img = document.createElement('img');
        img.src = cardData.image;
        img.alt = cardData.title;
        img.loading = 'lazy';
        img.width = 750;
        imageDiv.appendChild(img);
      } else {
        imageDiv.appendChild(
          createOptimizedPicture(
            cardData.image,
            cardData.title,
            false,
            [{ width: '750' }],
          ),
        );
      }

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'cards-card-body';

      // eslint-disable-next-line no-underscore-dangle
      bodyDiv.innerHTML = `
        <h5>${cardData.title}</h5>
        <p>${cardData.description}</p>
        <button class="unlike-btn" data-id="${cardData._id}">
          <img src="/icons/dislike.svg" alt="unlike">
        </button>
      `;

      listItem.append(imageDiv, bodyDiv);
      fragment.appendChild(listItem);
    });

    listElement.appendChild(fragment);

    listElement.addEventListener('click', async (e) => {
      if (!e.target.closest('.unlike-btn')) return;

      const btn = e.target.closest('.unlike-btn');
      const cardId = btn.dataset.id;

      try {
        const deleteRes = await fetch(
          `${SERVER_URL}/api/favorites/${username}/${cardId}`,
          { method: 'DELETE' },
        );

        const result = await deleteRes.json();
        if (result.success) {
          btn.closest('li').remove();
        } else {
          alert('Failed to remove favorite.');
        }
      } catch (error) {
        console.error('Error removing favorite:', error);
        alert('Server error. Please try again.');
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    listElement.innerHTML = '<li><p>Error loading favorites. Please try again.</p></li>';
  }
}

export default function decorate(block) {
  const listElement = buildCardListFromBlockChildren(block);
  block.innerHTML = '';
  block.appendChild(listElement);

  if (block.classList.contains('dynamic')) {
    if (
      document.body.classList.contains('favorites-page')
      && sessionStorage.getItem('isLoggedIn') !== 'true'
    ) {
      window.location.href = '/login';
      return;
    }
    loadDynamicFavorites(listElement);
  }

  wrapButtonContainers();

  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    addLikeButtons(listElement);
  }

  addSeeMorePaginationForList(
    'main > div:first-of-type ul',
    'main > div:first-of-type > div:last-of-type p',
    () => {
      const w = window.innerWidth;
      if (w < 600) return { init: 2, increment: 2 };
      if (w < 900) return { init: 4, increment: 4 };
      return { init: 3, increment: 3 };
    },
  );

  addSeeMorePaginationForList(
    'main > div:nth-of-type(2) ul',
    'main > div:nth-of-type(2) > div:last-of-type p',
    () => {
      const w = window.innerWidth;
      if (w < 600) return { init: 2, increment: 2 };
      if (w < 900) return { init: 4, increment: 4 };
      return { init: 5, increment: 5 };
    },
  );
}

// ✨ Converts block children into UL list of LI with image & body classes.
