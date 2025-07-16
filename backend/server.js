const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://127.0.0.1:27017/skillbridge';

app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ DB Error:', err));

// ✅ Mongoose User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});
const User = mongoose.model('User', userSchema);

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

    res.status(201).json({ msg: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Error creating user' });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    res.status(200).json({ msg: 'Login successful', user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Login failed' });
  }
});

// ✅ Resume Upload & Extraction
const upload = multer({ dest: 'uploads/' });

app.post('/upload-resume', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    let text = '';

    // OCR for images
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const result = await Tesseract.recognize(filePath, 'eng');
      text = result.data.text;
    }
    // Text extract for PDFs
    else if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      return res.status(400).json({ msg: 'Unsupported file format' });
    }

    fs.unlinkSync(filePath); // Clean up after use

    // === Simple Regex Extraction ===
    const nameMatch = text.match(/name[:\-]?\s*([A-Za-z ]{3,})/i);
    const skillsMatch = text.match(/skills?[:\-]?\s*([A-Za-z0-9,.\s]+)/i);
    const languageMatch = text.match(/languages? known[:\-]?\s*([A-Za-z,\s]+)/i);
    const projectMatch = text.match(/projects?[:\-]?\s*([\s\S]{10,200})/i);
    const cgpaMatch = text.match(/(?:cgpa|gpa)[:\-]?\s*([\d.]+)/i);

    res.json({
      msg: 'Resume parsed successfully',
      extracted: {
        name: nameMatch?.[1]?.trim() || 'Not found',
        skills: skillsMatch?.[1]?.trim() || 'Not found',
        known_languages: languageMatch?.[1]?.trim() || 'Not found',
        projects: projectMatch?.[1]?.trim() || 'Not found',
        cgpa: cgpaMatch?.[1]?.trim() || 'Not found',
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to process resume' });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
