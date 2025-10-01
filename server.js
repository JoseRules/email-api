require('dotenv').config()
const { Resend } = require('resend');
const express = require('express');

const app = express();
const {EMAIL_KEY, EMAIL_DEST} = process.env;
const resend = new Resend(EMAIL_KEY);

app.use(express.json());

app.post('/data', async (req, res) => {
  const {name, email, message, authenticated} = req.body;
  const unaauthenticatedTemplate = "<strong>someone is viewing your portfolio</strong>";
  const authenticatedTemplate = `
    <p>name: <strong>${name}</strong></p>
    <p>email: <strong>${email}</strong></p>
    <p>message: <strong>${message}</strong></p>
  `;
  const { data, error } = await resend.emails.send({
    from: "Portfolio <onboarding@resend.dev>",
    to: [EMAIL_DEST],
    subject: authenticated ? "Important message!!!" : "View alert!",
    html: authenticated ? authenticatedTemplate : unaauthenticatedTemplate,
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
})
app.listen(3000);
