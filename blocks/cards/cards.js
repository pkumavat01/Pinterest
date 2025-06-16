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
        heartBtn.style.opacity = 0.4; // visually indicate liked
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

      const imageDiv = document.createElement('div');
      imageDiv.className = 'cards-card-image';
      imageDiv.appendChild(
        createOptimizedPicture(card.image, card.title, false, [{ width: '750' }])
      );

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'cards-card-body';  
      bodyDiv.innerHTML = `
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <button class="unlike-btn" data-id="${card._id}">Remove</button>
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
