import React,{ useState,useEffect,useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import negativeImage from "../assets/Negetive2.png";
import id from "../assets/id.png";
import"@fortawesome/react-fontawesome";
import LOGO2 from "../assets/LOGO2.jpg";
import {db} from "./firebase.js"
import { ref, onValue } from 'firebase/database';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
const Invoice2 = () => {
    // Handle Download
    const handleDownload = async () => {
  try {
    const response = await axios.post('http://localhost:5000/pdf/generate', invoice, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${invoice.invoiceNumber}.pdf`; // fixed this too
    link.click();

    // Show success popup
    alert('PDF downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download PDF.');
  }
};
  
//  Print function
const printRef = useRef();
const handlePrint = () => {
  const printContents = printRef.current.innerHTML;
  const newWindow = window.open("", "_blank", "width=800,height=600");

  newWindow.document.write(`
    <html>
      <head>
        <title>Print Preview</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: black; }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        ${printContents}
      </body>
    </html>
  `);

  newWindow.document.close();
};

   // Current Time
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000); // update every second
    return () => clearInterval(timer); // cleanup on unmount
    }, []);
    const formattedTime = currentTime.toLocaleTimeString(); // example: 10:24:30 AM

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

  if (!invoice) {
    return <p className="text-center mt-10">Loading invoice data...</p>;
  } 
  // Email Logic
  // Genrate Email Body
  const generateEmailBody = () => {
  const productDetails = invoice.productsDetails.map((product, index) => `
      ${index + 1}. Product Name: ${product.name}
         Code: ${product.productCode}
         Quantity: ${product.quantity}
         Unit Price: ₹${product.perproductprice}
         Total: ₹${product.Price}
    `
  ).join('\n');

  return `
    📄 Invoice Summary

    🧾 Invoice Number: ${invoice.invoiceNumber}
    📅 Date: ${invoice.date}

    👤 Customer Details:
    - Name: ${invoice.name}
    - Email: ${invoice.email}
    - Phone Number: +91-${invoice.phonenumber}

    📦 Product Details:
    ${productDetails}

    🧮 Subtotal: ₹${invoice.subtotal}
    🎁 Discount: ₹${invoice.discount || 0}
    💰 Total: ₹${invoice.subtotal - (invoice.discount || 0)}

    Thank you for shopping with us!
  `;
};
//  Sending Email
const sendEmail = async () => {
  try {
    const emailData = {
      ...invoice,
      text: generateEmailBody()  // ✅ Add the message body
    };
    const response = await axios.post("http://localhost:5000/send-invoice",emailData);
    console.log("Response:", response.data);
    alert("Invoice email with PDF sent!");
  } catch (error) {
    console.error("Error sending invoice:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Status code:", error.response.status);
    }
    alert("Failed to send invoice email.");
  }
};
  
  return (  
    // Invoice 2 starts from here
    <div  className="flex justify-center items-center min-h-screen bg-gray-200">
      <div  className="mt-15 mb-15 h-auto w-[550px] bg-gray-100 border-4 border-gray-400 rounded-2xl">
       <div ref={printRef}>
      {/* part 1 starts from here */}
        <div >
          <div className="flex justify-center">
            <img src={LOGO2} alt="LOGO" className="h-[150px] w-[200px] border-gray-300 rounded-2xl mt-[30px]" />
          </div>
          <div className="flex justify-center mt-[13px] flex-col items-center">
            <h1 className="text-[21px] text-center">
          NEW NOBEL FOOTWEAR
            </h1>
            <p className="text-[16px] text-center">G-6/7,Jethwani Super Market,<br/>B/s Bus Stand DABHOI-391110<br/>(P) 9173912755 <br/> GST ID : 24ADEPC4866F1ZT<br/></p>
            <p className="text-[16px] mt-[10px]">BILL OF SUPPLY</p>
          </div>
        </div>
        {/* part 1 Ends Here */}
        {/* /* /* part 2 starts Here */ } 
        <div>
          <div className="ml-3 flex justify-center items-center ">
            <p className="ml-3 text-[18px]">Bill No: {invoice.invoiceNumber}</p>
            <p className="ml-3 text-[18px]">Date:  {invoice.date}</p>
            <p className="ml-3 text-[18px]">Time: {formattedTime}</p>
          </div>
          <div>
            <p className="text-[18px] text-center flex justify-center items-center space-x-8">Customer    :<div className="ml-[10px]">{invoice.name}</div> </p>
            <p className="text-[18px] text-center flex justify-center items-center space-x-8">Email ID    :<div className="ml-[10px]">{invoice.email}</div> </p>
            <p className="text-[18px] text-center flex justify-center items-center space-x-8">Phone No    :<div className="ml-[10px]">{invoice.phonenumber}</div> </p>
          </div>
          <div className="text-[18px] h-auto ml-30">
            <table className="h-auto w-[350px] border-2 border-gray-500 border-collapse">
              <thead>
                <tr className="border-2 border-gray-500">
                  <th className="border-2 border-gray-500">Product Code</th>
                  <th className="border-2 border-gray-500">Description</th>
                  <th className="border-2 border-gray-500">QTY</th>
                  <th className="border-2 border-gray-500">MRP</th>
                  <th className="border-2 border-gray-500">AMT</th>
                </tr>
                {invoice.productsDetails.map((product, index) => (
                <tr className="text-center border-2 border-gray-500">
                  <td className="border-2 border-gray-500"><div>{product.productCode}</div></td>
                  <td className="border-2 border-gray-500"><div>{product.name}</div></td>
                  <td className="border-2 border-gray-500"><div>{product.quantity}</div></td>
                  <td className="border-2 border-gray-500"><div>{product.perproductprice}</div></td>
                  <td className="border-2 border-gray-500"><div>{product.Price}</div></td>
                </tr>
                ))}
              </thead>
            </table>
          </div>
        </div>
        {/* /* part 2 Ends Here */} 
      {/* part 3 starts Here */}
      <div>
          <div className="flex justify-center items-center space-x-8">
            <u><p className="text-[20px]">PAYMENT SUMMARY</p></u>
          </div>
          <div className="flex justify-center items-center space-x-8">
             <p className="text-[18px]">Gross Amount</p> 
             <div className="ml-17 text-[18px]">{invoice.subtotal}</div>
          </div>
          <p className="text-[16px] text-center">You Save Rs :  {invoice.discount}</p>
          <div className="flex justify-center items-center space-x-8">
             <p className="text-[18px]">Net Amount</p> 
             <div className="ml-17 text-[18px]">{invoice.total}</div>
          </div>
      </div>
      {/* part 3 Ends Here */}
      {/* part 4 starts Here */}
      <div className="px-2 sm:px-6 md:px-10 lg:px-16">
        <div className="flex justify-center items-center space-x-2 sm:space-x-8 mt-4">
          <u><p className="text-[15px] sm:text-[17px]">TERMS & CONDITION </p></u>
        </div>
        <div className="flex justify-center items-center">
          <ul className="mt-2 list-disc list-inside max-w-xs sm:max-w-md md:max-w-lg">
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">Goods once sold will not be taken back.</li>
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">No exchange without original invoice & barcode.</li>
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">No guarantee. No refund.</li>
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">If any item is on sale, there is no guarantee and it is not refundable or exchangeable.</li>
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">We are in the composition scheme, so all taxes are included.</li>
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">Any item will not be taken back after 7 days.</li>
            <li className="text-[13px] sm:text-[15px] md:text-[16px] text-center">Subject to Dabhoi jurisdiction.</li>
          </ul>
        </div>
        <div>
          <h1 className="text-[16px] sm:text-[20px] md:text-[23px] text-center mt-2">
            WE DON'T HAVE ANY OTHER <br className="hidden sm:block" /> FRANCHISE
          </h1>
        </div>
        <div>
          <p className="text-[14px] sm:text-[16px] md:text-[17px] text-center mt-2">THANK YOU SO MUCH FOR SHOPPING VISIT AGAIN</p>
        </div>
      </div>
      </div>
       {/* Part 4 Ends Here */}
       {/* Part 5 Starts Here  */}
       <div className="flex justify-around my-5">
      <button onClick={handleDownload} className="my-5 w-30 h-8 border-black bg-gray-300 rounded ml-10 hover:bg-amber-100">Download</button>
      <button onClick={handlePrint} className="my-5 w-30 h-8 border-black bg-gray-300 rounded ml-10  hover:bg-amber-100">Print</button>
      <button onClick={sendEmail} className="my-5 w-30 h-8 border-black bg-gray-300 rounded ml-10  hover:bg-amber-100">Email</button>
       </div>
      </div>
    {/* Invoice 2 Ends Here  */}
  </div>
  );
};
export default Invoice2;


