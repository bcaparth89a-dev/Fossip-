const express = require("express");
const nodemailer = require("nodemailer");
const { generatePDFBuffer } = require("./utils/generatePDFBuffer");
const cors = require("cors");
const bodyParser = require('body-parser');
const pdfRoutes = require('./routes/pdfRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/pdf', pdfRoutes);

app.post("/send-email", async (req, res) => {
  const { to, subject, text } = req.body;

  // Create transporter with your email details
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "bcaparth89a@gmail.com", // 👈 your Gmail
      pass: "clmw zzjf volr wmma", // 👈 Use App Password, not your Gmail password
    },
  });

  let mailOptions = {
    from: "bcaparth89a@gmail.com",
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send email");
  }
});
// Pdf logic Here 
app.post("/send-invoice", async (req, res) => {
  try {
    const invoiceData = req.body;

    // 1. Generate the PDF from the invoice data
    const pdfBuffer = await generatePDFBuffer(invoiceData);

    // 2. Set up the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bcaparth89a@gmail.com",
        pass: "clmw zzjf volr wmma", // App password
      },
    });

    const mailOptions = {
      from: "bcaparth89a@gmail.com",
      to: invoiceData.email, // Customer email
      subject: "Your Invoice from NEW NOBEL FOOTWEAR – Ready for Review",
      text: invoiceData.text,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).send("Invoice email sent successfully");
  } catch (error) {
    console.error("Error sending invoice email:", error);
    res.status(500).send("Failed to send invoice email");
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
