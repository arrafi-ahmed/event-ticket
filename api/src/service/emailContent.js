const eventService = require("./event");
const settingsService = require("./settings");

const {
  formatDate,
  generateQrCode,
  getCurrencySymbol,
} = require("../others/util");
const { jsPDF } = require("jspdf");
const { join } = require("path");
const { readFileSync } = require("fs");
const sizeOf = require("image-size");

exports.generateTicketContent = async (badge, event, tickets, users) => {
  const ticket = tickets.find((item) => item.ticketId == badge.ticketId);
  const user = users.find((item) => item.id == badge.userId);

  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Ticket: ${ticket.name}`, 105, 20, { align: "center" });

  // Load logo image
  const logoPath = join(
    __dirname,
    "..",
    "..",
    "public",
    "event-logo",
    event.logoLeft
  );
  const logoImgData = readFileSync(logoPath).toString("base64");

  // Get the dimensions of the image
  const dimensions = sizeOf(logoPath);
  let aspectRatio = dimensions.width / dimensions.height;
  aspectRatio = aspectRatio <= 1 ? 1.1 : aspectRatio;

  doc.addImage(logoImgData, "JPEG", 90, 25, 30, 30 / aspectRatio);
  // doc.addImage("examples/images/Octonyan.jpg", "JPEG", 90, 25, 30, 30);

  // Ticket content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  // Event name
  doc.text(`Event: ${event.name}`, 105, 60, { align: "center" });

  // Ticket name
  doc.text(`Location: ${event.location}`, 105, 65, { align: "center" });

  // User name and email
  doc.text(`Name: ${user.firstname} ${user.surname}`, 105, 75, {
    align: "center",
  });
  doc.text(`Email: ${user.email}`, 105, 80, { align: "center" });

  // QR Code
  const qrCode = await generateQrCode({ id: badge.id, qrUuid: badge.qrUuid });
  doc.addImage(qrCode, "JPEG", 77, 85, 60, 60);
  // doc.addImage("examples/images/Octonyan.jpg", "JPEG", 77, 85, 60, 60);

  doc.setLineWidth(0); // Set line width
  doc.rect(45, 10, 120, 145); // Draw border

  return { ticketContent: doc, user, emailBodyTicket: ticket.emailBodyTicket };
};

exports.generateInvoiceContent = async (
  tickets,
  users,
  purchase,
  formFillerId,
  eventId,
  eventCurrency,
  promo
) => {
  const currency = getCurrencySymbol(eventCurrency, "symbol");
  const user = users.find((item) => item.id == formFillerId);
  const [event] = await eventService.getEventById(eventId);
  const settings = await settingsService.getSettings();

  //header
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Invoice", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  // Torch Marketing Co Ltd address and logo
  doc.text(`${settings.companyName}`, 15, 30);
  doc.text(`${settings.street}`, 15, 35);
  doc.text(`${settings.town}`, 15, 40);
  doc.text(`${settings.county} ${settings.zip}`, 15, 45);
  doc.text(`${settings.country}`, 15, 50);

  // Load logo image
  const logoPath = join(__dirname, "..", "others", "logo.jpg");
  const logoImgData = readFileSync(logoPath).toString("base64");
  doc.addImage(logoImgData, "JPEG", 130, 30, 60, 20);
  // doc.addImage("examples/images/Octonyan.jpg", "JPEG", 130, 30, 60, 20);

  // Recipient address and Invoice details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Recipient", 15, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${user.organization}\n${user.firstname} ${user.surname}`, 15, 70);

  doc.text("Invoice", 130, 70);
  doc.text(`${String(purchase.id).padStart(8, "0")}`, 160, 70);
  doc.text("Date", 130, 75);
  doc.text(`${formatDate(purchase.createdAt)}`, 160, 75);

  doc.text(`Event: ${event.name}`, 15, 85);

  // Table header
  doc.setFillColor(200, 200, 200);
  doc.rect(15, 90, 180, 8, "F");
  doc.text("Item", 20, 95);
  doc.text("Rate", 145, 95);
  doc.text("Quantity", 160, 95);
  doc.text("Price", 180, 95);

  // Table rows
  let yPos = 103;
  tickets.forEach((ticket) => {
    const ticketPrice = ticket.earlyBirdPrice
      ? ticket.earlyBirdPrice
      : ticket.ticketPrice;

    doc.text(`${ticket.name}`, 20, yPos);
    doc.text(`${currency}${ticketPrice}`, 145, yPos);
    doc.text(`${ticket.quantity}`, 160, yPos);
    doc.text(`${currency}${ticketPrice * ticket.quantity}`, 180, yPos);
    yPos += 7;
  });

  // Notes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Notes", 15, yPos + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${settings.invoiceNotes}`, 15, yPos + 10);

  // Tax and Total
  if (!promo.discountAmount) {
    doc.text(`SubTotal`, 145, yPos + 15);
    doc.text(`${currency}${purchase.subTotalAmount}`, 185, yPos + 15);
  } else {
    doc.text(`SubTotal`, 145, yPos + 10);
    doc.text(`${currency}${purchase.subTotalAmount}`, 185, yPos + 10);
    doc.text(`Discount (${promo.discountText})`, 145, yPos + 15);
    doc.text(`${currency}${promo.discountAmount}`, 185, yPos + 15);
  }
  doc.text(`${event.taxWording} (${event.taxPercentage}%)`, 145, yPos + 20);
  doc.text(`${currency}${purchase.tax}`, 185, yPos + 20);
  doc.text(`Total`, 145, yPos + 25);
  doc.text(`${currency}${purchase.totalAmount}`, 185, yPos + 25);
  doc.text("Amount Paid", 145, yPos + 30);
  doc.text(
    `${currency}${
      purchase.paymentStatus == "succeeded" ? purchase.totalAmount : 0.0
    }`,
    185,
    yPos + 30
  );
  doc.text("Balance Due", 145, yPos + 35);
  doc.text(
    `${currency}${
      purchase.paymentStatus != "succeeded" ? purchase.totalAmount : 0.0
    }`,
    185,
    yPos + 35
  );

  event.bankDetailsCurrencies.forEach((item, index) => {
    let position = {
      titleX: null,
      titleY: null,
      detailsX: null,
      detailsY: null,
    };
    if (index === 0) {
      Object.assign(position, {
        titleX: 15,
        titleY: yPos + 45,
        detailsX: 15,
        detailsY: yPos + 50,
      });
    } else if (index === 1) {
      Object.assign(position, {
        titleX: 110,
        titleY: yPos + 45,
        detailsX: 110,
        detailsY: yPos + 50,
      });
    } else if (index === 2) {
      Object.assign(position, {
        titleX: 15,
        titleY: yPos + 75,
        detailsX: 15,
        detailsY: yPos + 70,
      });
    }

    if (Number(item) === 0) {
      doc.text(`Paying in USD:`, position.titleX, position.titleY);
      doc.text(
        `${settings.bankDetailsUsd}:`,
        position.detailsX,
        position.detailsY
      );
    } else if (Number(item) === 1) {
      doc.text(`Paying in GBP:`, position.titleX, position.titleY);
      doc.text(
        `${settings.bankDetailsGbp}:`,
        position.detailsX,
        position.detailsY
      );
    } else if (Number(item) === 2) {
      doc.text(`Paying in EUR:`, position.titleX, position.titleY);
      doc.text(
        `${settings.bankDetailsEur}:`,
        position.detailsX,
        position.detailsY
      );
    }
  });

  // Footer
  doc.text(`${settings.invoiceFooter}`, 15, 210 + 75);

  return { invoiceContent: doc, user, event };
};

exports.generatePassResetContent = (token, CLIENT_BASE_URL) => {
  return `
    <p>Hello</p>
    <p>Click the button to reset password, will be valid for 1 hour.</p>
    <a href="${CLIENT_BASE_URL}/reset-password/?token=${token}"><button style="background-color: #e40046; color: white; border: none; padding: 10px;">Reset Password</button></a>
    <p>Best wishes,<br>QuickStarter</p>`;
};
