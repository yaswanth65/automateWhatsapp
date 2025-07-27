require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

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

app.post('/api/schedule', (req, res) => {
  const tasks = req.body.tasks;
  tasks.forEach(task => {
    scheduleMessage(task);
  });
  res.json({ message: 'Tasks scheduled successfully!' });
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));