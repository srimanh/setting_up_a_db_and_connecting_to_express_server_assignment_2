const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const User = require('./schema');

dotenv.config();

const app = express();
const port = 3010;

app.use(bodyParser.json());

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
  }
};

app.post('/api/users', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Validation error: All fields are required' });
  }

  try {
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Validation error: Email already exists' });
    }
    console.error(`Error saving user: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use(express.static('static'));
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, async () => {
  console.log(`Example app listening at http://localhost:${port}`);
  await connectToDatabase();
});
