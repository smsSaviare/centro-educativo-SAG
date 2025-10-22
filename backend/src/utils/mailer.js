// utils/mailer.js
const nodemailer = require("nodemailer");

// Configura el transporter de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,                 // ej: smtp.gmail.com
  port: Number(process.env.SMTP_PORT),         // ⚠ convertir a número
  secure: process.env.SMTP_SECURE === "true",  // true para puerto 465
  auth: {
    user: process.env.EMAIL_USER,              // tu email
    pass: process.env.EMAIL_PASS,              // App Password de Gmail
  },
});

// Función para enviar correo
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"Centro Educativo SAG" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Correo enviado:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
    throw error; // relanza el error para que authRoutes.js lo capture
  }
}

module.exports = sendEmail;
