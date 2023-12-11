const eventService = require("./event");
const {
  formatDate,
  logoSvgString,
  generateQrCode,
  getCurrencySymbol,
} = require("../others/util");

exports.generateTickets = async (badge, event, tickets, users) => {
  const qrCode = await generateQrCode(
    JSON.stringify({ id: badge.id, qrUuid: badge.qrUuid })
  );
  const ticket = tickets.find((item) => item.ticketId == badge.ticketId);
  const user = users.find((item) => item.id == badge.userId);

  const ticketContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Ticket</title>
    <style>
        .ticket,h1{text-align:center}body,html{font:16px/1 'Open Sans',sans-serif}body{height:5in;width:4in;padding:0;margin:0 auto;overflow:hidden;background:#fff}.ticket{border-radius:5px;box-shadow:0 10px 20px rgba(0,0,0,.1);padding:30px;transition:.3s}header h1{background:#000;color:#fff;padding:.5em 0;border-radius:.25em}h1{font:bold 100% sans-serif;letter-spacing:.5em;text-transform:uppercase}#event-name{color:#333;margin-bottom:10px}#ticket-name{color:#777;margin-bottom:20px}#email,#user-name{color:#999;margin-bottom:10px}.qr-code{margin-top:20px}.qr-code img{max-width:100%;height:auto;border-radius:10px}
    </style>
</head>
<body>
<header>
    <h1>Ticket</h1>
</header>
<article class="ticket">
    <h2 id="event-name">${event.name}</h2>
    <h3 id="ticket-name">${ticket.name}</h3>
    <p id="user-name">${user.firstname} ${user.surname}</p>
    <p id="email">${user.email}</p>
    <div class="qr-code">
        <!-- Replace 'data:image/png;base64,...' with your QR code data URL -->
        <img id="qr-code" alt="QR Code" src="${qrCode}">
    </div>
</article>
</body>
</html>
`;

  return { ticketContent, user };
};

exports.generateInvoice = async (
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

  const invoiceContent =
    `
<html xmlns="http://www.w3.org/1999/html">
<head>
    <meta charset="utf-8">
    <title>Invoice</title>
    <style>
        body,html{padding:.5in}header h1,td,th{border-radius:.25em}article,article address,header,header h1,table.inventory,table.meta{margin:0 0 1em}header span,td,th{position:relative}span[]{display:inline-block}.pt-15{padding-top:15px}h1{font:bold 100% sans-serif;letter-spacing:.5em;text-align:center;text-transform:uppercase}table{font-size:75%;table-layout:fixed;width:100%;border-collapse:separate;border-spacing:2px}td,th{border-width:1px;padding:.5em;text-align:left;border-style:solid}th{background:#eee;border-color:#bbb}td{border-color:#ddd}html{font:16px/1 'Open Sans',sans-serif;overflow:auto;background:#999;cursor:default}body{box-sizing:border-box;height:11in;margin:0 auto;overflow:hidden;width:8.5in;background:#fff;border-radius:1px;box-shadow:0 0 1in -.25in rgba(0,0,0,.5)}article:after,header:after,table.balance:after,table.meta:after{clear:both;content:"";display:table}header h1{background:#000;color:#fff;padding:.5em 0}header address{float:left;font-size:75%;font-style:normal;line-height:1.25;margin:0 1em 1em 0}header address p{margin:0 0 .25em}header img,header span{display:block;float:right}header .logo{width:150px;margin:1em}article h1{clip:rect(0 0 0 0);text-align:left}article address{float:left;line-height:1.2rem!important}.event-title{clear:both;font-size:80%;padding-bottom:6px}.footer{clear:both}.float-left{float:left}.float-right{float:right}table.balance,table.meta{float:right;width:36%}table.meta th{width:40%}table.meta td{width:60%}table.inventory{clear:both;width:100%}table.inventory th{font-weight:700;text-align:center}table.inventory td:first-child{width:26%}table.inventory td:nth-child(2){width:38%}table.inventory td:nth-child(3),table.inventory td:nth-child(4),table.inventory td:nth-child(5){text-align:right;width:12%}table.balance td,table.balance th{width:50%}table.balance td{text-align:right}aside h1{border:#999;border-width:0 0 1px;border-bottom-style:solid}aside p{line-height:.6rem;font-size:.8rem}@media print{*{-webkit-print-color-adjust:exact}html{background:0 0;padding:0}body{box-shadow:none;margin:0}.add,.cut,span:empty{display:none}}@page{margin:0}
    </style>
</head>
<body>
<header>
    <h1>Invoice</h1>
    <address>
        <p><strong>Torch Marketing Co Ltd</strong></p>
        <p>200 Ware Road</p>
        <p>Hoddesdon</p>
        <p>Herts EN11 9EY</p>
        <p>United Kingdom</p>
    </address>
    <span class="logo">
        ${logoSvgString}
    </span>
</header>
<article>
    <address>
        <p><strong>Recipient</strong></p>
        <p>${user.organization}<br>${user.firstname} ${user.surname}</p>
    </address>
    <table class="meta">
        <tr>
            <th><span>Invoice #</span></th>
            <td><span>${String(purchase.id).padStart(8, "0")}</span></td>
        </tr>
        <tr>
            <th><span>Date</span></th>
            <td><span>${formatDate(purchase.createdAt)}</span></td>
        </tr>
    </table>
    <div class="event-title">
        <strong>Event: </strong>
        <span>${event.name}</span>
    </div>
    <table class="inventory">
        <thead>
        <tr>
            <th><span>Item</span></th>
            <th><span>Rate</span></th>
            <th><span>Quantity</span></th>
            <th><span>Price</span></th>
        </tr>
        </thead>
        <tbody>` +
    tickets
      .map((ticket) => {
        return `<tr>
                    <td><span>${ticket.name}</span></td>
                    <td><span data-prefix>${currency}</span><span>${
          ticket.ticketPrice
        }</span></td>
                    <td><span>${ticket.quantity}</span></td>
                    <td><span data-prefix>${currency}</span><span>${
          ticket.ticketPrice * ticket.quantity
        }</span></td>
                  </tr>`;
      })
      .join("") +
    `</tbody>
    </table>
    <span>
        <small class="ml-auto">${event.taxPercentage}% tax included</small>
    </span>
    <table class="balance">
        <tr>
            <th><span>Tax</span></th>
            <td><span data-prefix>${currency}</span><span>${
      purchase.tax
    }</span></td>
        </tr>
        <tr>
            <th><span>Total</span></th>
            <td><span data-prefix>${currency}</span><span>${
      purchase.totalAmount
    }</span></td>
        </tr>
        <tr>
            <th><span>Amount Paid</span></th>
            <td><span data-prefix>${currency}</span><span>${
      purchase.paymentStatus == "succeeded" ? purchase.totalAmount : 0.0
    }</span></td>
        </tr>
        <tr>
            <th><span>Balance Due</span></th>
            <td><span data-prefix>${currency}</span><span>${
      purchase.paymentStatus != "succeeded" ? purchase.totalAmount : 0.0
    }</span></td>
        </tr>
    </table>
</article>
<aside>
    <h1><span>Notes</span></h1>
    <div>
        <div class="float-left">
            <p>Payment required before entry allowed.</p>
            <p>Payment terms: Full payment is due within 28 days of invoice date.</p>
        </div>

        <div class="float-right">
            <p>Paying in US$:</p>
            <p>Bank: Natwest Bank PLC</p>
            <p>Account Name: Torch Marketing Co. Ltd.</p>
            <p>IBAN: GB03NWBK60730120628943</p>
            <p>SWIFT/BIC: NWBKGB2L</p>
        </div>


        <p class="footer pt-15">Torch Marketing Co. Ltd. Registered in England: 7849677 | Registered in US: EIN:
            98-1405444</p>
    </div>
</aside>
</body>
</html>`;

  return { invoiceContent, user, event };
};