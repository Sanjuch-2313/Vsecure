import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const storageKey = (email) => `vsu_hidden_files_${email}`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) navigate("/login");

    const saved = localStorage.getItem(storageKey(email));
    if (saved) setFiles(JSON.parse(saved));

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navigate]);

  const saveFileState = (next) => {
    const email = localStorage.getItem("email");
    setFiles(next);
    localStorage.setItem(storageKey(email), JSON.stringify(next));
  };

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files || []);
    const results = await Promise.all(
      selected.map(
        (file) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () =>
              res({
                id: Date.now() + file.name,
                name: file.name,
                type: file.type,
                payload: reader.result,
              });
            reader.readAsDataURL(file);
          })
      )
    );
    saveFileState([...files, ...results]);
  };

  const logout = () => {
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <div className="bg-gray-100">

      {/* 🔥 NAVBAR */}
      <nav className={`fixed w-full z-50 transition ${
        scrolled ? "bg-black/40 backdrop-blur-md" : "bg-transparent"
      }`}>
        <div className="flex justify-between items-center px-10 py-4 text-white">
          
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <img src={logo} className="h-10" alt="logo" />
            <h1 className="font-bold text-lg">VSecure</h1>
          </div>

          {/* BUTTON */}
          <button
            onClick={logout}
            className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white hover:text-black transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* 🔥 HERO VIDEO */}
      <div className="h-screen relative">
        <video
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
        >
          <source src="https://www.w3schools.com/howto/rain.mp4" />
        </video>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
          <h1 className="text-5xl font-bold mb-4">
            Secure Your Private Vault
          </h1>

          {/* CENTER + BUTTON */}
          <button
            onClick={() => fileInputRef.current.click()}
            className="mt-6 w-20 h-20 rounded-full bg-green-600 text-4xl hover:scale-110 transition"
          >
            +
          </button>
        </div>
      </div>

      {/* FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* 🔥 HOW IT WORKS */}
      <div className="px-10 py-16">
        <h2 className="text-3xl font-bold mb-8">How it works</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            "Secure Upload",
            "Encrypted Storage",
            "Access Anytime"
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow hover:scale-105 transition">
              <h3 className="text-xl font-semibold">{item}</h3>
              <p className="text-gray-500 mt-2">
                Your data is protected with advanced security layers.
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 FOUNDERS */}
      <div className="px-10 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold mb-8">Our Founders</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {["Sanju", "Hemanth", "Tharun", "Sai Krishna"].map((name, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-300 mb-4"></div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-gray-500">Founder</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 VAULT FILES */}
      <div className="px-10 py-16">
        <h2 className="text-2xl font-bold mb-6">Your Vault</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="bg-white p-4 rounded-xl shadow">
              {file.type?.startsWith("image") && (
                <img src={file.payload} alt="" className="h-40 w-full object-cover rounded" />
              )}
              <p className="mt-2">{file.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 FOOTER */}
      <footer className="bg-black text-white text-center py-6">
        © 2026 VSecure. All rights reserved.
      </footer>

    </div>
  );
};

export default Dashboard;