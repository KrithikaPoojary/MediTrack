const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(5002, async () => {
  console.log('Test server listening on port 5002');
  try {
    const res = await fetch('http://localhost:5002/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'test_scratch_' + Date.now() + '@test.com',
        password: '123456',
        role: 'patient',
      }),
    });
    const data = await res.json();
    console.log('TEST RESULT:', data);
  } catch (err) {
    console.error('TEST ERROR:', err);
  } finally {
    server.close();
  }
});
