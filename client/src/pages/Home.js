import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Home = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition duration-300 ${
          scrolled
            ? "bg-black/20 backdrop-blur-md"
            : "bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm"
        }`}
      >
        <div className="flex justify-between items-center px-10 py-4 text-white">

          {/* LOGO */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <img src={logo} alt="logo" className="h-10" />
            <h1 className="text-xl font-bold"></h1>
          </div>

          {/* BUTTONS */}
          <div className="flex items-center space-x-4">

            <Link to="/login">
              <button className="px-5 py-2 text-white border border-white rounded-lg hover:bg-white hover:text-black transition duration-300">
                Login
              </button>
            </Link>

            <Link to="/register">
              <button className="relative px-5 py-2 text-white font-semibold rounded-lg overflow-hidden group">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:scale-110 transition duration-300"></span>
                <span className="relative z-10">Sign Up</span>
              </button>
            </Link>

          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="px-10 pt-24">
        <div className="relative max-w-[1200px] mx-auto rounded-3xl overflow-hidden shadow-xl">

          {/* IMAGE */}
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
            alt="hero"
            className="w-full h-[520px] object-cover"
          />

          {/* GRADIENT OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

          {/* CONTENT */}
          <div className="absolute inset-0 flex flex-col justify-center px-12 text-white">

            <h1 className="text-5xl font-bold max-w-xl leading-tight mb-4">
              Secure your digital identity with next-gen authentication
            </h1>

            <p className="text-lg opacity-80 mb-6 max-w-md">
              Protect users with advanced multi-layer security systems
            </p>

            {/* TOGGLE (NOW WORKING) */}
            <div className="flex bg-white/20 backdrop-blur-md rounded-full p-1 w-fit mb-4">

              <Link to="/login">
                <button className="px-6 py-2 bg-white text-black rounded-full font-medium">
                  Login
                </button>
              </Link>

              <Link to="/register">
                <button className="px-6 py-2 text-white">
                  Register
                </button>
              </Link>

            </div>

            {/* SEARCH BAR */}
            <div className="flex items-center bg-white rounded-full overflow-hidden w-[500px] shadow-lg">

              <input
                type="text"
                placeholder="Enter your email..."
                className="flex-1 px-5 py-3 text-black outline-none"
              />

              <Link to="/login">
                <button className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition">
                  Continue
                </button>
              </Link>

            </div>

            {/* TAGS */}
            <div className="flex space-x-3 mt-4">
              <span className="border border-white px-3 py-1 rounded-full text-sm">
                Face ID
              </span>
              <span className="border border-white px-3 py-1 rounded-full text-sm">
                OTP
              </span>
              <span className="border border-white px-3 py-1 rounded-full text-sm">
                Device Auth
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* EXTRA SECTION */}
      <div className="h-screen flex items-center justify-center">
        <h2 className="text-3xl font-semibold">More Features Coming...</h2>
      </div>
{/* FOOTER */}
      <div className="bg-black text-white text-center py-6 text-sm">
        © 2026 VSecure · Privacy Policy · Terms
      </div>
    </div>
    
  );
};

export default Home;