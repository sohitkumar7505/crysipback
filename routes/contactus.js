import express from 'express';
import { Resend } from 'resend';

const resend = new Resend('process.env.Resend_API');
const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, message, subject } = req.body;

  // Simple server-side validation
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vkvermaa134@gmail.com', // recipient email
      subject: subject || 'No subject provided',
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong> ${message}</p>`
    });

    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
});

export default router;
