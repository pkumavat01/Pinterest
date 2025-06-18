import { handleLoginClick ,handleSignupClick} from '../../scripts/auth.js';

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
      passwordWrapper.appendChild(passwordInput);
      columns[1].lastElementChild.appendChild(passwordWrapper);

      const errorMsg = document.createElement('p');
      errorMsg.id = 'login-error';
      errorMsg.style.color = 'red';
      errorMsg.style.marginTop = '10px';
      columns[1].lastElementChild.appendChild(errorMsg);

      handleLoginClick({ usernameInput, passwordInput, errorMsg });
    }
  }

  if (block.classList.contains('forms-signup')) {
  console.log("Signup form found");

  const columns = block.querySelectorAll(':scope > div ');
  if (columns.length >= 2) {
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.placeholder = 'Create Username';
    usernameInput.id = 'signup-username';
    columns[0].lastElementChild.appendChild(usernameInput);

    const passwordWrapper = document.createElement('div');
    passwordWrapper.style.position = 'relative';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Create Password';
    passwordInput.id = 'signup-password';
    passwordWrapper.appendChild(passwordInput);
    columns[1].lastElementChild.appendChild(passwordWrapper);

    const errorMsg = document.createElement('p');
    errorMsg.id = 'signup-error';
    errorMsg.style.color = 'red';
    errorMsg.style.marginTop = '10px';
    columns[1].lastElementChild.appendChild(errorMsg);

    handleSignupClick({ usernameInput, passwordInput, errorMsg });
  }
}

}
