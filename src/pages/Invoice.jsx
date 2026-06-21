import { useState, useRef, useEffect } from "react";
import negativeImage from "../assets/Negetive2.png";
import id from "../assets/id.png";
import "@fortawesome/react-fontawesome";
import Toggle from "./Toggle.jsx";
import { db } from "./firebase.js";
import { ref, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { dbFirestore } from "./firebase.js";
import { doc, setDoc } from "firebase/firestore";
import validator from "validator";

const Invoice = () => {
  const [display, setdisplay] = useState(false);
  const discountRef = useRef(null);
  const navigate = useNavigate();

  // Accessing values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState("");
  const [productCode, setProductCode] = useState("");
  const [products, setProducts] = useState([]);

  // Barcode dictionary
  const sampleProducts = {
    "123ABC": {
      id: 1,
      name: "puma's Brand new shoes",
      unitPrice: 4000,
      code: "123ABC",
    },
    942933: {
      id: 1,
      name: "Semis Brown Printed Sneaker",
      unitPrice: 3000,
      code: "942933",
    },
    903358: {
      id: 1,
      name: "unisex Brown Printed Sneaker",
      unitPrice: 2000,
      code: "903358",
    },
    635522: {
      id: 1,
      name: "Man's Brown Printed Sneaker",
      unitPrice: 1000,
      code: "635522",
    },
    799010: {
      id: 1,
      name: "WoMan's Brown Printed Sneaker",
      unitPrice: 2000,
      code: "799010",
    },
  };

  // Search logic
  const handleSearch = () => {
    const found = sampleProducts[productCode];
    if (found) {
      setProducts((prev) => [...prev, { ...found, id: Date.now(), qty: 1 }]);
      setProductCode("");
    } else {
      alert("Product not found!");
    }
  };

  // Quantity logic
  const increaseQty = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, qty: product.qty + 1 } : product,
      ),
    );
  };

  const decreaseQty = (id) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id && product.qty > 1
          ? { ...product, qty: product.qty - 1 }
          : product,
      ),
    );
  };

  // Delete logic
  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  // Subtotal logic
  const subtotal = products.reduce(
    (acc, item) => acc + item.unitPrice * item.qty,
    0,
  );

  // Discount
  const [discount, setDiscount] = useState(0);

  // Clear form
  const handleClear = () => {
    setName("");
    setEmail("");
    setPhoneNumber("");
    setDiscount(0);
    setProducts([]);
  };

  // Invoice Number Logic
  function generateRandomString(length = 5) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
      result += randomChar;
    }
    return result;
  }

  const [invoiceNumber] = useState(() => {
    const invoicePrefix = "NOBLE-";
    const uniqueId = generateRandomString(5);
    return invoicePrefix + uniqueId;
  });

  // Save to Firebase
  const handleSave = async () => {
    if (!name.trim()) {
      alert("Please fill in the Customer Name.");
      return;
    }
    if (errorMessage1) {
      alert("Please enter a valid Email address.");
      return;
    }
    if (errorMessage) {
      alert("Please enter a valid 10-digit Phone number.");
      return;
    }
    if (products.length === 0) {
      alert("Please add at least one product before saving.");
      return;
    }

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

    const invoiceId = `${invoiceNumber}_${name.replace(/\s+/g, "")}`;

    // Local Storage save
    window.localStorage.setItem("latestInvoice", JSON.stringify(invoiceData));

    try {
      // Save to Realtime Database
      await set(ref(db, "invoices/invoice1"), invoiceData);

      // Save to Firestore
      await setDoc(doc(dbFirestore, "invoices", invoiceId), invoiceData);

      alert("Invoice saved to Firebase database!");
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(
        "Warning: Invoice data could not be saved to Firebase, but you can still view the preview.",
      );
    }

    navigate("/invoice2", { state: { invoiceData } });
  };

  // Email validation Logic
  const [errorMessage1, setErrorMessage1] = useState("Email is required.");

  const handleEmail = (event) => {
    let value = event.target.value.trim();
    setEmail(value);

    if (value.length === 0) {
      setErrorMessage1("Email is required.");
    } else if (validator.isEmail(value)) {
      setErrorMessage1("");
    } else {
      setErrorMessage1("Enter a valid email address.");
    }
  };

  // Phone validation Logic
  const [errorMessage, setErrorMessage] = useState(
    "Phone number is required.",
  );
  
  const handlePhone = (event) => {
    let value = event.target.value.replace(/\D/g, "");

    if (value.length === 0) {
      setErrorMessage("Phone number is required.");
      setPhoneNumber("");
      return;
    }
    
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    setPhoneNumber(value);
    
    if (value.length === 10) {
      if (/^[6-9]\d{9}$/.test(value)) {
        setErrorMessage("");
      } else {
        setErrorMessage(
          "Phone number must start with 6-9 and be exactly 10 digits.",
        );
      }
    } else {
      setErrorMessage("Phone number must be exactly 10 digits long.");
    }
  };

  // Set default current date
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col w-full text-slate-800">
      
      {/* Premium Sticky Navigation Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-md">
        <div className="h-16 w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <img
              src={negativeImage}
              alt="Logo"
              className="w-16 h-auto object-contain cursor-pointer transition hover:opacity-90"
              onClick={() => navigate("/")}
            />
            <span className="hidden sm:block text-base font-bold text-slate-850 tracking-wide bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
              Noble Footwear Builder
            </span>
          </div>

          {/* Right side: Search bar + Profile */}
          <div className="flex items-center gap-4">
            
            {/* Elegant Scanner Bar */}
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-150/40 transition-all w-48 sm:w-64 md:w-80 shadow-inner">
              <svg
                className="w-4 h-4 text-slate-400 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="text-xs sm:text-sm bg-transparent focus:outline-none placeholder:text-slate-400 w-full text-slate-700"
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Scan barcode or type code..."
              />
            </div>

            {/* Profile Avatar Trigger */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setdisplay(!display)}
                className="flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border border-slate-200 hover:border-slate-350 transition shadow-sm"
              >
                <img
                  src={id}
                  alt="User"
                  className="w-8 h-8 object-cover"
                />
              </button>
              <button
                onClick={() => setdisplay(!display)}
                className="hidden md:block text-sm font-semibold text-slate-700 hover:text-indigo-600 transition cursor-pointer"
              >
                Biller Raju
              </button>
              
              {/* Dropdown Menu */}
              {display && (
                <div className="absolute top-11 right-0 w-64 bg-white border border-slate-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Toggle />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Builder Area */}
      <div className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
          
          {/* Column 1: Live Invoice sheet preview & inputs */}
          <div className="flex flex-col flex-[1.4] bg-white border border-slate-200/70 shadow-md rounded-2xl p-5 md:p-6 transition hover:shadow-lg">
            
            {/* Section Title */}
            <div className="border-b border-slate-100 pb-4 mb-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">
                Invoice Details
              </h2>
              <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 rounded-md">
                Auto-Save Enabled
              </span>
            </div>

            {/* Metadata (Bill No and Date) */}
            <div className="flex justify-between items-center text-xs md:text-sm text-slate-500 font-medium">
              <p className="font-mono bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-100">
                NO: {invoiceNumber}
              </p>
              <p className="font-mono bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-100">
                DATE: {date}
              </p>
            </div>

            {/* Customer Inputs Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {/* Customer Name */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Customer Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First Name Last Name"
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all focus:outline-none"
                  required
                />
                <span className="text-red-500 text-xs mt-1 min-h-[16px]">
                  {name ? "" : "Name is Required"}
                </span>
              </div>

              {/* Email Address */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmail}
                  placeholder="abc123@gmail.com"
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all focus:outline-none"
                  required
                />
                <span className="text-red-500 text-xs mt-1 min-h-[16px]">
                  {errorMessage1}
                </span>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phonenumber}
                  onChange={handlePhone}
                  placeholder="XXXXXXXXXX"
                  maxLength="14"
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all focus:outline-none"
                  required
                />
                <span className="text-red-500 text-xs mt-1 min-h-[16px]">
                  {errorMessage}
                </span>
              </div>
            </div>

            {/* Live Product Table */}
            <div className="mt-6 flex-grow overflow-hidden border border-slate-100 rounded-xl">
              <div className="h-[240px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3 w-[45%]">Product Description</th>
                      <th className="p-3 w-[15%] text-center">QTY</th>
                      <th className="p-3 w-[20%] text-right">Unit Price</th>
                      <th className="p-3 w-[20%] text-right pr-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-slate-450 italic">
                          No items added. Use the search/scan bar to add footwear.
                        </td>
                      </tr>
                    ) : (
                      products.map((product, index) => (
                        <tr key={product.id || index} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 max-w-[180px] truncate" title={product.name}>
                            {product.name}
                          </td>
                          <td className="p-3 text-center font-medium">{product.qty}</td>
                          <td className="p-3 text-right">₹{product.unitPrice}</td>
                          <td className="p-3 text-right pr-4 font-semibold text-slate-800">
                            ₹{product.qty * product.unitPrice}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preview Sheet Totals summary */}
            <div className="mt-6 pt-4 border-t border-slate-100 mb-2 w-full flex justify-end">
              <div className="w-full max-w-[280px] bg-slate-50 border border-slate-100 rounded-xl p-4">
                <table className="w-full text-sm text-slate-600 space-y-1">
                  <tbody>
                    <tr>
                      <th className="text-left font-medium pb-1.5">Gross SubTotal</th>
                      <td className="text-right font-semibold text-slate-800 pb-1.5">₹{subtotal}</td>
                    </tr>
                    <tr>
                      <th className="text-left font-medium pb-1.5">Savings Discount</th>
                      <td className="text-right font-semibold text-emerald-600 pb-1.5">₹{discount}</td>
                    </tr>
                    <tr className="border-t border-slate-200">
                      <th className="text-left font-bold pt-2 text-slate-800">Net Payable</th>
                      <td className="text-right font-bold pt-2 text-slate-900 text-lg">₹{subtotal - discount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Note banner */}
            <div className="border-t border-slate-100 pt-4 mt-auto">
              <p className="text-center text-xs font-semibold text-slate-450 uppercase tracking-widest">
                SHREE NOBLE FOOTWEAR • composition Scheme
              </p>
            </div>
          </div>

          {/* Column 2: Biller Control Side Panel */}
          <div className="flex flex-col flex-[1] bg-white border border-slate-200/70 shadow-md rounded-2xl p-5 md:p-6 transition hover:shadow-lg justify-between">
            
            {/* Header */}
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <span>Selected Footwear</span>
                <span className="bg-indigo-150 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {products.length} Items
                </span>
              </h3>
              
              {/* Product cards list container */}
              <div className="max-h-[300px] lg:max-h-[380px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1 space-y-3">
                {products.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center py-20 text-slate-400">
                    <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <p className="text-sm font-medium">No products added yet</p>
                    <p className="text-xs text-slate-400 mt-1">Use barcode field at top to add items.</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:border-indigo-200 hover:bg-slate-100/30 transition-all shadow-sm">
                      {/* Product Name & Delete */}
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-slate-750 leading-snug truncate flex-grow" title={product.name}>
                          {product.name}
                        </h4>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Remove product"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {/* Quantity controls and price tag */}
                      <div className="flex justify-between items-center mt-3">
                        {/* +/- count selectors */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-8 shadow-sm">
                          <button
                            onClick={() => decreaseQty(product.id)}
                            className="w-7 h-full bg-slate-50 hover:bg-slate-150 text-slate-600 font-bold transition-colors cursor-pointer text-center text-xs"
                          >
                            –
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-slate-800">
                            {product.qty}
                          </span>
                          <button
                            onClick={() => increaseQty(product.id)}
                            className="w-7 h-full bg-slate-50 hover:bg-slate-150 text-slate-600 font-bold transition-colors cursor-pointer text-center text-xs"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Amount</span>
                          <span className="text-sm font-bold text-slate-800">₹{product.qty * product.unitPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Discount Section */}
            <div className="mt-6 border-t border-slate-150/60 pt-4">
              <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <table className="w-full text-sm text-slate-600">
                  <tbody className="space-y-3">
                    <tr>
                      <th className="text-left font-semibold text-slate-700">Gross Amount</th>
                      <td className="text-right font-bold text-slate-800">₹{subtotal}</td>
                    </tr>
                    <tr>
                      <th 
                        className="text-left font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 hover:text-indigo-650 transition-colors"
                        onClick={() => discountRef.current?.focus()}
                      >
                        <span>Applied Discount</span>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </th>
                      <td className="text-right">
                        <div className="relative inline-block">
                          <span className="absolute left-2.5 top-1.5 text-slate-450 font-bold text-xs">₹</span>
                          <input
                            ref={discountRef}
                            type="number"
                            value={discount}
                            onChange={(e) =>
                              setDiscount(
                                e.target.value === ""
                                  ? 0
                                  : Number(e.target.value),
                              )
                            }
                            className="w-[100px] border border-slate-200 rounded-lg outline-none bg-white text-right pl-6 pr-2 py-1 text-sm font-bold text-slate-850 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                          />
                        </div>
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200/80 pt-3">
                      <th className="text-left font-bold text-slate-800 pt-3">Net Bill Payable</th>
                      <td className="text-right font-extrabold text-indigo-700 text-lg pt-3">
                        ₹{subtotal - discount}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleClear}
                  className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer shadow-sm text-center"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1.2 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border border-indigo-600 rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer text-center"
                >
                  Save & Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
