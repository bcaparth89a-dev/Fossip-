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
import Invoice2 from "./Invoice2.jsx";

const Invoice = () => {
  const [display, setdisplay] = useState(false);

const navigate = useNavigate(); // Initialize useNavigate here
    // accessing value
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [phonenumber,setPhoneNumber]=useState();
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

   // Construct a unique ID (e.g. "INV1234_JohnDoe")
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

  // Phonne number logic 
  const handlePhone = (event) => {
    let value = event.target.value.replace(/\D/g, ""); // Allow only digits

    // Ensure only 10 digits after +91
    if (value.length <= 10) {
      setPhoneNumber(value);
    } 
  }
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
      <div className="opacity-100  bg-white-400 w-[100%] h-auto  justify-center md:w-full md:h-[3%] border-b-3 border-b-gray-100 flex items-center hover:border-gray-200">
        {/* 1 */}
        <div className="ml-7 justify-center">
          <img
            src={negativeImage}
            alt="Logo"
            className="w-25 h-auto object-cover ml-1"
          />
        </div>
        {/* 2 */}
        <div className="h-8 flex items-center justify-between border border-gray-300  rounded-lg p-2 w-auto max-w-sm mr-0 ml-auto shadow-lg border:width-1 mr-2 hover:border-gray-800 hover:bg-gray-100">
          <svg
            className="w-4 h-4 text-gray-500 flex items-center hover:border-gray-800 border-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M12.9 14.32a8 8 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414l-4.243-4.243zM8 14a6 6 0 100-12 6 6 0 000 12z"
              clipRule="evenodd"
            ></path>
          </svg>
          <input
            type="text"
            className="focus:outline-none focus:ring-0"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Scan barcode or type code"
          />
        </div>
        {/* 3 */}
        <div className="flex items-center ml-3 mr-10 mt-1 mb-1 hover:text-black">
          <button onClick={() => setdisplay(!display)}>
            <img
              src={id}
              alt="Logo"
              className="w-8 h-8 border border-gray-400 rounded mr-1"
            />
          </button>
          <button
            onClick={() => setdisplay(!display)}
            className="text-gray-700 hover:text-gray-950"
          >
            Biller, Raju Bhai
          </button>
        </div>
        {display && (
          <div
            className="ml-260 mt-10 h-[60px] w-[300px] fixed top-10 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow"
            style={{ left: "320px" }}
          >
            <Toggle />
          </div>
        )}
      </div>
      {/* End of Nav Bar */}
      {/* Invoice part starts from here */}
      <div className="bg-gray-200 w-400S h-180  flex items-center justify-center   ">
        {/* First Container */}
        <div className=" h-[97%] w-[75%] bg-white mt-2 ml-10 mr-4 mb-3 border-gray-300 border-3 shadow-4xl rounded hover:border-gray-200 shadow-md">
          <div className="ml-[10px] flex items-center justify-between mt-3">
            {/* Left-aligned title  Invoice Provider*/}
            <div className="flex items-center ml-2">
              <p className="font-bold text-[20px]">Invoice Preview</p>
            </div>
          </div>
          {/* part 2 */}
          <div className="ml-[18px] flex items-center justify-between mt-13">
            {/* Left-aligned Invoice Number */}
            <div className="flex flex-col">
              <p className="h-6 border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none justify-center text-[17px] font-bold placeholder:font-normal placeholder:text-gray-400 w-35 ">
                {invoiceNumber}
              </p>
            </div>
            {/* right aligned date input   */}
            <div className="flex flex-col">
              <input
                type="date"
                value={date}
                readOnly
                className="h-8 w-[100%] border-none focus:outline-none justify-center text-blue gap-4 text-[15px] cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Part 3 */}
          <div className="ml-[18px] ">
            <p className="text-[16px] mt-2 ">Name </p>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="First_Name Last_name"
              className="text-[16px] border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none justify-center mt-1 w-40"
              required
            />
            <p className="text-red-500 text-[12px]">
              {name ? "" : "Name is Required"}
            </p>
            <input
              type="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="abc123@gmail.com"
              className="mt-1 text-[16px] border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none justify-center w-38"
              required
            />
            <p className="data text-red-500 text-[12px]">
              {email ? "" : "Eamil is Required"}
            </p>
            <input
              type="tel"
              value={phonenumber}
              onChange={handlePhone}
              placeholder="+91 XXXXXXXXXX"
              maxLength="10"
              className="mt-1 text-[16px] border-0 border-b-2 border-b-gray-300 focus:border-b-gray-400 focus:outline-none justify-center w-38"
              required
            />
            <p className="data text-red-500 text-[12px]">
              {phonenumber ? "" : "Phone number is Required"}
            </p>
          </div>

          {/* Part 4 */}
          <div className="mt-5 ml-[18px] mr-[18px] h-[170px] w-auto overflow-y-auto">
            <table className="w-full text-left">
              <tr className="p-2 border-gray-300 border-y-2">
                <th className="p-2 w-[40%]">Product</th>
                <th className="p-2 w-[15%]">QTY</th>
                <th className="p-2 w-[20%]">Unit Price</th>
                <th className="p-2 w-[25%]">Total Price</th>
              </tr>
              {products.map((product) => (
                <tr>
                  <td className="">{product.name}</td>
                  <td className="">{product.qty}</td>
                  <td className="">{product.unitPrice}</td>
                  <td className="">{product.qty * product.unitPrice}</td>
                </tr>
              ))}
            </table>
          </div>
          {/* Part 5 */}
          <div className="h-[120px] w-[250px] mr-[15px] ml-auto mb-0 mt-10">
            <table className="w-[100%]">
              <tr className="">
                <th className="p-2 w-[40%]" style={{ fontSize: "16px" }}>
                  SubTotal
                </th>
                <td className="pl-11 h-10">₹ {subtotal}</td>
              </tr>
              <tr className="">
                <th className="p-2 w-[40%]" style={{ fontSize: "16px" }}>
                  Discount
                </th>
                <td className="pl-11 h-10">₹{discount}</td>
              </tr>
              <tr className="">
                <th className="p-2 w-[40%]" style={{ fontSize: "16px" }}>
                  Total
                </th>
                <td
                  onChange={(event) => setName(event.target.value)}
                  className="pl-11 h-10"
                >
                  ₹{subtotal - discount}
                </td>
              </tr>
            </table>
          </div>
          {/* Part 7 */}
          <div className="mb-[0px] mt-auto">
            <hr className="border-t border-gray-300 mt-7 mr-[18px] ml-[18px]" />
            <p className="mt text-2 text-center">
              THANK YOU FOR SHOPPING WITH US ,VISIT AGAIN{" "}
            </p>
          </div>
        </div>
        {/* container 1 Ends here */}
        {/* Second Conatainer */}
        <div className="h-[97%] w-[25%] bg-white mt-2 ml-3 mr-10 mb-3 border-gray-300 border-3 shadow-4xl rounded hover:border-gray-200 shadow-md">
          {/* part 1 */}
          <div className="h-[350px] bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {products.map((product) => (
              <div key={product.id}>
                <div className="flex justify-between items-center ml-[18px] mr-[18px] py-2">
                  <p>{product.name}</p>
                  <button onClick={() => handleDelete(product.id)}>
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
                <div className="flex justify-between items-center ml-[18px] mr-[18px]">
                  <div className="flex bg-white text-white p-1 rounded-lg shadow-md w-11 h-7">
                    <button
                      onClick={() => decreaseQty(product.id)}
                      className="text-[15px] bg-white hover:bg-gray-300 text-black font-bold rounded-lg"
                    >
                      –
                    </button>
                    <span className="mx-1 text-[15px] font-semibold bg-white text-black rounded-md shadow-inner">
                      {product.qty}
                    </span>
                    <button
                      onClick={() => increaseQty(product.id)}
                      className=" bg-white hover:bg-gray-300 text-black font-bold rounded-lg"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-15">₹{product.unitPrice}</p>
                </div>
                <div>
                  <hr className="border-t border-gray-400 mt-2 mr-[19px] ml-[18px]" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-[120px] w-[260px] mr-[15px] ml-auto mb-0 mt-16">
            <table className="w-[100%]">
              <tr>
                <th
                  className="p-2 w-[40%] text-center"
                  style={{ fontSize: "16px" }}
                >
                  SubTotal
                </th>
                <td className="h-10 text-center">
                  <div>₹ {subtotal}</div>
                </td>
              </tr>
              <tr>
                <th
                  className="p-2 w-[40%] text-center"
                  style={{ fontSize: "16px" }}
                >
                  Discount
                </th>
                <td className="h-10 text-center">
                  <div>
                    <input
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      type="number"
                      className="w-20 ml-14 border-b-2 border-gray-300 outline-none bg-transparent "
                    ></input>
                  </div>
                </td>
              </tr>
              <tr>
                <th
                  className="p-2 w-[40%] text-center"
                  style={{ fontSize: "16px" }}
                >
                  Total
                </th>
                <td className="h-10 text-center">
                  <div>₹{subtotal - discount}</div>
                </td>
              </tr>
            </table>
          </div>
          <div className="mt-6">
            <button onClick={handleSave} className="hover:bg-white hover:text-black ml-19 mr-10 h-8 w-20  bg-blue-500 text-white text-center border-2 border-blue-600 rounded ">
              Submit
            </button>
            <button
              onClick={handleClear}
              className="h-8 w-20  bg-blue-500 text-white text-center border-2 border-blue-600 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Invoice;
