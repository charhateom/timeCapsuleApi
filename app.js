const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const capsuleRoutes = require('./routes/capsule');

dotenv.config();

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/capsules', capsuleRoutes);

module.exports = app;
