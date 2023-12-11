const puppeteer = require("puppeteer");
const nodeMailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

const transporter = nodeMailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  return transporter.sendMail({
    from: `Torch Events <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

const sendMailWAttachment = async (to, subject, text, html) => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();

  return transporter.sendMail({
    from: `Torch Events <${SMTP_USER}>`,
    to,
    subject,
    text, //each reg form will have different text for email, save and load from db
    attachments: [
      {
        filename: "attachment.pdf",
        content: pdfBuffer,
      },
    ],
  });
};

module.exports = {
  sendMail,
  sendMailWAttachment,
};
