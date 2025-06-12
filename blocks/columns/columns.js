import { handleLoginClick } from '../../scripts/auth.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });

  if (block.classList.contains('forms')) {
    console.log("Forms found")
    const columns = block.querySelectorAll(':scope > div ');
    console.log(columns[0])
    if (columns.length >= 2) {
      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.placeholder = 'Enter Username';
      usernameInput.id = 'username';
      columns[0].lastElementChild.appendChild(usernameInput);

      const passwordWrapper = document.createElement('div');
      passwordWrapper.style.position = 'relative';

      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.placeholder = 'Enter Password';
      passwordInput.id = 'password';
/*
      const eyeIcon = document.createElement('span');
      eyeIcon.textContent = '👁️';
      eyeIcon.style.position = 'absolute';
      eyeIcon.style.right = '10px';
      eyeIcon.style.top = '50%';
      eyeIcon.style.transform = 'translateY(-50%)';
      eyeIcon.style.cursor = 'pointer';

      eyeIcon.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
      });
*/
      passwordWrapper.appendChild(passwordInput);
      //passwordWrapper.appendChild(eyeIcon);
      columns[1].lastElementChild.appendChild(passwordWrapper);

      const errorMsg = document.createElement('p');
      errorMsg.id = 'login-error';
      errorMsg.style.color = 'red';
      errorMsg.style.marginTop = '10px';
      columns[1].lastElementChild.appendChild(errorMsg);

      handleLoginClick({ usernameInput, passwordInput, errorMsg });
    }
  }
}
