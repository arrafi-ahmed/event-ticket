const jsPDF = require("jspdf");
const html2canvas = require("html2canvas");
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
    from: `QuickStarter <${SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

const sendMailWAttachment = async (to, subject, text, html) => {
  const canvas = await html2canvas(html);
  const doc = new jsPDF();
  doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0);
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

  return transporter.sendMail({
    from: `QuickStarter <${SMTP_USER}>`,
    to,
    subject,
    text, //each reg form will have different text for email, save and load from db
    attachments: [
      {
        filename: "invoice.pdf",
        content: pdfBuffer,
      },
    ],
  });
};

module.exports = {
  sendMail,
  sendMailWAttachment,
};
