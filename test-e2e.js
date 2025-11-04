import axios from 'axios';

(async () => {
  try {
    // Try registering (ignore errors if exists)
    try {
      await axios.post('http://localhost:3000/auth/register', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      }, { timeout: 5000 });
    } catch (e) {
      // ignore registration errors
    }

    const loginResp = await axios.post('http://localhost:3000/auth/login', {
      username: 'testuser',
      password: 'password123'
    }, { timeout: 5000 });

    const token = loginResp.data.token;
    console.log('Obtained token:', !!token);

    const predictResp = await axios.post('http://localhost:3000/api/trends/predict', {
      topic: 'AI'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 120000
    });

    console.log(JSON.stringify(predictResp.data, null, 2));
  } catch (err) {
    console.error('E2E test error:', err.message);
    console.error(err.stack);
    if (err.response) {
      try { console.error(JSON.stringify(err.response.data, null, 2)); } catch(e) { console.error(err.response.data); }
    }
    process.exit(1);
  }
})();
