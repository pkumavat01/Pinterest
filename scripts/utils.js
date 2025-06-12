async function loginUser(username, password) {
  const res = await fetch('https://localhost:4000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    return true;
  } else {
    return false;
  }
}
