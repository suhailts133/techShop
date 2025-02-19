const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function createInvoice(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    try {
      generateHeader(doc);
      generateCustomerInformation(doc, invoice);
      generateInvoiceTable(doc, invoice);
      generateFooter(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function generateHeader(doc) {
  const logoPath = path.join(process.cwd(), "public", "uploads", "logo", "logo.png");
 
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 50 });
  } else {
    console.warn("Logo image not found, skipping...");
  }

  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Tech Shop", 110, 57, {align:"center"})
    .fontSize(10)
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);
  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.orderId, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Payment Method:", 50, customerInformationTop + 30)
    .text(invoice.paymentMethod, 150, customerInformationTop + 30)
    .font("Helvetica-Bold")
    .text(invoice.shippingAddress.name, 300, customerInformationTop, { align: "right" })
    .font("Helvetica")
    .text(invoice.shippingAddress.houseAddress, 300, customerInformationTop + 15, { align: "right" })
    .text(
      `${invoice.shippingAddress.city}, ${invoice.shippingAddress.state}, India`,
      300,
      customerInformationTop + 30,
      { align: "right" }
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(doc, invoiceTableTop, "Item", "Unit Price", "Quantity", "Sub Total");
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.productName,
      formatCurrency(item.unitPrice),
      item.quantity,
      formatCurrency(item.unitPrice * item.quantity)
    );

    generateHr(doc, position + 20);
  }

  const totalAmountPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(doc, totalAmountPosition, "", "", "Total Amount", formatCurrency(invoice.totalAmount));

  const paidToDatePosition = totalAmountPosition + 20;
  generateTableRow(doc, paidToDatePosition, "", "", "Payment Method", invoice.paymentMethod);
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Thank you for shopping with us. For any queries, contact our support team.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(doc, y, item, unitPrice, quantity, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(unitPrice, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(amount) {
  return "₹" + amount.toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${year}/${month}/${day}`;
}

async function sendInvoiceEmail(email, orderDetails) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    });

    const { items, totalAmount, orderId ,shippingAddress} = orderDetails;
    console.log("data from sending mail",orderDetails);
    
    const pdfBuffer = await createInvoice(orderDetails);

    const itemsList = items.map(
      item => `<li>${item.productName} (Qty: ${item.quantity}) - ₹${item.price.toFixed(2)}</li>`
    ).join("");

    const emailContent = `
      <h2>Thank you for your purchase!</h2>
      <p>Your order (#${orderId}) has been processed successfully.</p>
      
      <h3>Order Summary:</h3>
      <ul>${itemsList}</ul>
      
      <h3>Total Amount: ₹${totalAmount.toFixed(2)}</h3>
      
      <p>Please find your invoice attached to this email.</p>
      <p>For any queries, contact our support team.</p>
      
      <br>
      <p>Best regards,</p>
      <p><strong>Tech Shop Team</strong></p>
    `;

    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: `Your Order Invoice #${orderId} - Tech Shop`,
      html: emailContent,
      attachments: [{
        filename: `invoice_${orderId}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf"
      }]
    });

    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error sending invoice email:", error.message);
    return false;
  }
}

module.exports = {
  sendInvoiceEmail
};
