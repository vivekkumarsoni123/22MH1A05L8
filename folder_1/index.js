const express = require('express');
const app = express();
const logger = require('./middleware/logger');
const generateCode = require('./utils/generateCode');
const moment = require('moment');

app.use(express.json());
app.use(logger); // Mandatory logging

// In-memory store: { shortcode: { url, expiry, createdAt } }
const db = {};

// POST /shorturls
app.post('/shorturls', (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || !/^https?:\/\//.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  let code = shortcode || generateCode();

  // If shortcode exists already and wasn't user-defined, generate again
  if (db[code] && !shortcode) {
    code = generateCode();
  }

  // If user requested a shortcode but it's already taken
  if (shortcode && db[shortcode]) {
    return res.status(409).json({ error: 'Shortcode already exists' });
  }

  const expiryTime = moment().add(validity, 'minutes').toISOString();

  db[code] = { url, expiry: expiryTime };

  return res.status(201).json({
    shortLink: `http://localhost:3000/${code}`,
    expiry: expiryTime
  });
});

// GET /:shortcode
app.get('/:shortcode', (req, res) => {
  const code = req.params.shortcode;
  const data = db[code];

  if (!data) {
    return res.status(404).json({ error: 'Short link not found' });
  }

  const now = moment();
  const expiry = moment(data.expiry);

  if (now.isAfter(expiry)) {
    return res.status(410).json({ error: 'Link has expired' });
  }

  return res.redirect(data.url);
});

// GET /stats/:shortcode
app.get('/stats/:shortcode', (req, res) => {
  const code = req.params.shortcode;
  const data = db[code];

  if (!data) {
    return res.status(404).json({ error: 'Short link not found' });
  }

  return res.status(200).json({
    url: data.url,
    expiry: data.expiry
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
