import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("/users/login", { email, password });
      console.log("login response:", res.data);

      localStorage.setItem("token", res.data.token);
      const payload = JSON.parse(atob(res.data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);

      if (payload.role === "admin") navigate("/admin");
      else if (payload.role === "manager") navigate("/manager");
      else navigate("/user");
    } catch (err) {
      console.error(err);
      setMessage("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-sky-500 p-6">
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md 
        hover:shadow-[0_0_35px_rgba(255,255,255,0.9)] transition-all duration-300">

        <h1 className="text-3xl font-extrabold text-indigo-600 text-center mb-4">
          Welcome Back 👋
        </h1>

        {message && (
          <p className="text-red-600 text-center mb-3 font-medium">{message}</p>
        )}

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded-lg w-full mb-3 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded-lg w-full mb-4 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold 
          hover:scale-105 shadow-xl transition-all"
        >
          Login
        </button>

        <p className="text-center mt-4 text-white font-medium">
          Don’t have an account?{" "}
          <button
            className="underline hover:text-yellow-300"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
