import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Complete fields");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("email", email);
      if (data.needsGesture) {
        alert("Please verify gesture to complete login");
        navigate("/verify-auth");
      } else {
        alert("Login successful");
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
<button
  onClick={() => navigate("/")}
  className="absolute top-20 left-6 text-gray-600 hover:text-black transition text-lg"
>
  ← Back
</button>
      {/* TOP LOGO */}
      <div className="flex items-center space-x-2 cursor-pointer">
            <img src={logo} alt="logo" className="h-20" />
            <h1 className="text-xl font-bold"></h1>
          </div>

      {/* LOGIN CARD */}
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-white w-[400px] p-8 rounded-xl shadow-md">

          <h2 className="text-2xl font-semibold text-center mb-6">
            Log in to VSecure
          </h2>

          {/* INPUT */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* CONTINUE BUTTON */}
          <button
            onClick={handleLogin}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Continue
          </button>

          {/* DIVIDER */}
          <div className="flex items-center my-5">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-3 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* GOOGLE */}
          <button className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-3">
            <img
              src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
              alt="google"
              className="h-5"
            />
            Continue with Google
          </button>

          {/* APPLE */}
          <button className="w-full border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition">
             Continue with Apple
          </button>

          {/* SIGNUP */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?
          </p>

          <Link to="/register">
            <button className="w-full mt-2 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition">
              Sign Up
            </button>
          </Link>

        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-black text-white text-center py-6 text-sm">
        © 2026 VSecure · Privacy Policy · Terms
      </div>

    </div>
  );
};

export default Login;