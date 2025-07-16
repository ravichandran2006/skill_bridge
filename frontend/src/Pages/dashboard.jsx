import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resume) {
      alert('Please choose a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', resume);

    try {
      const res = await fetch('http://localhost:5000/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Resume uploaded and parsed!");
        setParsedData(data.extracted);
        console.log("Extracted data:", data.extracted);
      } else {
        alert(data.msg);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload resume.");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">SkillBridge Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="font-medium">Welcome, {user.name} 👋</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Upload Resume */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-2">Upload Resume</h2>
          <label className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700 transition duration-300">
            Choose File
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {resume && <p className="mt-2 text-sm text-gray-600">{resume.name}</p>}
          <button
            onClick={handleUpload}
            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Upload
          </button>
        </div>

        {/* Grid Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-2">Profile</h2>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            {parsedData?.cgpa && <p><strong>CGPA:</strong> {parsedData.cgpa}</p>}
          </div>

          {/* Skills Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-2">Your Skills</h2>
            {parsedData?.skills ? (
              <p>{parsedData.skills}</p>
            ) : (
              <p>No skills extracted yet.</p>
            )}
          </div>

          {/* Known Languages */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-2">Known Languages</h2>
            {parsedData?.known_languages ? (
              <p>{parsedData.known_languages}</p>
            ) : (
              <p>No languages found.</p>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-2">Projects</h2>
            {parsedData?.projects ? (
              <p>{parsedData.projects}</p>
            ) : (
              <p>No project details extracted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
