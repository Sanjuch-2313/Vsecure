import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem(
      "vsu_reg",
      JSON.stringify({ name, email, password })
    );

    alert("Continue with gesture setup to complete registration");
    navigate("/setup-auth");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <button
        onClick={() => navigate("/")}
        className="absolute top-20 left-6 text-gray-600 hover:text-black transition text-lg"
      >
        ← Back
      </button>

      {/* TOP BAR */}
      <div className="flex items-center space-x-2 cursor-pointer">
        <img src={logo} alt="logo" className="h-20" />
        <h1 className="text-xl font-bold"></h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col items-center justify-center flex-grow">

        <h2 className="text-3xl font-semibold mb-6">
          Sign up to secure your account
        </h2>

        {/* SOCIAL BUTTONS */}
        <div className="flex gap-4 mb-6">

          <button className="px-6 py-2 border border-gray-300 rounded-full flex items-center gap-2 hover:bg-gray-50">
             Continue with Apple
          </button>

          <button className="px-6 py-2 bg-blue-500 text-white rounded-full flex items-center gap-2 hover:bg-blue-600">
            Continue with Google
          </button>

        </div>

        {/* DIVIDER */}
        <div className="flex items-center w-[400px] mb-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-3 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* FORM */}
        <div className="w-[400px]">

          {/* NAME */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="First name"
              className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Last name"
              className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Work email address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (8 or more characters)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              onChange={(e) => setPassword(e.target.value)} 
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 cursor-pointer text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </span>
          </div>

          {/* COUNTRY */}
          <select className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>India</option>
            <option>USA</option>
            <option>UK</option>
          </select>

          {/* CHECKBOXES */}
          <div className="flex items-start gap-2 mb-3 text-sm">
            <input type="checkbox"/>
            <p>
              Send me emails with tips on how to improve security.
            </p>
          </div>

          <div className="flex items-start gap-2 mb-4 text-sm">
            <input type="checkbox" />
            <p>
              Yes, I agree to the{" "}
              <span className="text-green-600 cursor-pointer">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-green-600 cursor-pointer">
                Privacy Policy
              </span>
            </p>
          </div>

          {/* BUTTON */}
          <button 
            onClick={handleRegister} 
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Create my account
          </button>

          {/* LOGIN LINK */}
          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Log In
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;