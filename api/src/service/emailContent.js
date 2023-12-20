const eventService = require("./event");
const {
  formatDate,
  generateQrCode,
  getCurrencySymbol,
} = require("../others/util");
const { jsPDF } = require("jspdf");
const { join } = require("path");
const { readFileSync } = require("fs");

exports.generateTicketContent = async (badge, event, tickets, users) => {
  const qrCode = await generateQrCode(
    JSON.stringify({ id: badge.id, qrUuid: badge.qrUuid })
  );
  const ticket = tickets.find((item) => item.ticketId == badge.ticketId);
  const user = users.find((item) => item.id == badge.userId);

  const doc = new jsPDF();

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Ticket", 105, 20, { align: "center" });

  // Ticket content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  // Event name
  doc.text(`Event: ${event.name}`, 105, 30, { align: "center" });

  // Ticket name
  doc.text(`Ticket: ${ticket.name}`, 105, 35, { align: "center" });

  // User name and email
  doc.text(`Name: ${user.firstname} ${user.surname}`, 105, 50, {
    align: "center",
  });
  doc.text(`Email: ${user.email}`, 105, 55, { align: "center" });

  // QR Code
  const qrCodeData = qrCode.split(",")[1]; // Extract base64 data
  doc.addImage(qrCodeData, "JPEG", 77, 65, 60, 60);

  doc.setLineWidth(0); // Set line width
  doc.rect(45, 10, 120, 120); // Draw border

  return { ticketContent: doc, user };
};

exports.generateInvoiceContent = async (
  tickets,
  users,
  purchase,
  formFillerId,
  eventId,
  eventCurrency
) => {
  const currency = getCurrencySymbol(eventCurrency, "symbol");
  const user = users.find((item) => item.id == formFillerId);
  const [event] = await eventService.getEventById(eventId);

  const doc = new jsPDF();
  //header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Invoice", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  // Torch Marketing Co Ltd address and logo
  doc.text("Torch Marketing Co Ltd", 15, 30);
  doc.text("200 Ware Road", 15, 35);
  doc.text("Hoddesdon", 15, 40);
  doc.text("Herts EN11 9EY", 15, 45);
  doc.text("United Kingdom", 15, 50);

  // Load logo image
  const logoPath = join(__dirname, "..", "others", "logo.jpg");
  const logoImgData = readFileSync(logoPath).toString("base64");
  doc.addImage(logoImgData, "JPEG", 130, 30, 60, 20);

  // Recipient address and Invoice details
  doc.setFont("helvetica", "bold");
  doc.text("Recipient", 15, 65);
  doc.setFont("helvetica", "normal");
  doc.text(`${user.organization}\n${user.firstname} ${user.surname}`, 15, 70);

  doc.text("Invoice #", 130, 70);
  doc.text(`${String(purchase.id).padStart(8, "0")}`, 160, 70);
  doc.text("Date", 130, 75);
  doc.text(`${formatDate(purchase.createdAt)}`, 160, 75);

  // Table header
  doc.setFillColor(200, 200, 200);
  doc.rect(15, 90, 180, 10, "F");
  doc.text("Item", 20, 95);
  doc.text("Rate", 145, 95);
  doc.text("Quantity", 160, 95);
  doc.text("Price", 180, 95);

  // Table rows
  let yPos = 105;
  tickets.forEach((ticket) => {
    doc.text(ticket.name, 20, yPos);
    doc.text(`${currency}${ticket.ticketPrice}`, 145, yPos);
    doc.text(`${ticket.quantity}`, 160, yPos);
    doc.text(`${currency}${ticket.ticketPrice * ticket.quantity}`, 180, yPos);
    yPos += 7;
  });

  // Tax and Total
  doc.text(`${event.taxPercentage}% tax included`, 15, yPos + 10);
  doc.text("Tax", 145, yPos + 15);
  doc.text(`${currency}${purchase.tax}`, 175, yPos + 15);
  doc.text("Total", 145, yPos + 20);
  doc.text(`${currency}${purchase.totalAmount}`, 175, yPos + 20);
  doc.text("Amount Paid", 145, yPos + 25);
  doc.text(
    `${currency}${
      purchase.paymentStatus == "succeeded" ? purchase.totalAmount : 0.0
    }`,
    175,
    yPos + 25
  );
  doc.text("Balance Due", 145, yPos + 30);
  doc.text(
    `${currency}${
      purchase.paymentStatus != "succeeded" ? purchase.totalAmount : 0.0
    }`,
    175,
    yPos + 30
  );

  // Notes
  doc.setFont("helvetica", "bold");
  doc.text("Notes", 15, yPos + 40);
  doc.setFont("helvetica", "normal");
  doc.text("Payment required before entry allowed.", 15, yPos + 45);
  doc.text(
    "Payment terms: \nFull payment is due within 28 days of invoice date.",
    15,
    yPos + 50
  );

  doc.text("Paying in US$:", 130, yPos + 45);
  doc.text("Bank: Natwest Bank PLC", 130, yPos + 50);
  doc.text("Account Name: Torch Marketing Co. Ltd.", 130, yPos + 55);
  doc.text("IBAN: GB03NWBK60730120628943", 130, yPos + 60);
  doc.text("SWIFT/BIC: NWBKGB2L", 130, yPos + 65);

  // Footer
  doc.text(
    "Torch Marketing Co. Ltd. Registered in England: 7849677 | Registered in US: EIN: 98-1405444",
    15,
    yPos + 80
  );

  return { invoiceContent: doc, user, event };
};

exports.generatePassResetContent = (token, CLIENT_BASE_URL) => {
  return `
    <p>Hello</p>
    <p>Click the button to reset password, will be valid for 1 hour.</p>
    <a href="${CLIENT_BASE_URL}/reset-password/?token=${token}"><button style="background-color: #e40046; color: white; border: none; padding: 10px;">Reset Password</button></a>
    <p>Best wishes,<br>QuickStarter</p>`;
};
