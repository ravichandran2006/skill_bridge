import React from 'react';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-200 text-gray-800">
      <div className="bg-white shadow-xl rounded-xl p-10 max-w-lg text-center">
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">Welcome to SkillBridge 🚀</h1>
        <p className="text-lg mb-6">
          Your personalized skill gap analyzer & job recommendation platform.
        </p>

        <div className="flex flex-col gap-3">
          <Link to="/login">
            <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition">
              Signup
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
