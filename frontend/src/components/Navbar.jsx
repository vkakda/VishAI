import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="font-bold text-xl text-indigo-600">
        VishAI
      </h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-indigo-500">Home</Link>
        {!token ? (
          <>
            <Link to="/login" className="hover:text-indigo-500">Login</Link>
            <Link to="/signup" className="hover:text-indigo-500">Signup</Link>
          </>
        ) : (
          <>
            <Link to="/chat" className="hover:text-indigo-500">Chat</Link>
            <button
              onClick={handleLogout}
              className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
