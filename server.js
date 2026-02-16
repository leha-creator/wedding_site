require('dotenv').config();
const express = require('express');
const path = require('path');
const submitRouter = require('./src/routes/submit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.use('/api', submitRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
