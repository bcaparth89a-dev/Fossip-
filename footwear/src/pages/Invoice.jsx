import { useState, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import negativeImage from "../assets/Negetive2.png";
import id from "../assets/id.png";
import "@fortawesome/react-fontawesome";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Toggle from "./Toggle.jsx";
import { useEffect } from "react";
import Barcode from "react-barcode";
import {db} from './firebase.js';
import { ref, set } from 'firebase/database';
import { useNavigate } from "react-router-dom";
import axios from "axios";import { collection, addDoc } from "firebase/firestore";
import { dbFirestore } from "./firebase.js"; // Make sure your firestore db is exported as `dbFirestore`
import { doc, setDoc } from "firebase/firestore";
import validator from "validator";
import Invoice2 from "./Invoice2.jsx";

const Invoice = () => {
  const [display, setdisplay] = useState(false);
  const discountRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate here

  // accessing value
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [phonenumber,setPhoneNumber]=useState("");
  const [date, setDate] = useState("");
  const [productCode, setProductCode] = useState(""); // what user types
  const [products, setProducts] = useState([]);
  
  // counter button
  const [count, setCount] = useState(1);
  const increase = () => setCount(count + 1);
  const decrease = () => {
    if (count > 1) setCount(count - 1);
  };
  
  // products found
  //  sample barcode
  const sampleProducts = {
    "123ABC": {
      id: 1,
      name: "puma's Brand new shoes",
      qty: 2,
      unitPrice: 200,
      code : "123ABC",
    },
    942933: {
      id: 1,
      name: "Semis Brown Printed Sneaker",
      qty: 2,
      unitPrice: 3000,
      code : "942933",
    },
    903358: {
      id: 1,
      name: "unisex Brown Printed Sneaker",
      qty: 1,
      unitPrice: 2000,
      code : "903358",
    },
    635522: {
      id: 1,
      name: "Man's Brown Printed Sneaker",
      qty: 1,
      unitPrice: 1000,
      code : "635522",
    },
    799010: {
      id: 1,
      name: "WoMan's Brown Printed Sneaker",
      qty:1,
      unitPrice: 2000,
      code : "799010",
    },
  };
  
  // search logic
  const handleSearch = () => {
    const found = sampleProducts[productCode]; // Look up the barcode
    if (found) {
      setProducts((prev) => [...prev, { ...found, id: Date.now(), qty: 1 }]);
      // Add to list
      setProductCode(""); // Clear input box
    } else {
      alert("Product not found!");
    }
  };
  // Quantity logic
  const increaseQty = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, qty: product.qty + 1 } : product
      )
    );
  };

  const decreaseQty = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id && product.qty > 1
          ? { ...product, qty: product.qty - 1 }
          : product
      )
    );
  };

  //  thrash button logic
  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  // subtotal logic
  const subtotal = products.reduce(
    (acc, item) => acc + item.unitPrice * item.qty,
    0
  );
  // Discount
  const [discount, setDiscount] = useState("");
   
  // clear form-set all the information at that default value
  const handleClear = () => {
    setName("");
    setEmail("");
    setPhoneNumber("");
    setDiscount("");
    setProducts([]); // Clears product list
  };

  // Invoice Number Logic
  function generateRandomString(length = 5) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
    for (let i = 0; i < length; i++) {
      const randomChar = characters.charAt(Math.floor(Math.random() * characters.length));
      result += randomChar;
    }
  return result;
  }
 
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
  const invoicePrefix = "NOBLE-";
  const uniqueId = generateRandomString(5);
  return invoicePrefix + uniqueId;
  });
 
  // firebase
  const handleSave = async () => {
  const invoiceData = {
    invoiceNumber: invoiceNumber,
    name: name,
    email: email,
    date: date,
    phonenumber: phonenumber,
    productsDetails: products.map((product) => ({
      productCode: product.code,
      name: product.name,
      perproductprice: product.unitPrice,
      quantity: product.qty,
      Price: product.unitPrice * product.qty,
    })),
    subtotal: subtotal,
    discount: discount,
    total: subtotal - discount,
  };

   // Construct a unique ID 
  const invoiceId = `${invoiceNumber}_${name.replace(/\s+/g, "")}`;

  try {
    // ✅ Save to Realtime Database
    await set(ref(db, 'invoices/invoice1'), invoiceData);

    // ✅ Save to Firestore for permanent record
    await setDoc(doc(dbFirestore, "invoices", invoiceId), invoiceData);

    alert("Invoice saved to Firebase Realtime DB and Firestore!");
    navigate("/invoice2");
  } catch (error) {
    console.error("Error saving invoice:", error);
    alert("Error saving invoice: " + error.message);
  }
};	

// EMail validation Logic 
const [errorMessage1, setErrorMessage1] = useState("Email is required."); // Default error message

const handleEmail = (event) => {
  let value = event.target.value.trim(); // Remove leading/trailing spaces
  setEmail(value);

  // Validate email format dynamically
  if (value.length === 0) {
    setErrorMessage1("Email is required.");
  } else if (validator.isEmail(value)) {
    setErrorMessage1(""); // Clear error when valid
  } else {
    setErrorMessage1("Enter a valid email address.");
  }
};


  
// Phonne number logic -----
 const [errorMessage, setErrorMessage] = useState("Phone number is must required."); // Default error message
 const handlePhone = (event) => {
  let value = event.target.value.replace(/\D/g, ""); // Remove non-digit characters

  // Check if input is empty first
  if (value.length === 0) {
    setErrorMessage("Phone number is must required."); // Show error when empty
    setPhoneNumber(""); // Ensures empty state
    return;
  }
  // Restrict input strictly to 10 digits
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  // Allow user to modify input while typing
  setPhoneNumber(value);
  // Validate dynamically
  if (value.length === 10) {
    if (/^[6-9]\d{9}$/.test(value)) {
      setErrorMessage(""); // Clear error when valid
    } else {
      setErrorMessage("Phone number must start with 6-9 and be exactly 10 digits.");
    }
  } else {
    setErrorMessage("Phone number must be exactly 10 digits long.");
  }
};
  // Date logic
  // Set current date as default when component mounts
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  return (
    <div>
      {/* Navigation part starts from here */}
    <div className="h-15 w-full border-b border-gray-200 bg-white flex items-center justify-between px-4 py-2">
    {/* Logo */}
     <div className="flex items-center">
    <img
      src={negativeImage}
      alt="Logo"
      className="w-20 h-auto object-contain"
    />
  </div>
  {/* Right side: Search bar + Profile */}
  <div className="flex items-center gap-4">
    {/* Search Bar */}
    <div className="ml-6 flex items-center border border-gray-300 rounded-md px-2 h-8 bg-gray-50 hover:border-gray-700">
      <svg
        className="w-4 h-4 text-gray-500 mr-1"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M12.9 14.32a8 8 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414l-4.243-4.243zM8 14a6 6 0 100-12 6 6 0 000 12z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="text"
        className=" text-sm w-43 bg-transparent focus:outline-none placeholder:text-gray-500"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        placeholder="Scan barcode or type code"
      />
    </div>

    {/* Profile */}
    <div className="flex items-center gap-1">
      <button onClick={() => setdisplay(!display)}>
        <img
          src={id}
          alt="User"
          className="w-8 h-8 border border-gray-400 rounded-3"
        />
      </button>
      <button
        onClick={() => setdisplay(!display)}
        className="text-sm text-gray-700 hover:text-black"
      >
        Biller, Raju Bhai
      </button>
    </div>
  </div>
  {/* Toggle Menu */}
  {display && (
    <div className="absolute top-14 right-4 w-72 bg-white shadow-md rounded z-50">
      <Toggle />
    </div>
  )}
</div>
      {/* End of Nav Bar */}
      {/* Invoice part starts from here */}
      <div className="p-2 sm:p-6 md:p-4 bg-gray-200 min-h-screen">
       <div className="ml-8 w-400S h-180 sd:h-150  md:h-180 ld:h-200 flex items-center justify-center space-x-4">
        {/* First Container */}
          <div className="flex flex-col h-[97%] w-[75%] sm:h-[115%] md:h-[107%] lg:h-[97%] sm:w-[90%] md:w-[85%] lg:w-[75%] bg-white mt-3 mx-auto mb-3 border-gray-300 border-[3px] shadow-md rounded hover:border-gray-200 ">
            {/* Part 1: Header */}
            <div className="flex-grow px-4 flex items-center justify-between mt-3">
              <p className="font-bold text-lg md:text-xl">Invoice Preview</p>
            </div>

            {/* Part 2: Invoice Number and Date */}
            <div className="px-4 flex justify-between items-center mt-10">
              <p className="font-bold text-lg underline w-[50%]">{invoiceNumber}</p>
              <p className="text-base text-right w-[50%] mx-1">{date}</p>
            </div>

            {/* Part 3: Customer Info Inputs */}
            <div className="px-4 mt-4 flex flex-col gap-1">
              {/* Name */}
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First_Name Last_name"
                  className="text-[17px] border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none mt-1 w-[200px]"
                  required
                />
                <p className="text-red-500 text-[12px] h-4">{name ? "" : "Name is Required"}</p>
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmail}
                  placeholder="abc123@gmail.com"
                  className="text-[17px] border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none w-[200px]"
                  required
                />
                <p className="text-red-500 text-[12px] h-4">{errorMessage1}</p>
              </div>

              {/* Phone */}
              <div>
                <input
                  type="tel"
                  value={phonenumber}
                  onChange={handlePhone}
                  placeholder="XXXXXXXXXX"
                  maxLength="14"
                  className="text-[17px] border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none w-[200px]"
                  required
                />
                <p className="text-red-500 text-[12px] h-4">{errorMessage}</p>
              </div>
            </div>

            {/* Part 4: Product Table */}
            <div className="px-4 mt-5 h-[170px] w-full overflow-y-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="p-2 border-y-2 border-gray-300">
                    <th className="p-2 w-[40%]">Product</th>
                    <th className="p-2 w-[15%]">QTY</th>
                    <th className="p-2 w-[20%]">Unit Price</th>
                    <th className="p-2 w-[25%]">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>{product.name}</td>
                      <td>{product.qty}</td>
                      <td>{product.unitPrice}</td>
                      <td>{product.qty * product.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Part 5: Totals */}
            <div className="mt-10 mb-0 ml-auto mr-4 w-[250px] min-w-[250px]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <th className="p-2 w-[40%] text-[16px]">SubTotal</th>
                    <td className="pl-11 h-10">₹ {subtotal}</td>
                  </tr>
                  <tr>
                    <th className="p-2 w-[40%] text-[16px]">Discount</th>
                    <td className="pl-11 h-10">₹ {discount}</td>
                  </tr>
                  <tr>
                    <th className="p-2 w-[40%] text-[16px]">Total</th>
                    <td className="pl-11 h-10">₹ {subtotal - discount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Part 6: Footer */}
            <div className="mb-2 mt-auto">
              <hr className="border-t border-gray-300 mt-5 mx-4" />
              <p className="text-center text-sm mt-2">
                THANK YOU FOR SHOPPING WITH US, VISIT AGAIN
              </p>
            </div>
          </div>
        {/* container 1 Ends here */}
        {/* Second Conatainer */}
          <div className="h-[97%] w-[35%] bg-white mt-2 ml-6 mr-10 mb-3 border-gray-300 border-3 shadow-4xl rounded hover:border-gray-200 shadow-md flex flex-col">
             {/* part 1 */}
             <div className="h-[350px] bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 px-3 sm:px-4 md:px-5">
          {products.map((product) => (
            <div key={product.id} className="mb-2">
              {/* Product name and delete button */}
              <div className="flex justify-between items-center py-2">
                <p className="text-sm sm:text-base md:text-[16px]">{product.name}</p>
                <button onClick={() => handleDelete(product.id)}>
                  <i className="fa-solid fa-trash  hover:text-red-800 text-sm md:text-base"></i>
                </button>
              </div>

              {/* Quantity controls and unit price */}
              <div className="flex justify-between items-center">
                <div className="flex items-center bg-white p-1 rounded-lg shadow-md w-[80px] sm:w-[90px] md:w-[100px] h-7">
                  <button
                    onClick={() => decreaseQty(product.id)}
                    className="text-sm bg-white hover:bg-gray-300 text-black font-bold rounded px-1"
                  >
                    –
                  </button>
                  <span className="mx-1 text-sm font-semibold text-black">
                    {product.qty}
                  </span>
                  <button
                    onClick={() => increaseQty(product.id)}
                    className="bg-white hover:bg-gray-300 text-black font-bold rounded px-1"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm sm:text-base">₹{product.unitPrice}</p>
              </div>

              {/* Divider */}
              <hr className="border-t border-gray-300 mt-2" />
            </div>
          ))}
        </div>
        {/* part 2 */}
    {/* part 2 */}
<div className="w-full mt-8 px-2 sm:px-4 md:px-6 overflow-x-auto">
  <div className="min-w-[300px]"> {/* ensures table isn't smaller than a minimum width */}
    <table className="w-full text-center text-[16px]">
      <tbody>
        <tr>
          <th className="py-2 w-[40%] text-left">SubTotal</th>
          <td className="h-10 text-right">₹{subtotal}</td>
        </tr>
        <tr>
           <th
            className="py-2 w-[40%] text-left cursor-pointer"
            onClick={() => discountRef.current?.focus()} // ✅ 2. Focus input on click
          >
            Discount
          </th>
          <td className="h-10 text-right max-w-[120px] sm:max-w-[100px] md:max-w-full overflow-hidden">
            <input
              ref={discountRef} // ✅ 3. Attach ref to input
              type="number"
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-[50%] border-b-2 border-gray-900 outline-none bg-transparent text-right text-[16px] truncate"
            />
          </td>
        </tr>
        <tr>
          <th className="py-2 text-left">Total</th>
          <td className="h-10 text-right">₹{subtotal - discount}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>   

    {/* Button Section */}
    <div className="flex justify-center sm:justify-end gap-4 mt-6 flex-wrap">
      <button
        onClick={handleSave}
        className="h-8 w-25 bg-blue-500 text-white text-center border-2 border-blue-600 rounded hover:bg-white hover:text-black transition"
      >
        Submit
      </button>
      <button
        onClick={handleClear}
        className="h-8 w-25 bg-blue-500 text-white text-center border-2 border-blue-600 rounded hover:bg-white hover:text-black transition"
      >
        Clear
      </button>
    </div>
    {/* Part 6: Footer */}
    <div className="mb-2 mt-auto">
              <hr className="border-t border-gray-300 mt-5 mx-4" />
              <p className="text-center text-sm mt-2">
                THANK YOU FOR SHOPPING 
              </p>
    </div>
    </div>
  </div>
 </div>
 </div>
  );
};
export default Invoice;
