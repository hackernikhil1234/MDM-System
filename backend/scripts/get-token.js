const axios = require('axios');
require('dotenv').config();

const email = process.env.INITIAL_ADMIN_EMAIL || 'admin@mdmportal.com';
const password = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMeImmediately123!';
const port = process.env.PORT || 5000;

async function getToken() {
  try {
    const response = await axios.post(`http://localhost:${port}/api/auth/login`, {
      email,
      password
    });
    console.log(response.data.token);
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

getToken();
