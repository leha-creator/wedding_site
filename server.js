require('dotenv').config();
const express = require('express');
const path = require('path');
const submitRouter = require('./src/routes/submit');
const formRouter = require('./src/routes/form');
const adminRouter = require('./src/routes/admin');
const { basicAuth } = require('./src/middleware/auth');
const { initDb } = require('./src/db');

initDb();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use('/api', submitRouter);
app.use('/api/form', formRouter);

app.get('/admin', basicAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});
app.use('/api/admin', basicAuth, adminRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
