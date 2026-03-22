const nodemailer = require("nodemailer");

const hasEmailConfig = () => {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

const getTransporter = () => {
  if (!hasEmailConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, htmlBody) => {
  if (!to) {
    return { skipped: true, reason: "missing-recipient" };
  }

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email skipped] Missing EMAIL_USER or EMAIL_PASS. Subject: ${subject}`);
    return { skipped: true, reason: "missing-config" };
  }

  const mailOptions = {
    from: `SevaSetu <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlBody,
  };

  const result = await transporter.sendMail(mailOptions);
  return { skipped: false, messageId: result.messageId };
};

module.exports = {
  sendEmail,
};
