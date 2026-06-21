import { useState, useEffect, useRef } from "react";
import LOGO2 from "../assets/LOGO2.jpg";
import back2 from "../assets/back2.jpg";
import gmail from "../assets/gmail2.jpg";
import whatsapp from "../assets/whatsapp2.jpg";
import cloud from "../assets/cloud2.jpg";
import print from "../assets/print2.jpg";
import { db } from "./firebase.js";
import { ref, onValue } from "firebase/database";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import emailjs from "@emailjs/browser";
import { useNavigate, useLocation } from "react-router-dom";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "deidtqghq";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "invoice_upload";

const Invoice2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cachedPDF, setCachedPDF] = useState(null);
  const invoiceRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoice, setInvoice] = useState(() => {
    const stored = window.localStorage.getItem("latestInvoice");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (location.state?.invoiceData) {
      setInvoice(location.state.invoiceData);
      window.localStorage.setItem(
        "latestInvoice",
        JSON.stringify(location.state.invoiceData),
      );
    }
  }, [location.state]);

  useEffect(() => {
    if (invoice) return;

    const invoiceDbRef = ref(db, "invoices/invoice1");
    const unsubscribe = onValue(invoiceDbRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched data from Firebase : ", data);
      if (data) {
        setInvoice(data);
        window.localStorage.setItem("latestInvoice", JSON.stringify(data));
      }
    }, (error) => {
      console.error("Firebase dynamic sync error:", error);
    });
    
    return () => unsubscribe();
  }, [invoice]);

  // Current Time
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second
    return () => clearInterval(timer); // cleanup on unmount
  }, []);

  const formattedTime = currentTime.toLocaleTimeString(); // example: 10:24:30 AM

  // 🔁 Reusable PDF Generation Logic (returns Blob)
  const generatePDF = async () => {
    if (cachedPDF) return cachedPDF;
    const element = invoiceRef.current;
    if (!element) {
      alert("Invoice content is not ready for PDF generation.");
      return null;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        foreignObjectRendering: false,
      });
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(imageData, "PNG", 0, 0, pageWidth, pageHeight);
      const blob = pdf.output("blob");
      setCachedPDF(blob);
      return blob;
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
      return null;
    }
  };

  // 📥 Download Function
  const downloadPDF = async () => {
    try {
      const blob = await generatePDF();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${invoice?.invoiceNumber || "download"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  // 🖨️ Print Function
  const printPDF = async () => {
    try {
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
    } catch (error) {
      console.error("Print failed:", error);
      alert("Failed to print PDF. Please try again.");
    }
  };

  // ☁️ Cloudinary Upload Logic (returns secureUrl)
  const uploadInvoiceToCloudinary = async () => {
    const element = invoiceRef.current;
    if (!element) {
      throw new Error("Invoice content is not ready for image capture.");
    }

    // Capture the invoice component using html2canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      foreignObjectRendering: false,
    });

    // Convert canvas to Blob
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("Failed to convert canvas to blob"));
      }, "image/png");
    });

    const formData = new FormData();
    formData.append("file", blob, "invoice.png");
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cloudinary upload failed: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    if (!data.secure_url) {
      throw new Error("Upload succeeded but secure_url was not returned by Cloudinary.");
    }

    return data.secure_url;
  };

  // 📱 WhatsApp Click Handler
  const handleWhatsAppClick = async () => {
    if (!invoice) return;

    setIsProcessing(true);
    try {
      let phoneNumber = invoice.phonenumber ? invoice.phonenumber.toString().replace(/\D/g, "") : "";

      if (!phoneNumber) {
        alert("Customer phone number is missing.");
        setIsProcessing(false);
        return;
      }

      if (phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber;
      } else if (phoneNumber.length < 10) {
        alert("Invalid phone number. It must be at least 10 digits.");
        setIsProcessing(false);
        return;
      }

      // Upload invoice image to Cloudinary
      const imageUrl = await uploadInvoiceToCloudinary();

      const message = `Dear ${invoice.name || "Customer"},

Thank you for choosing Noble Footwear.

Invoice Number: ${invoice.invoiceNumber || ""}

Date: ${invoice.date || ""}

Amount: ₹${invoice.total || ""}

View your Invoice:
${imageUrl}

Thank you for shopping with us.`;

      window.open(
        `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    } catch (error) {
      console.error("WhatsApp share failed:", error);
      alert(`Failed to share invoice on WhatsApp. Error: ${error.message || error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 📧 EmailJS Click Handler
  const sendEmail = async () => {
    if (!invoice || !invoice.email) {
      alert("Customer email address is not available.");
      return;
    }

    if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
      alert(
        "Email service is not configured. Please check your environment variables.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Upload invoice image to Cloudinary
      const imageUrl = await uploadInvoiceToCloudinary();

      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          customer_name: invoice.name,
          customer_email: invoice.email,
          phone: invoice.phonenumber,
          invoice_number: invoice.invoiceNumber,
          invoice_date: invoice.date,
          subtotal: invoice.subtotal,
          discount: invoice.discount,
          total: invoice.total,
          invoice_image: imageUrl,
        },
        PUBLIC_KEY,
      );
      alert("Email sent successfully!");
    } catch (error) {
      console.error("Email send failed:", error);
      alert(`Failed to send email. Please try again. Error: ${error.message || error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!invoice) {
    return <p className="text-center mt-10">Loading invoice data...</p>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 font-sans px-2 sm:px-4 md:px-6 py-6">
      <div className="mt-6 mb-6 h-auto w-full max-w-[650px] bg-white border border-slate-200/80 rounded-2xl shadow-xl relative overflow-hidden">
        
        {/* Glassmorphic Processing Indicator Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col justify-center items-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4 shadow-sm"></div>
            <p className="text-slate-805 font-bold text-sm">Processing invoice and uploading image...</p>
          </div>
        )}

        {/* Modern Sticky Control Header */}
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 bg-white border-b border-slate-150 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-white/95">
          {/* Left - Back button */}
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 border border-slate-200 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer"
              title="Go Back"
            >
              <img src={back2} className="h-4 w-4 sm:h-5 sm:w-5" alt="Back" />
            </button>
          </div>

          {/* Center - Invoice Title */}
          <div>
            <p className="text-sm sm:text-base font-bold text-slate-800 tracking-wide uppercase">
              Invoice Preview
            </p>
          </div>

          {/* Right - Control Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={sendEmail}
              disabled={isProcessing}
              className={`p-2 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer hover:bg-indigo-100/85 hover:border-indigo-200 ${isProcessing ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Send Invoice Email"
            >
              <img src={gmail} className="h-4 w-4 sm:h-5 sm:w-5" alt="Email" />
            </button>
            <button
              onClick={printPDF}
              disabled={isProcessing}
              className={`p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer hover:bg-slate-100 ${isProcessing ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Print Invoice"
            >
              <img src={print} className="h-4 w-4 sm:h-5 sm:w-5" alt="Print" />
            </button>
            <button
              onClick={downloadPDF}
              disabled={isProcessing}
              className={`p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer hover:bg-slate-100 ${isProcessing ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Download PDF"
            >
              <img
                src={cloud}
                className="h-4 w-4 sm:h-5 sm:w-5"
                alt="Download"
              />
            </button>
            <button
              onClick={handleWhatsAppClick}
              disabled={isProcessing}
              className={`p-2 bg-emerald-50 border border-emerald-105 rounded-xl flex items-center justify-center transition shadow-sm cursor-pointer hover:bg-emerald-100 hover:border-emerald-250 ${isProcessing ? "opacity-40 cursor-not-allowed" : ""}`}
              title="Share on WhatsApp"
            >
              <img
                src={whatsapp}
                className="h-4 w-4 sm:h-5 sm:w-5"
                alt="WhatsApp"
              />
            </button>
          </div>
        </div>

        {/* invoice part starts here */}
        <div
          ref={invoiceRef}
          className="pdf-mode px-4 sm:px-6 md:px-8 py-6"
          style={{
            background: "#ffffff",
            color: "#000000",
          }}
        >
          {/* part 1 starts here */}
          <div>
            <div className="flex justify-center">
              <img
                src={LOGO2}
                alt="LOGO"
                className="h-[130px] sm:h-[150px] md:h-[170px] w-[210px] sm:w-[210px] md:w-[240px] mt-2 rounded-2xl border border-gray-300 shadow-lg"
              />
            </div>

            <div className="flex flex-col justify-center items-center mt-6 sm:mt-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl text-center font-semibold">
                SHREE NOBLE FOOTWEAR
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-center leading-relaxed mt-2 whitespace-pre-line max-w-xs sm:max-w-md md:max-w-lg">
                G-6/7, Jethwani Super Market,<br />
                B/s Bus Stand DABHOI-391110<br />
                (P) 9173912755<br />
                GST ID : 24ADEPC4866F1ZT
              </p>
              <p className="text-lg sm:text-xl md:text-2xl mt-4 font-semibold border-b-2 border-black pb-1">
                BILL OF SUPPLY
              </p>
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
                <span className="ml-3 font-semibold">{invoice.name}</span>
              </p>
              <p>
                Email ID:
                <span className="ml-3 font-semibold">{invoice.email}</span>
              </p>
              <p>
                Phone No:
                <span className="ml-3 font-semibold">{invoice.phonenumber}</span>
              </p>
            </div>

            <div className="flex justify-center px-2 sm:px-4 md:px-6 mt-6 overflow-hidden">
              <div className="w-full max-w-6xl overflow-x-auto scrollbar-hide">
                <table className="w-full border border-gray-450 border-collapse text-center text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-450 px-2 py-[8px] sm:py-[4px] font-semibold">
                        Product Code
                      </th>
                      <th className="border border-gray-450 px-2 py-[8px] sm:py-[4px] font-semibold">
                        Description
                      </th>
                      <th className="border border-gray-450 px-2 py-[8px] sm:py-[4px] font-semibold">
                        QTY
                      </th>
                      <th className="border border-gray-450 px-2 py-[8px] sm:py-[4px] font-semibold">
                        MRP
                      </th>
                      <th className="border border-gray-450 px-2 py-[8px] sm:py-[4px] font-semibold">
                        AMT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(invoice.productsDetails || []).map((product, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">
                          {product.productCode}
                        </td>
                        <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">
                          {product.name}
                        </td>
                        <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">
                          {product.quantity}
                        </td>
                        <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px]">
                          {product.perproductprice}
                        </td>
                        <td className="border border-gray-300 px-2 py-[8px] sm:py-[4px] font-medium">
                          {product.Price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* part 2 Ends Here */}

          {/* part 3 starts Here */}
          <div className="mt-6 space-y-2 max-w-md mx-auto">
            <div className="flex justify-center items-center space-x-6">
              <u>
                <p className="text-base sm:text-lg md:text-xl font-bold">
                  PAYMENT SUMMARY
                </p>
              </u>
            </div>

            <div className="flex justify-center items-center space-x-6 text-sm sm:text-base md:text-lg">
              <p>Gross Amount</p>
              <div>{invoice.subtotal}</div>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-center font-medium text-emerald-600">
              You Save Rs : {invoice.discount}
            </p>

            <div className="flex justify-center items-center space-x-6 text-sm sm:text-base md:text-lg font-bold">
              <p>Net Amount</p>
              <div>{invoice.total}</div>
            </div>
          </div>
          {/* part 3 Ends Here */}

          {/* part 4 starts Here */}
          <div className="px-2 sm:px-6 md:px-10 lg:px-16 mt-8">
            <div className="flex justify-center items-center space-x-2 sm:space-x-8">
              <u>
                <p className="text-lg sm:text-base md:text-lg font-semibold">
                  TERMS & CONDITION
                </p>
              </u>
            </div>
            <div className="flex justify-center items-center">
              <ul className="mt-2 list-disc list-inside max-w-xs sm:max-w-md md:max-w-lg space-y-1 text-xs sm:text-sm md:text-base text-left">
                <li>Goods once sold will not be taken back.</li>
                <li>No exchange without original invoice & barcode.</li>
                <li>No guarantee. No refund.</li>
                <li>
                  If any item is on sale, there is no guarantee and it is not
                  refundable or exchangeable.
                </li>
                <li>
                  We are in the composition scheme, so all taxes are included.
                </li>
                <li>Any item will not be taken back after 7 days.</li>
                <li>Subject to Dabhoi jurisdiction.</li>
              </ul>
            </div>
            <div className="mt-6">
              <h1 className="text-base sm:text-lg md:text-xl text-center font-semibold">
                WE DON'T HAVE ANY OTHER <br className="hidden sm:block" /> FRANCHISE
              </h1>
            </div>
            <div className="mb-6 mt-4">
              <p className="text-xs sm:text-sm md:text-base text-center font-semibold text-gray-750">
                THANK YOU SO MUCH FOR SHOPPING. VISIT AGAIN!
              </p>
            </div>
          </div>
          {/* Part 4 Ends Here */}
        </div>
      </div>
    </div>
  );
};

export default Invoice2;
