// auth.js
export function handleLoginClick({ usernameInput, passwordInput, errorMsg }) {
  const loginBtn = document.querySelector('.button[title="Login"]');
  if (!loginBtn) return;

  loginBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    errorMsg.textContent = '';

    if (!username || !password) {
      errorMsg.textContent = 'Please enter both username and password.';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        window.location.href = '/ideas';
      } else {
        errorMsg.textContent = 'Invalid username or password.';
      }
    } catch (err) {
      errorMsg.textContent = 'Server error. Please try again later.';
      console.error(err);
    }
  });
}

export function handleSignupClick({ usernameInput, passwordInput, errorMsg }) {
  const signupBtn = document.querySelector('.button[title="Signup"]');
  if (!signupBtn) return;

  signupBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    errorMsg.textContent = '';

    if (!username || !password) {
      errorMsg.textContent = 'Please enter both username and password.';
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('username', username);
        window.location.href = '/ideas';
      } else {
        errorMsg.textContent = data.message || 'Signup failed.';
      }
    } catch (err) {
      errorMsg.textContent = 'Server error. Please try again later.';
      console.error(err);
    }
  });
}
