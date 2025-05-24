const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const logoPath = path.join(__dirname, "LOGO2.jpg");
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logoDataUrl = `data:image/jpeg;base64,${logoBase64}`;


router.post("/generate", async (req, res) => {
  const invoice = req.body;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
     // Step 1: Generate rows HTML from productsDetails array
    const tableRows = invoice.productsDetails.map((product) => {
      return `
        <tr>
          <td>${product.productCode}</td>
          <td>${product.name}</td>
          <td>${product.quantity}</td>
          <td>${product.perproductprice}</td>
          <td>${product.Price}</td>
        </tr>
      `;
    }).join("");
    const htmlContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #e5e7eb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      background-color: #f3f4f6;
      border: 4px solid #9ca3af;
      border-radius: 1rem;
      margin: 30px auto;
      padding: 20px;
    }
    .logo-container {
      text-align: center;
      margin-top: 30px;
    }
    .logo {
      height: 150px;
      width: 200px;
      border-radius: 1rem;
    }
    .header, .details, .summary, .terms, .footer {
      text-align: center;
      margin-top: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 2px solid #6b7280;
      padding: 8px;
      text-align: center;
    }
    .terms ul {
      list-style-type: disc;
      padding-left: 20px;
      text-align: left;
    }
    .buttons {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
    }
    .buttons button {
      background-color: #d1d5db;
      border: 1px solid black;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
    }
    .buttons button:hover {
      background-color: #fde68a;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <img src="${logoDataUrl}" alt="LOGO" class="logo">
    </div>
    <div class="header">
      <h1>NEW NOBEL FOOTWEAR</h1>
      <p>G-6/7, Jethwani Super Market,<br>B/s Bus Stand DABHOI-391110<br>(P) 9173912755<br>GST ID : 24ADEPC4866F1ZT</p>
      <p><strong>BILL OF SUPPLY</strong></p>
    </div>
    <div class="details">
      <p>Bill No: ${invoice.invoiceNumber} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ${invoice.date} </p>
      <p>Customer: ${invoice.name}</p>
      <p>Email ID: ${invoice.email}</p>
      <p>Phone No: ${invoice.phonenumber}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Product Code</th>
          <th>Description</th>
          <th>QTY</th>
          <th>MRP</th>
          <th>AMT</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
    <div class="summary">
      <h3><u>PAYMENT SUMMARY</u></h3>
      <p>Gross Amount: ${invoice.subtotal}</p>
      <p>You Save Rs: ${invoice.discount}</p>
      <p>Net Amount: ${invoice.total}</p>
    </div>

    <div class="terms" style="display: flex; flex-direction: column; align-items: center;">
      <h3><u>TERMS & CONDITIONS</u></h3>
      <ul>
        <li>Goods once sold will not be taken back.</li>
        <li>No exchange without original invoice & barcode.</li>
        <li>No guarantee. No refund.</li>
        <li>If any item is on sale, it is not refundable or exchangeable.</li>
        <li>We are in the composition scheme, so all taxes are included.</li>
        <li>Any item will not be taken back after 7 days.</li>
        <li>Subject to Dabhoi jurisdiction.</li>
      </ul>
    </div>

    <div class="footer">
      <h2>WE DON'T HAVE ANY OTHER FRANCHISE</h2>
      <p>THANK YOU SO MUCH FOR SHOPPING. VISIT AGAIN.</p>
    </div>
  </div>
</body>
</html>

    `;

    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: "A4" });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=invoice.pdf",
    });

    res.send(pdf);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).send("Failed to generate PDF");
  }
});

module.exports = router;
