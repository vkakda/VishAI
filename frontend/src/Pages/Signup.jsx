import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch {
      alert("Error during signup.");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4 text-center">Signup</h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 mb-3 w-full rounded"
        />
        <button className="bg-indigo-500 text-white py-2 w-full rounded hover:bg-indigo-600">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
