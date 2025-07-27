require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

// Validate required .env variables
if (!process.env.ACCOUNT_SID || !process.env.AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER) {
  console.error('❌ Missing required environment variables.');
  process.exit(1);
}

const client = twilio(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);

function scheduleMessage({ message, to, time }) {
  const targetTime = new Date(time);
  const delay = targetTime.getTime() - Date.now();

  if (delay < 0) {
    console.log(`⏰ Time passed for ${to}, skipping.`);
    return;
  }

  setTimeout(() => {
    client.messages
      .create({
        body: message,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${to}`,
      })
      .then(msg => console.log('✅ Sent to', to, 'SID:', msg.sid))
      .catch(err => console.error('❌ Failed to send to', to, err.message));
  }, delay);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Root route to avoid 404 errors on `/`
app.get('/', (req, res) => {
  res.send('🌐 WhatsApp Scheduler backend is live');
});

// 🎯 Main API
app.post('/api/schedule', (req, res) => {
  const tasks = req.body.tasks;
  if (!Array.isArray(tasks)) {
    return res.status(400).json({ error: 'Invalid payload. Expected array of tasks.' });
  }

  tasks.forEach(scheduleMessage);
  res.json({ message: 'Tasks scheduled successfully!' });
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
