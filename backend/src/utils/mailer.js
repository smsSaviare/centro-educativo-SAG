const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, html) {
  const info = await transporter.sendMail({
    from: `"Centro Educativo SAG" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  console.log("Correo enviado: %s", info.messageId);
}

module.exports = sendEmail;
