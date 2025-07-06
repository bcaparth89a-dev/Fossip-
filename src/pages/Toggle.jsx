import React, { useRef, useState, useEffect } from "react";
import axios from "axios";

function Toggle() {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);

  const cloudName = "dye4ypaqp";
  const uploadPreset = "invoices2";

  useEffect(() => {
    const savedImage = localStorage.getItem("profileImage");
    console.log("Retrieved Image from localStorage:", savedImage); // Debugging step
    if (savedImage && savedImage.startsWith("https")) {
      setImagePreview(savedImage);
    }
  }, []);

  const handleLogoClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "profile_photos");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      const { secure_url } = response.data;
      if (secure_url) {
        setImagePreview(secure_url);
        localStorage.setItem("profileImage", secure_url); // ✅ Store Cloudinary URL
        console.log("Saved Image to localStorage:", secure_url); // Debugging step
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      <div className="max-w-sm mx-auto bg-white shadow-md rounded-lg p-4 flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div
            className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleLogoClick}
            title="Click to upload photo"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Uploaded" className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div>
          <div className="text-xl font-medium text-black">Personal</div>
          <div className="text-gray-500">Raju Bhai Biller</div>
          <div className="flex items-center text-green-500 mt-1">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Sync is on
          </div>
        </div>
        <div className="ml-auto">
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 7a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 00-2 2v7a2 2 0 004 0v-7a2 2 0 00-2-2zm-6 2a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 00-2 2v7a2 2 0 004 0v-7a2 2 0 00-2-2zm12-2a2 2 0 110-4 2 2 0 010 4zm0 2a2 2 0 00-2 2v7a2 2 0 004 0v-7a2 2 0 00-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toggle;
