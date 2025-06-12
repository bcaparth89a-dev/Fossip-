//  PDF.co:
import React,{ useState,useEffect,useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import negativeImage from "../assets/Negetive2.png";
import id from "../assets/id.png";
import"@fortawesome/react-fontawesome";
import LOGO2 from "../assets/LOGO2.jpg";
import back2 from "../assets/back2.jpg";
import gmail  from "../assets/gmail2.jpg";
import whatsapp from "../assets/whatsapp2.jpg";
import cloud from "../assets/cloud2.jpg";
import print from "../assets/print2.jpg"
import {db} from "./firebase.js"
import LOGO4 from "../assets/LOGO4.jpg";
import { ref, onValue } from 'firebase/database';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import {PDFDocument} from 'pdf-lib';

const Invoice2 = () => {
  const navigate=useNavigate();
  const [cachedCloudinaryUrl, setCachedCloudinaryUrl] = useState(null);
  const [logoBase64, setLogoBase64] = useState("");
  const [cachedPDF, setCachedPDF] = useState(null);
   // Fetch the value 
  const [invoice,setInvoice]=useState(null);
  useEffect(() => {
    const invoiceRef = ref(db, "invoices/invoice1");

    onValue(invoiceRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched data from Firebase : ",data);
      setInvoice(data);
    });
  }, []);
   // Current Time
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000); // update every second
    return () => clearInterval(timer); // cleanup on unmount
    }, []);
    const formattedTime = currentTime.toLocaleTimeString(); // example: 10:24:30 AM
    // Fetch the logo image as Base64
    useEffect(() => {
    const fetchImageAsBase64 = async () => {
      const response = await fetch(LOGO4);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setLogoBase64(reader.result);
      reader.readAsDataURL(blob);
    };
    fetchImageAsBase64();
  }, []);

  if (!invoice) {
    return <p className="text-center mt-10">Loading invoice data...</p>;
  } 
  // 🔁 Reusable PDF Generation Logic (returns Blob)
  const generatePDF = async () => {
  if (cachedPDF) return cachedPDF;
  if (!logoBase64) {
    alert("⚠️ Logo not yet loaded. Please wait.");
    return null;
  }

  const tableRows = invoice.productsDetails.map(product => `
    <tr>
      <td>${product.productCode}</td>
      <td>${product.name}</td>
      <td>${product.quantity}</td>
      <td>${product.perproductprice}</td>
      <td>${product.Price}</td>
    </tr>
  `).join("");

  const htmlContent = ` <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>Invoice</title>
              <style>
                @page {
                  size: A4;
                  margin: 20mm;
                }

                body {
                  font-family: Arial, sans-serif;
                  background-color: #e5e7eb;
                  margin: 0;
                  padding: 0;
                  font-size: 16px;
                }

                .container {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #f3f4f6;
                  border: 4px solid #9ca3af;
                  border-radius: 1rem;
                  padding: 30px;
                  box-sizing: border-box;
                }

                .logo-container {
                  text-align: center;
                  margin-top: 10px;
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
                  width: 80%;
                  margin: 15px auto; /* centers the table */
                  border-collapse: collapse;
                  font-size: 15px;
                }

                th, td {
                  border: 2px solid #6b7280;
                  padding: 8px;
                  text-align: center;
                }

                .terms {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  text-align: center;
                }

                .terms h3 {
                  text-align: center;
                }

                .terms ul {
                  list-style-type: disc;
                  list-style-position: inside; /* bullets and text aligned centrally */
                  padding-left: 0;
                  text-align: center;
                  margin: 0 auto;
                  max-width: 90%;
                  font-size: 14px;
                }

                .footer h2 {
                  font-size: 20px;
                  margin-top: 20px;
                }

                .footer p {
                  font-size: 16px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="logo-container">
                  <img src="${logoBase64}" alt="LOGO" class="logo" />
                </div>

                <div class="header">
                  <h1>NEW NOBLE FOOTWEAR</h1>
                  <p>G-6/7, Jethwani Super Market,<br>B/s Bus Stand DABHOI-391110<br>(P) 9173912755<br>GST ID : 24ADEPC4866F1ZT</p>
                  <p><strong>BILL OF SUPPLY</strong></p>
                </div>

                <div class="details">
                  <p>Bill No: ${invoice.invoiceNumber} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date: ${invoice.date}</p>
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

                <div class="terms">
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

   try {
    const response = await axios.post(
      "https://api.pdf.co/v1/pdf/convert/from/html",
      {
        html: htmlContent,
        name:  `${invoice.invoiceNumber}_${invoice.name}.pdf`,
        async: false
      },
      {
        headers: {
          "x-api-key": "nobledabhoi1980@gmail.com_lksu0cbX4nuntgD41qa6lVEZtXWj2RbFmfea5Hq4JbaBPmUIQlT0RunlWNECmOLg", // 🔁 Replace this with your actual key
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data || !response.data.url) {
      throw new Error("PDF.co response invalid");
    }

    // Fetch the actual PDF blob from the returned URL
    const pdfResponse = await fetch(response.data.url);
   const blob = await pdfResponse.blob();
   setCachedPDF(blob);
   return blob;
  } catch (error) {
    console.error("❌ PDF.co PDF generation failed:", error);
    alert("Failed to generate PDF.");
    return null;
  } 
};


  // 📥 Download Function
  const downloadPDF = async () => {
    const blob = await generatePDF();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invoice.invoiceNumber || "download"}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🖨️ Print Function
  const printPDF = async () => {
  const blob = await generatePDF();
  if (!blob) return;

  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, "_blank");

  if (!printWindow) {
    alert("⚠️ Popup blocked. Please allow popups for this site.");
    return;
  }

  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
  };
};

// WHATSAPP Logic
// ✅ WHATSAPP Logic
const uploadToCloudinary = async (pdfBlob) => {
  // ✅ If already uploaded, return cached URL
  if (cachedCloudinaryUrl) {
    console.log("♻️ Using cached Cloudinary URL");
    return cachedCloudinaryUrl;
  }

  const url = "https://api.cloudinary.com/v1_1/dfc3g6vb5/auto/upload";
  const uploadPreset = "invoices2";

  const formData = new FormData();
  formData.append("file", pdfBlob, `Invoice_${invoice.invoiceNumber}.pdf`);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "invoices");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (data.secure_url) {
      setCachedCloudinaryUrl(data.secure_url); // ✅ Save the link to state
      return data.secure_url;
    } else {
      throw new Error("Cloudinary upload failed");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    alert("Failed to upload PDF to Cloudinary.");
    return null;
  }
};

const handleWhatsAppClick = (pdfUrl) => {
  const phoneNumber = invoice.phonenumber; // Must be like 91XXXXXXXXXX
  const productDetailsString = invoice.productsDetails.map((product, index) => {
    return `
Product ${index + 1}*:
Name: ${product.name}
Qty: ${product.quantity}
Unit Price: ₹${product.perproductprice}
Total: ₹${product.Price}`;
  }).join("\n");

  const message = `
Dear ${invoice.name}, thank you for choosing Noble Footwear. We’re delighted to serve you! 👞🛍️

🧾 *Invoice No:* ${invoice.invoiceNumber}  
📅 *Date:* ${invoice.date}  
💰 *Amount:* ₹${invoice.total}

📄 *Download your invoice PDF:*  
${pdfUrl}

📞 Need help? Call us at *9173912755*

– *Noble Footwear*  
G-6/7, Jethwani Super Market,  
B/s Bus Stand, DABHOI – 391110
`;

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
};

const handleGenerateUploadAndSend = async () => {
  const pdfBlob = await generatePDF();
  if (!pdfBlob) return;

  const pdfUrl = await uploadToCloudinary(pdfBlob);
  if (!pdfUrl) return;

  handleWhatsAppClick(pdfUrl);
};

 // Email Logic  
  const sendEmail = async () => {
  if (!invoice) {
    console.log("⚠ Invoice not found.");
    return;
  }

  const pdfBlob = await generatePDF();
  if (!pdfBlob) return;

  const pdfUrl = await uploadToCloudinary(pdfBlob); // ✅ Now uses cached URL
  if (!pdfUrl) return;

  const productDetailsString = invoice.productsDetails.map((product, index) => {
    return `Product ${index + 1}:
    Code: ${product.productCode}
    Name: ${product.name}
    Quantity: ${product.quantity}
    Unit Price: ₹${product.perproductprice}
    Total Price: ₹${product.Price}\n\n`;
  }).join("");

  const emailData = {
    to_email: invoice.email,
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.date,
    name: invoice.name,
    phonenumber: invoice.phonenumber,
    totalprice: invoice.subtotal,
    discount: invoice.discount,
    amount: invoice.total,
    products: productDetailsString,
    pdfUrl: pdfUrl // ✅ Shared URL
  };

  emailjs
    .send(
      'service_oz8ynwd',
      'template_548uv7o',
      emailData,
      '5mu06LHrH4XGdPIAN'
    )
    .then((response) => {
      console.log('✅ Email sent!', response.status, response.text);
      alert("✅ Email sent successfully!");
    })
    .catch((err) => {
      console.error('❌ Email send error:', err);
      alert("❌ Email sending failed.");
    });
};


  return (  
  <div className="flex justify-center items-center min-h-screen bg-gray-200 font-sans px-2 sm:px-4 md:px-6 lg:px-8">
  <div className="mt-15 mb-10 h-auto w-full max-w-[650px] bg-white border-4 border-gray-200 rounded-1xl shadow-[0_6px_20px_rgba(0,0,0,0.15)]">
     {/* logo Part */}
  <div className="flex items-center w-full px-4 sm:px-6 md:px-8 lg:px-10 bg-white border-b border-gray-400 shadow-sm">
  {/* Left - Back button */}
  <div className="flex-shrink-0">
    <button
      onClick={() => navigate(-1)}
      className="bg-gray-50 hover:bg-gray-200 border border-gray-400 rounded my-3 w-9 h-7 sm:w-10 sm:h-8 flex items-center justify-center px-2 shadow"
    >
      <img src={back2} className="h-5 w-5 sm:h-7 sm:w-7" alt="Back" />
    </button>
  </div>

  {/* Center - Invoice text */}
  <div className="flex-grow text-center">
    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-wide">
      Invoice
    </p>
  </div>

  {/* Right - Buttons */}
  <div className="flex space-x-2 sm:space-x-4 flex-shrink-0">
    <button
      onClick={sendEmail}
      className="bg-gray-50 hover:bg-gray-200 border border-gray-400 rounded my-3 w-9 h-7 sm:w-10 sm:h-8 flex items-center justify-center px-2 shadow"
    >
      <img src={gmail} className="h-5 w-5 sm:h-7 sm:w-7" alt="Email" />
    </button>
    <button
      onClick={printPDF}
      className="bg-gray-50 hover:bg-gray-200 border border-gray-400 rounded my-3 w-9 h-7 sm:w-10 sm:h-8 flex items-center justify-center px-2 shadow"
    >
      <img src={print} className="h-5 w-5 sm:h-7 sm:w-7" alt="Print" />
    </button>
    <button
      onClick={downloadPDF}
      className="bg-gray-50 hover:bg-gray-200 border border-gray-400 rounded my-3 w-9 h-7 sm:w-10 sm:h-8 flex items-center justify-center px-2 shadow"
    >
      <img src={cloud} className="h-5 w-5 sm:h-7 sm:w-7" alt="Download" />
    </button>
    <button
      onClick={handleGenerateUploadAndSend} className="bg-gray-50 hover:bg-gray-200 border border-gray-400 rounded my-3 w-9 h-7 sm:w-10 sm:h-8 flex items-center justify-center px-2 shadow"
    >
      <img src={whatsapp} className="h-5 w-5 sm:h-7 sm:w-7" alt="WhatsApp" />
    </button>
  </div>
</div>

    {/* logo part ends here */}
    {/* invoice part starts here */}
    <div className="px-2 sm:px-4 md:px-6 lg:px-8">
  {/* part 1 starts here */}
  <div>
   <div className="flex justify-center">
  <img src={LOGO2} alt="LOGO"className="h-[130px] sm:h-[150px] md:h-[170px] w-[210px] sm:w-[210px] md:w-[240px] mt-7 rounded-2xl border border-gray-300 shadow-lg "/>
  </div>

    <div className="flex flex-col justify-center items-center mt-6 sm:mt-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl text-center font-semibold">
        SHREE NOBLE FOOTWEAR
      </h1>
      <p className="text-xs sm:text-sm md:text-base text-center leading-relaxed mt-2 whitespace-pre-line max-w-xs sm:max-w-md md:max-w-lg">
        {/* Use \n inside string for line breaks, or better JSX elements */}
        G-6/7, Jethwani Super Market,
        <br />
        B/s Bus Stand DABHOI-391110
        <br />
        (P) 9173912755
        <br />
        GST ID : 24ADEPC4866F1ZT
      </p>
      <p className="text-lg sm:text-xl md:text-2xl mt-4 font-semibold">BILL OF SUPPLY</p>
    </div>
  </div>
  {/* part 1 Ends Here */}

  {/* part 2 starts Here */}
  <div className="mt-4">
    <div className="flex justify-center items-center space-x-8 text-sm sm:text-base md:text-lg font-normal text-black text-center">
      <p>Bill No: {invoice.invoiceNumber}</p>
      <p>Date: {invoice.date}</p>
      <p>Time: {formattedTime}</p>
    </div>
    <div className="mt-5 space-y-4 text-sm sm:text-base md:text-lg max-w-md mx-auto text-black text-center">
  <p>
    Customer Name:
   <span className="ml-3">{invoice.name}</span>
  </p>
  <p>
    Email ID:
    <span className="ml-3">{invoice.email}</span>
  </p>
  <p>
    Phone No:
    <span className="ml-3">{invoice.phonenumber}</span>
  </p>
</div>

   <div className="flex justify-center px-2 sm:px-4 md:px-6 mt-4 overflow-hidden">
  <div className="w-full max-w-6xl overflow-x-auto scrollbar-hide">
    <table className="w-full border border-gray-400 border-collapse text-center text-xs sm:text-sm">
      <thead>
        <tr className="bg-gray-200">
          <th className="border border-gray-400 px-2 py-[8px] sm:py-[4px]">Product Code</th>
          <th className="border border-gray-400 px-2 py-[8px] sm:py-[4px]">Description</th>
          <th className="border border-gray-400 px-2 py-[8px] sm:py-[4px]">QTY</th>
          <th className="border border-gray-400 px-2 py-[8px] sm:py-[4px]">MRP</th>
          <th className="border border-gray-400 px-2 py-[8px] sm:py-[4px]">AMT</th>
        </tr>
      </thead>
      <tbody>
        {invoice.productsDetails.map((product, index) => (
          <tr key={index}>
            <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">{product.productCode}</td>
            <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">{product.name}</td>
            <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">{product.quantity}</td>
            <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">{product.perproductprice}</td>
            <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">{product.Price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

 </div>
  {/* part 2 Ends Here */}

  {/* part 3 starts Here */}
  <div className="mt-4 space-y-2 max-w-md mx-auto">
  <div className="flex justify-center items-center space-x-6">
    <u>
      <p className="text-base sm:text-lg md:text-xl">PAYMENT SUMMARY</p>
    </u>
  </div>

  <div className="flex justify-center items-center space-x-6 text-sm sm:text-base md:text-lg">
    <p>Gross Amount</p>
    <div>{invoice.subtotal}</div>
  </div>

  <p className="text-xs sm:text-sm md:text-base text-center">
    You Save Rs : {invoice.discount}
  </p>

  <div className="flex justify-center items-center space-x-6 text-sm sm:text-base md:text-lg">
    <p>Net Amount</p>
    <div>{invoice.total}</div>
  </div>
</div>
  {/* part 3 Ends Here */}

  {/* part 4 starts Here */}
  <div className="px-2 sm:px-6 md:px-10 lg:px-16 mt-8">
    <div className="flex justify-center items-center space-x-2 sm:space-x-8">
      <u>
        <p className="text-lg sm:text-base md:text-lg font-semibold">TERMS & CONDITION</p>
      </u>
    </div>
    <div className="flex justify-center items-center">
      <ul className="mt-2 list-disc list-inside max-w-xs sm:max-w-md md:max-w-lg space-y-1 text-xs sm:text-sm md:text-base text-center">
        <li>Goods once sold will not be taken back.</li>
        <li>No exchange without original invoice & barcode.</li>
        <li>No guarantee. No refund.</li>
        <li>If any item is on sale, there is no guarantee and it is not refundable or exchangeable.</li>
        <li>We are in the composition scheme, so all taxes are included.</li>
        <li>Any item will not be taken back after 7 days.</li>
        <li>Subject to Dabhoi jurisdiction.</li>
      </ul>
    </div>
    <div className="mt-6">
      <h1 className="text-base sm:text-lg md:text-xl text-center font-semibold">
        WE DON'T HAVE ANY OTHER <br className="hidden sm:block" /> FRANCHISE
      </h1>
    </div>
    <div className="mb-6">
      <p className="text-xs sm:text-sm md:text-base text-center">THANK YOU SO MUCH FOR SHOPPING VISIT AGAIN</p>
    </div>
  </div>
  {/* Part 4 Ends Here */}
</div>
    {/* Part 5 Starts Here */}
  </div>
  {/* Invoice 2 Ends Here */}
</div> 
  );
};
export default Invoice2;



