import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
    port: process.env.MAIL_PORT || 2525,
    auth: {
        user: process.env.MAIL_USER || 'user',
        pass: process.env.MAIL_PASS || 'pass',
    },
});

export const sendEmail = async (to, subject, text) => {
    try {
        await transporter.sendMail({
            from: '"SevaSetu" <noreply@sevasetu.gov>',
            to,
            subject,
            text,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
