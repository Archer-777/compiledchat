// Local CORS Proxy Server for Web Development
// Forwards API calls to Fast2SMS and Resend to bypass browser CORS restrictions.
// On native mobile (Expo Go), fetch works directly — this proxy is only needed for web testing.

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all origins (dev only)
app.use(cors());
app.use(express.json());

// ─── Fast2SMS Proxy ────────────────────────────────────────
app.post('/api/fast2sms', async (req, res) => {
  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': req.headers['x-api-key'] || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Fast2SMS proxy error:', err.message);
    res.status(200).json({ return: false, message: err.message });
  }
});

// ─── Brevo (Email) Proxy ───────────────────────────────────
app.post('/api/brevo', async (req, res) => {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': req.headers['api-key'] || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Brevo proxy error:', err.message);
    res.status(200).json({ error: err.message });
  }
});

const nodemailer = require('nodemailer');

// ─── Gmail SMTP Endpoint ──────────────────────────────────
app.post('/api/send-gmail', async (req, res) => {
  const { userEmail, appPassword, to, subject, html } = req.body;
  if (!userEmail || !appPassword || !to) {
    return res.status(400).json({ error: 'Missing Gmail credentials or recipient address' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: appPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `Next Archer <${userEmail}>`,
      to,
      subject,
      html,
    });

    console.log('Gmail sent successfully:', info.messageId);
    res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Gmail send error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🏹 Next Archer CORS Proxy running on http://localhost:${PORT}\n`);
  console.log('  POST /api/fast2sms  →  https://www.fast2sms.com/dev/bulkV2');
  console.log('  POST /api/resend    →  https://api.resend.com/emails');
  console.log('  POST /api/send-gmail →  Gmail SMTP via Nodemailer\n');
});
