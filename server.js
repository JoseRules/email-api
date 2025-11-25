require('dotenv').config()
const { Resend } = require('resend');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const {EMAIL_KEY, EMAIL_DEST, SEC_EMAIL_DEST} = process.env;
const resend = new Resend(EMAIL_KEY);

app.use(express.json());

app.post('/data', async (req, res) => {
  const {name, email, message, authenticated, phone, notes, cartItems, total, order_source} = req.body;
  let candleOrderTemplate = '';
  if(order_source === 'gdlglow'){
    candleOrderTemplate = `
    <h1>New Candle Order</h1>
    <p>name: <strong>${name}</strong></p>
    <p>email: <strong>${email}</strong></p>
    <p>phone: <strong>${phone}</strong></p>
    <p>notes: <strong>${notes}</strong></p>
    <p>cartItems: <strong>${cartItems.map(item => {
      const optionsText = item.selectedOptions ? Object.entries(item.selectedOptions).map(([key, value]) => `${key}: ${value}`).join(', ') : '';
      return `<li>${item.name} - ${item.quantity}${optionsText ? ` (${optionsText})` : ''}</li>`;
    }).join('')}</strong></p>
    <p>total: <strong>${total}</strong></p>
  `;
  }
  const unaauthenticatedTemplate = "<strong>someone is viewing your portfolio</strong>";
  const authenticatedTemplate = `
    <p>name: <strong>${name}</strong></p>
    <p>email: <strong>${email}</strong></p>
    <p>message: <strong>${message}</strong></p>
  `;
  const { data, error } = await resend.emails.send({
    from: order_source === 'gdlglow' ? "GDG Glow <onboarding@resend.dev>" : "Portfolio <onboarding@resend.dev>",
    to: order_source === 'gdlglow' ? [EMAIL_DEST, SEC_EMAIL_DEST] : [EMAIL_DEST],
    subject: authenticated ? "Important message!!!" : "View alert!",
    html: authenticated ? authenticatedTemplate : (order_source === 'gdlglow' ? candleOrderTemplate : unaauthenticatedTemplate),
  });

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
})
app.listen(3000);
