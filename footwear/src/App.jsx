import "./App.css";
import Invoice from "./pages/Invoice.jsx";
import Invoice2 from "./pages/Invoice2.jsx";
import  "./index.css";   
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
function App(){
  return( 
    <Router>
      <Routes>
        <Route path="/" element={<Invoice />} />
        <Route path="/invoice2" element={<Invoice2 />} />
      </Routes>
    </Router>
  );
}

export default App;
