import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-card-image';
      } else {
        div.className = 'cards-card-body';
      }
    });

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    console.log(img.src)
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])
    );
  });

  block.textContent = '';
  block.append(ul);

  if (block.classList.contains('dynamic')) {
    console.log("found")
    if (
      document.body.classList.contains('favorites-page') &&
      sessionStorage.getItem('isLoggedIn') !== 'true'
    ) {
      window.location.href = '/login';
    }
    else {

      loadDynamicFavorites(ul);
    }
  }
  
  document.querySelectorAll('.cards.long > ul >li .cards-card-body').forEach(cardBody => {
  const buttons = cardBody.querySelectorAll('.button-container');
  if (buttons.length) {
    const wrapper = document.createElement('div');
    wrapper.className = 'button-carousel';

    buttons.forEach(btn => {
      wrapper.appendChild(btn); 
    });

    cardBody.insertBefore(wrapper, cardBody.firstChild);
  }
});
/*
[...ul.querySelectorAll('.cards-card-image')].forEach((imageDiv) => {
  const heartBtn = document.createElement('div');
  heartBtn.className = 'like-overlay';
  heartBtn.innerHTML = `<img src="/icons/heart.svg" alt="Like">`; 
  heartBtn.addEventListener('click', async (e) => {
    e.stopPropagation();

    const card = imageDiv.closest('li');
    const img = imageDiv.querySelector('img')?.src;
    const title = card.querySelector('h5, h3, h4')?.textContent?.trim() || '';
    const desc = card.querySelector('p')?.textContent?.trim() || '';
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
});*/

const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

if (isLoggedIn) {
  [...ul.querySelectorAll('.cards-card-image')].forEach((imageDiv) => {
    const heartBtn = document.createElement('div');
    heartBtn.className = 'like-overlay';
    heartBtn.innerHTML = `<img src="/icons/heart.svg" alt="Like">`;

    heartBtn.addEventListener('click', async (e) => {
      e.stopPropagation();

      const card = imageDiv.closest('li');
      const img = imageDiv.querySelector('img')?.src;
      console.log(img)
      const title = card.querySelector('h5, h3, h4')?.textContent?.trim() || '';
      const desc = card.querySelector('p')?.textContent?.trim() || '';
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
  });
}

  // see more big cards
  const allBigCards = [...document.querySelectorAll('main > div:first-of-type li')];
  const initialCount = 3;
  let currentCount = initialCount;

  allBigCards.forEach((card, i) => {
    if (i >= initialCount) card.style.display = 'none';
  });

  const seeMoreBtn1 = document.querySelector('main > div:first-of-type > div:last-of-type p');
  if (!seeMoreBtn1) return;

  seeMoreBtn1.addEventListener('click', () => {
    console.log('click');

    const remaining = allBigCards.length - currentCount;
    const showCount = remaining >= 3 ? 3 : remaining;

    allBigCards.slice(currentCount, currentCount + showCount).forEach((card) => {
      card.style.display = 'block';
    });

    currentCount += showCount;
    console.log(currentCount, ' ', allBigCards.length);

    if (currentCount >= allBigCards.length) {
      seeMoreBtn1.style.display = 'none';
    }
  });
const allSmallCards = [...document.querySelectorAll('main > div:nth-of-type(2) li')];
  const seeMoreBtn2 = document.querySelector('main > div:nth-of-type(2) > div:last-of-type p');

  if (!allSmallCards.length || !seeMoreBtn2) {
    return setTimeout(setupSeeMoreSmallCards, 100);
  }

  const initialCountSmall = 10;
  let currentCountSmall = initialCountSmall;

  allSmallCards.forEach((card, i) => {
    if (i >= initialCountSmall) card.style.display = 'none';
  });

  if (seeMoreBtn2.classList.contains('bound')) return;
  seeMoreBtn2.classList.add('bound');

  seeMoreBtn2.addEventListener('click', () => {
    const remaining = allSmallCards.length - currentCountSmall;
    const showCount = remaining >= 5 ? 5 : remaining;

    allSmallCards.slice(currentCountSmall, currentCountSmall + showCount).forEach((card) => {
      card.style.display = 'block';
    });

    currentCountSmall += showCount;

    if (currentCountSmall >= allSmallCards.length) {
      seeMoreBtn2.style.display = 'none';
    }
  });
}

async function loadDynamicFavorites(ul) {
  const username = sessionStorage.getItem('username') || 'Punam';
  const apiUrl = `http://localhost:5000/api/favorites/${username}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.favorites)) {
      console.warn('No favorites found or invalid response');
      ul.innerHTML = '<li><p>No favorites found.</p></li>';
      return;
    }

    ul.innerHTML = '';

    data.favorites.forEach((card) => {
      const li = document.createElement('li');
      console.log(card.image)
      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-card-image';
      if (card.image.startsWith('http')) {
        const img = document.createElement('img');
        img.src = card.image;
        img.alt = card.title;
        img.loading = 'lazy';
        img.width = 750;
        imageDiv.appendChild(img);
      } else {
        imageDiv.appendChild(
          createOptimizedPicture(card.image, card.title, false, [{ width: '750' }])
        );
      }

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'cards-card-body';  
      bodyDiv.innerHTML = `
        <h5>${card.title}</h5>
        <p>${card.description}</p>
        <button class="unlike-btn" data-id="${card._id}"><img src="/icons/dislike.svg" alt="unlike"></button>
      `;

      li.append(imageDiv, bodyDiv);
      ul.appendChild(li);
    });

    ul.addEventListener('click', async (e) => {
      if (e.target.classList.contains('unlike-btn')) {
        const cardId = e.target.dataset.id;
        const deleteUrl = `http://localhost:5000/api/favorites/${username}/${cardId}`;

        try {
          const res = await fetch(deleteUrl, { method: 'DELETE' });
          const result = await res.json();

          if (result.success) {
            e.target.closest('li').remove();
          } else {
            console.warn('Failed to remove card:', result.message);
            alert('Failed to remove favorite. Try again.');
          }
        } catch (err) {
          console.error('Error removing card:', err);
          alert('Server error. Try again later.');
        }
      }
    });

  } catch (err) {
    console.error('Error loading dynamic favorites:', err);
    ul.innerHTML = '<li><p>Error loading favorites. Please try again.</p></li>';
  }
}
